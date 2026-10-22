import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['blocks'] };

export const blocksDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show },
    options: [
      { name: 'Append', value: 'append', action: 'Append blocks to an object' },
      { name: 'Append to Daily Note', value: 'dailyNoteAppend', action: 'Append blocks to the daily note' },
      { name: 'Delete', value: 'delete', action: 'Delete a block' },
      { name: 'Update', value: 'update', action: 'Update a block' },
    ],
    default: 'append',
  },
  {
    displayName: 'Body (JSON)',
    name: 'body',
    type: 'json',
    default: '{}',
    description: 'Request body. See the Capacities API reference for the schema of each operation.',
    displayOptions: { show: { ...show, operation: ['append', 'dailyNoteAppend', 'update'] } },
  },
  {
    displayName: 'Object ID',
    name: 'objectId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { ...show, operation: ['delete'] } },
  },
  {
    displayName: 'Block ID',
    name: 'blockId',
    type: 'string',
    required: true,
    default: '',
    description: 'Block to remove, including its nested child blocks',
    displayOptions: { show: { ...show, operation: ['delete'] } },
  },
];
