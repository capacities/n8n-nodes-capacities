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
      { name: 'List by Time', value: 'time', action: 'List objects by time' },
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
    displayName: 'Mode',
    name: 'timeMode',
    type: 'options',
    options: [
      { name: 'Created At', value: 'createdAt' },
      { name: 'Last Updated', value: 'lastUpdated' },
    ],
    default: 'createdAt',
    description: 'Whether to filter by creation time or last update time',
    displayOptions: { show: { ...show, operation: ['time'] } },
  },
  {
    displayName: 'From',
    name: 'timeFrom',
    type: 'dateTime',
    default: '',
    description: 'Start of the time range. Set From, To, or both.',
    displayOptions: { show: { ...show, operation: ['time'] } },
  },
  {
    displayName: 'To',
    name: 'timeTo',
    type: 'dateTime',
    default: '',
    description: 'End of the time range. Set From, To, or both.',
    displayOptions: { show: { ...show, operation: ['time'] } },
  },
  {
    displayName: 'Structure IDs',
    name: 'timeStructureIds',
    type: 'string',
    default: '',
    placeholder: 'e.g. RootPage',
    description: 'Comma-separated structure IDs (up to 25). Leave empty to include all object types.',
    displayOptions: { show: { ...show, operation: ['time'] } },
  },
  {
    displayName: 'Cursor',
    name: 'cursor',
    type: 'string',
    default: '',
    description: 'Cursor returned by the previous page',
    displayOptions: { show: { ...show, operation: ['structure', 'tag', 'collection', 'time'] } },
  },
  {
    displayName: 'Page Size',
    name: 'pageSize',
    type: 'number',
    typeOptions: { minValue: 1, maxValue: 100 },
    default: 100,
    description: 'Number of results to return, up to 100',
    displayOptions: { show: { ...show, operation: ['structure', 'tag', 'collection', 'time'] } },
  },
];
