import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { CapacitiesClient } from './client/client';

export class Capacities implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Capacities',
    name: 'capacities',
    group: ['transform'],
    icon: 'file:capacities.svg',
    version: 1,
    description: 'Read and write objects in a Capacities space',
    defaults: { name: 'Capacities' },
    inputs: ['main'],
    outputs: ['main'],
    usableAsTool: true,
    credentials: [{ name: 'capacitiesApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Object', value: 'object' },
          { name: 'Space', value: 'space' },
        ],
        default: 'space',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['space'] } },
        options: [
          { name: 'Get', value: 'get', action: 'Get the space' },
          { name: 'Get Structures', value: 'structures', action: 'Get space structures' },
        ],
        default: 'get',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['object'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create an object' },
          { name: 'Delete', value: 'delete', action: 'Delete an object' },
          { name: 'Get', value: 'get', action: 'Get an object' },
        ],
        default: 'get',
      },
      {
        displayName: 'Object ID',
        name: 'objectId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: { show: { resource: ['object'], operation: ['get', 'delete'] } },
      },
      {
        displayName: 'Body (JSON)',
        name: 'body',
        type: 'json',
        default: '{}',
        description: 'Request body for creating an object: structureId, collections, properties, and blocks',
        displayOptions: { show: { resource: ['object'], operation: ['create'] } },
      },
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
      let response: unknown;

      if (resource === 'space' && operation === 'get') response = await client.space.get();
      else if (resource === 'space' && operation === 'structures') response = await client.space.structures();
      else if (resource === 'object' && operation === 'get')
        response = await client.object.get(this.getNodeParameter('objectId', i) as string);
      else if (resource === 'object' && operation === 'delete')
        response = await client.object.delete(this.getNodeParameter('objectId', i) as string);
      else if (resource === 'object' && operation === 'create') {
        const body = this.getNodeParameter('body', i) as IDataObject;
        response = await client.object.create(body);
      } else throw new NodeOperationError(this.getNode(), `Unsupported operation ${resource}.${operation}`, { itemIndex: i });

      returnData.push({ json: (response ?? {}) as IDataObject, pairedItem: { item: i } });
    }

    return [returnData];
  }
}
