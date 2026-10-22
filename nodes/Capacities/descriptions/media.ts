import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['media'] };

export const mediaDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show },
    options: [
      { name: 'Abort Upload', value: 'abort', action: 'Abort a media upload' },
      { name: 'Complete Upload', value: 'complete', action: 'Complete a media upload' },
      { name: 'Initialize Upload', value: 'init', action: 'Initialize a media upload' },
      { name: 'Upload Part', value: 'uploadPart', action: 'Upload a media part' },
    ],
    default: 'init',
  },
  {
    displayName: 'Body (JSON)',
    name: 'body',
    type: 'json',
    default: '{}',
    description: 'Request body for initializing an upload: fileName, fileSize, fileType, title, collections',
    displayOptions: { show: { ...show, operation: ['init'] } },
  },
  {
    displayName: 'Upload ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    description: 'Reserved object ID returned by Initialize Upload',
    displayOptions: { show: { ...show, operation: ['uploadPart', 'complete', 'abort'] } },
  },
  {
    displayName: 'Part Number',
    name: 'partNumber',
    type: 'number',
    typeOptions: { minValue: 1 },
    required: true,
    default: 1,
    displayOptions: { show: { ...show, operation: ['uploadPart'] } },
  },
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    default: 'data',
    description: 'Name of the binary property that holds the part bytes',
    displayOptions: { show: { ...show, operation: ['uploadPart'] } },
  },
];
