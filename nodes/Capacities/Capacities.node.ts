import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { CapacitiesClient } from './client/client';
import {
  blocksDescription,
  markdownDescription,
  mediaDescription,
  objectDescription,
  objectsDescription,
  spaceDescription,
} from './descriptions';

export class Capacities implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Capacities',
    name: 'capacities',
    icon: 'file:capacities.svg',
    group: ['transform'],
    version: 1,
    description: 'Read and write objects, blocks, and media in a Capacities space',
    defaults: { name: 'Capacities' },
    inputs: ['main'],
    outputs: ['main'],
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
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const { baseUrl } = await this.getCredentials('capacitiesApi');
    const client = new CapacitiesClient(baseUrl as string, (options) =>
      this.helpers.httpRequestWithAuthentication.call(this, 'capacitiesApi', options),
    );

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;
      const key = `${resource}.${operation}`;
      const body = () => this.getNodeParameter('body', i) as IDataObject;
      const str = (name: string) => this.getNodeParameter(name, i) as string;
      const page = () => [str('cursor') || undefined, this.getNodeParameter('pageSize', i) as number] as const;
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
        case 'object.create':
          response = await client.object.create(body());
          break;
        case 'object.update':
          response = await client.object.update(body());
          break;
        case 'object.delete':
          response = await client.object.delete(str('id'), this.getNodeParameter('hardDelete', i) as boolean);
          break;
        case 'object.createFromUrl':
          response = await client.object.createFromUrl(body());
          break;
        case 'object.createFromMedia': {
          const name = str('binaryPropertyName');
          const binary = items[i].binary?.[name];
          if (!binary) {
            throw new NodeOperationError(this.getNode(), `No binary data in property "${name}"`, { itemIndex: i });
          }
          const collections = str('collections')
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
          response = await client.object.createFromMedia({
            buffer: await this.helpers.getBinaryDataBuffer(i, name),
            fileName: binary.fileName ?? 'file',
            mimeType: binary.mimeType,
            title: str('title') || undefined,
            collections: collections.length ? collections : undefined,
          });
          break;
        }
        case 'media.init':
          response = await client.object.media.init(body());
          break;
        case 'media.uploadPart': {
          const name = str('binaryPropertyName');
          response = await client.object.media.uploadPart(
            str('id'),
            this.getNodeParameter('partNumber', i) as number,
            await this.helpers.getBinaryDataBuffer(i, name),
          );
          break;
        }
        case 'media.complete':
          response = await client.object.media.complete(str('id'));
          break;
        case 'media.abort':
          response = await client.object.media.abort(str('id'));
          break;
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
        case 'blocks.append':
          response = await client.blocks.append(body());
          break;
        case 'blocks.dailyNoteAppend':
          response = await client.blocks.dailyNote.append(body());
          break;
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
