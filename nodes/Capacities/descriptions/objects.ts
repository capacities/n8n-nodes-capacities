import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['objects'] };

export const objectsDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show },
    options: [
      { name: 'List by Collection', value: 'collection', action: 'List objects by collection' },
      { name: 'List by Structure', value: 'structure', action: 'List objects by structure' },
      { name: 'List by Tag', value: 'tag', action: 'List objects by tag' },
      { name: 'Search', value: 'search', action: 'Search objects' },
    ],
    default: 'search',
  },
  {
    displayName: 'ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. RootPage',
    description:
      'Structure ID (RootPage or a custom structure UUID), tag ID, or collection ID, depending on the operation',
    displayOptions: { show: { ...show, operation: ['structure', 'tag', 'collection'] } },
  },
  {
    displayName: 'Cursor',
    name: 'cursor',
    type: 'string',
    default: '',
    description: 'Cursor returned by the previous page',
    displayOptions: { show: { ...show, operation: ['structure', 'tag', 'collection'] } },
  },
  {
    displayName: 'Page Size',
    name: 'pageSize',
    type: 'number',
    typeOptions: { minValue: 1, maxValue: 100 },
    default: 100,
    description: 'Number of results to return, up to 100',
    displayOptions: { show: { ...show, operation: ['structure', 'tag', 'collection'] } },
  },
];
