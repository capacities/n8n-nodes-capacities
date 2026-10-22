import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['object'] };

export const objectDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show },
    options: [
      { name: 'Create', value: 'create', action: 'Create an object' },
      { name: 'Create From Media', value: 'createFromMedia', action: 'Create an object from a binary file' },
      { name: 'Create From URL', value: 'createFromUrl', action: 'Create an object from a URL' },
      { name: 'Delete', value: 'delete', action: 'Delete an object' },
      { name: 'Get', value: 'get', action: 'Get an object' },
      { name: 'Update', value: 'update', action: 'Update an object' },
    ],
    default: 'get',
  },
  {
    displayName: 'Object ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { ...show, operation: ['get', 'delete'] } },
  },
  {
    displayName: 'Hard Delete',
    name: 'hardDelete',
    type: 'boolean',
    default: false,
    description: 'Whether to permanently delete the object instead of moving it to trash',
    displayOptions: { show: { ...show, operation: ['delete'] } },
  },
  {
    displayName: 'Body (JSON)',
    name: 'body',
    type: 'json',
    default: '{}',
    description: 'Request body. See the Capacities API reference for the schema of each operation.',
    displayOptions: { show: { ...show, operation: ['create', 'update', 'createFromUrl'] } },
  },
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    default: 'data',
    description: 'Name of the binary property that holds the file to upload',
    displayOptions: { show: { ...show, operation: ['createFromMedia'] } },
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    default: '',
    description: 'Optional object title. Defaults to the file name.',
    displayOptions: { show: { ...show, operation: ['createFromMedia'] } },
  },
  {
    displayName: 'Collections',
    name: 'collections',
    type: 'string',
    default: '',
    description: 'Comma-separated collection IDs to add the object to',
    displayOptions: { show: { ...show, operation: ['createFromMedia'] } },
  },
];
