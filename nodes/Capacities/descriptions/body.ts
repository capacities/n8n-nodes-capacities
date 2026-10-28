import type { INodeProperties } from 'n8n-workflow';

export const requestBodyDescription: INodeProperties[] = [
  {
    displayName: 'Body (JSON)',
    name: 'body',
    type: 'json',
    default: '{}',
    description:
      'JSON object sent as the request body. Create takes Structure ID from its own field. Search accepts query, structureIds, and limit.',
    displayOptions: {
      show: {
        resource: ['object', 'objects', 'blocks'],
        operation: ['create', 'update', 'createFromUrl', 'search'],
      },
    },
  },
];
