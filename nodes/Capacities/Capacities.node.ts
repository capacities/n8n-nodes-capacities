import {
  NodeConnectionTypes,
  NodeOperationError,
  type IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeType,
  type INodeTypeDescription,
} from 'n8n-workflow';
import { CapacitiesClient } from './client/client';
import {
  blocksDescription,
  markdownDescription,
  mediaDescription,
  objectDescription,
  objectsDescription,
  requestBodyDescription,
  spaceDescription,
} from './descriptions';

export class Capacities implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Capacities',
    name: 'capacities',
    icon: {
      light: 'file:capacities.svg',
      dark: 'file:capacities.dark.svg',
    },
    group: ['transform'],
    version: 1,
    description: 'Read and write objects, blocks, and media in a Capacities space',
    defaults: { name: 'Capacities' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
    credentials: [{ name: 'capacitiesApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Block', value: 'blocks' },
          { name: 'Markdown', value: 'markdown' },
          { name: 'Media', value: 'media' },
          { name: 'Object', value: 'object' },
          { name: 'Object Query', value: 'objects' },
          { name: 'Space', value: 'space' },
        ],
        default: 'space',
      },
      ...spaceDescription,
      ...objectDescription,
      ...mediaDescription,
      ...markdownDescription,
      ...objectsDescription,
      ...blocksDescription,
      ...requestBodyDescription,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const { baseUrl } = await this.getCredentials('capacitiesApi');
    const client = new CapacitiesClient(
      baseUrl as string,
      (options) => this.helpers.httpRequestWithAuthentication.call(this, 'capacitiesApi', options),
      this.getNode(),
    );

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;
      const key = `${resource}.${operation}`;
      const str = (name: string) => this.getNodeParameter(name, i) as string;
      const jsonValue = (value: unknown, label: string): unknown => {
        if (typeof value !== 'string') return value;
        try {
          return JSON.parse(value);
        } catch (error) {
          throw new NodeOperationError(this.getNode(), `${label} is not valid JSON`, {
            itemIndex: i,
            description: error instanceof Error ? error.message : undefined,
          });
        }
      };
      const body = (): IDataObject => {
        const parsed = jsonValue(this.getNodeParameter('body', i, '{}'), 'Body (JSON)');
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new NodeOperationError(this.getNode(), 'Body (JSON) must be a JSON object', { itemIndex: i });
        }
        return parsed as IDataObject;
      };
      const appendFields = (): IDataObject => {
        const contentType = this.getNodeParameter('appendContent', i, 'markdown') as string;
        const markdown = (this.getNodeParameter('appendMarkdown', i, '') as string).trim();
        const legacy = body();
        if (contentType === 'blocks') {
          const blocks = jsonValue(this.getNodeParameter('appendBlocks', i, '[]'), 'Blocks (JSON)');
          if (Array.isArray(blocks) && blocks.length > 0) return { blocks: blocks as IDataObject[] };
          if (Array.isArray(legacy.blocks) && legacy.blocks.length > 0) return { blocks: legacy.blocks as IDataObject[] };
          throw new NodeOperationError(this.getNode(), 'Blocks (JSON) must be a non-empty array of blocks', {
            itemIndex: i,
          });
        }
        if (markdown) return { markdown };
        if (typeof legacy.markdown === 'string' && legacy.markdown.length > 0) return { markdown: legacy.markdown };
        if (Array.isArray(legacy.blocks) && legacy.blocks.length > 0) return { blocks: legacy.blocks as IDataObject[] };
        throw new NodeOperationError(this.getNode(), 'Enter markdown, or switch Content to Blocks', { itemIndex: i });
      };
      const page = () => {
        const cursor = (this.getNodeParameter('cursor', i, '') as string).trim();
        const pageSize = this.getNodeParameter('pageSize', i, 100) as number;
        return [cursor || undefined, pageSize] as const;
      };
      let response: unknown;

      switch (key) {
        case 'space.get':
          response = await client.space.get();
          break;
        case 'space.structures':
          response = await client.space.structures();
          break;
        case 'object.get':
          response = await client.object.get(str('id'));
          break;
        case 'object.create': {
          const structureId = (this.getNodeParameter('structureId', i, '') as string).trim();
          response = await client.object.create({
            ...body(),
            ...(structureId ? { structureId } : {}),
          });
          break;
        }
        case 'object.update':
          response = await client.object.update(body());
          break;
        case 'object.delete':
          response = await client.object.delete(str('id'), this.getNodeParameter('hardDelete', i) as boolean);
          break;
        case 'object.createFromUrl':
          response = await client.object.createFromUrl(body());
          break;
        case 'media.upload': {
          const name = str('binaryPropertyName');
          const binary = items[i].binary?.[name];
          if (!binary) {
            throw new NodeOperationError(this.getNode(), `No binary data in property "${name}"`, { itemIndex: i });
          }
          const collections = str('collections')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
          response = await client.media.upload({
            buffer: await this.helpers.getBinaryDataBuffer(i, name),
            fileName: str('fileName').trim() || binary.fileName || 'file',
            mimeType: binary.mimeType,
            title: str('title').trim() || undefined,
            collections: collections.length ? collections : undefined,
          });
          break;
        }
        case 'markdown.get':
          response = await client.object.markdown.get(str('id'));
          break;
        case 'markdown.create':
          response = await client.object.markdown.create({ structureId: str('structureId'), markdown: str('markdown') });
          break;
        case 'markdown.update':
          response = await client.object.markdown.update({ id: str('id'), markdown: str('markdown') });
          break;
        case 'objects.search':
          response = await client.objects.search(body());
          break;
        case 'objects.structure':
          response = await client.objects.structure(str('id'), ...page());
          break;
        case 'objects.tag':
          response = await client.objects.tag(str('id'), ...page());
          break;
        case 'objects.collection':
          response = await client.objects.collection(str('id'), ...page());
          break;
        case 'blocks.append': {
          const legacy = body();
          const objectId =
            (this.getNodeParameter('objectId', i, '') as string).trim() ||
            (typeof legacy.id === 'string' ? legacy.id : '');
          if (!objectId) {
            throw new NodeOperationError(this.getNode(), 'Object ID is required', { itemIndex: i });
          }
          response = await client.blocks.append({ id: objectId, ...appendFields() });
          break;
        }
        case 'blocks.dailyNoteAppend': {
          const legacy = body();
          const date =
            (this.getNodeParameter('date', i, '') as string).trim() ||
            (typeof legacy.date === 'string' ? legacy.date : '');
          const noTimeStamp = this.getNodeParameter('noTimeStamp', i, legacy.noTimeStamp === true) as boolean;
          response = await client.blocks.dailyNote.append({
            ...appendFields(),
            ...(date ? { date } : {}),
            noTimeStamp,
          });
          break;
        }
        case 'blocks.delete':
          response = await client.blocks.block.delete(str('objectId'), str('blockId'));
          break;
        case 'blocks.update':
          response = await client.blocks.block.update(body());
          break;
        default:
          throw new NodeOperationError(this.getNode(), `Unsupported operation ${key}`, { itemIndex: i });
      }

      returnData.push({ json: (response ?? {}) as IDataObject, pairedItem: { item: i } });
    }

    return [returnData];
  }
}
