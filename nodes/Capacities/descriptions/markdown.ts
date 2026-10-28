import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['markdown'] };

export const markdownDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show },
    options: [
      { name: 'Create', value: 'create', action: 'Create an object from markdown' },
      { name: 'Get', value: 'get', action: 'Get an object as markdown' },
      { name: 'Update', value: 'update', action: 'Update an object from markdown' },
    ],
    default: 'get',
  },
  {
    displayName: 'Object ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { ...show, operation: ['get', 'update'] } },
  },
  {
    displayName: 'Structure ID',
    name: 'structureId',
    type: 'string',
    required: true,
    default: 'RootPage',
    placeholder: 'e.g. RootPage',
    description:
      'Built-in ID such as RootPage, or the UUID of a custom structure from Get Structures. This is not an object ID.',
    displayOptions: { show: { ...show, operation: ['create'] } },
  },
  {
    displayName: 'Markdown',
    name: 'markdown',
    type: 'string',
    typeOptions: { rows: 8 },
    required: true,
    default: '',
    description: 'Markdown content. For Update, include YAML frontmatter with the properties to change.',
    displayOptions: { show: { ...show, operation: ['create', 'update'] } },
  },
];
