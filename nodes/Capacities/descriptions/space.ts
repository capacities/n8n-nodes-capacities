import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['space'] };

export const spaceDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show },
    options: [
      { name: 'Get', value: 'get', action: 'Get the space' },
      { name: 'Get Structures', value: 'structures', action: 'Get space structures' },
    ],
    default: 'get',
  },
];
