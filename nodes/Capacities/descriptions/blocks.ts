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
    displayName: 'Object ID',
    name: 'objectId',
    type: 'string',
    required: true,
    default: '',
    description: 'ID of the object to append to or delete from',
    displayOptions: { show: { ...show, operation: ['append', 'delete'] } },
  },
  {
    displayName: 'Content',
    name: 'appendContent',
    type: 'options',
    noDataExpression: true,
    options: [
      { name: 'Markdown', value: 'markdown' },
      { name: 'Blocks', value: 'blocks' },
    ],
    default: 'markdown',
    description: 'Whether to append Markdown or a blocks array. The API accepts exactly one of these.',
    displayOptions: { show: { ...show, operation: ['append', 'dailyNoteAppend'] } },
  },
  {
    displayName: 'Markdown',
    name: 'appendMarkdown',
    type: 'string',
    typeOptions: { rows: 5 },
    default: '',
    description: 'Markdown to append. Do not also send a blocks array.',
    displayOptions: { show: { ...show, operation: ['append', 'dailyNoteAppend'], appendContent: ['markdown'] } },
  },
  {
    displayName: 'Blocks (JSON)',
    name: 'appendBlocks',
    type: 'json',
    default:
      '[\n  {\n    "type": "TextBlock",\n    "tokens": [{ "type": "TextToken", "text": "My note", "style": {} }],\n    "hierarchy": { "key": "Base", "val": 0 }\n  }\n]',
    description:
      'Array of blocks to append, not wrapped in a blocks field. A text block uses type TextBlock, tokens, and an optional hierarchy.',
    displayOptions: { show: { ...show, operation: ['append', 'dailyNoteAppend'], appendContent: ['blocks'] } },
  },
  {
    displayName: 'No Timestamp',
    name: 'noTimeStamp',
    type: 'boolean',
    default: false,
    description: 'Whether to omit the timestamp heading block',
    displayOptions: { show: { ...show, operation: ['dailyNoteAppend'] } },
  },
  {
    displayName: 'Date',
    name: 'date',
    type: 'string',
    default: '',
    placeholder: 'e.g. 2026-10-28T00:00:00.000Z',
    description: 'Daily note day as an ISO 8601 UTC-midnight timestamp. Leave empty to use today.',
    displayOptions: { show: { ...show, operation: ['dailyNoteAppend'] } },
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
