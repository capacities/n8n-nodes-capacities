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
    displayName: 'Structure ID',
    name: 'structureId',
    type: 'string',
    default: 'RootPage',
    placeholder: 'e.g. RootPage',
    description:
      'Built-in ID such as RootPage, or the UUID of a custom structure from Get Structures. This is not an object ID.',
    displayOptions: { show: { ...show, operation: ['create'] } },
  },
];
