import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['media'], operation: ['upload'] };

export const mediaDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['media'] } },
    options: [{ name: 'Upload', value: 'upload', action: 'Upload media' }],
    default: 'upload',
  },
  {
    displayName: 'Input Binary Field',
    name: 'binaryPropertyName',
    type: 'string',
    required: true,
    default: 'data',
    placeholder: 'e.g. data',
    hint: 'The name of the input binary field containing the file to upload',
    displayOptions: { show },
  },
  {
    displayName: 'File Name',
    name: 'fileName',
    type: 'string',
    default: '',
    placeholder: 'e.g. report.pdf',
    description: 'The name of the file to upload. If empty, the binary file name is used.',
    displayOptions: { show },
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    default: '',
    placeholder: 'e.g. Q3 report',
    description: 'Object title. If empty, the file name is used.',
    displayOptions: { show },
  },
  {
    displayName: 'Collections',
    name: 'collections',
    type: 'string',
    default: '',
    placeholder: 'e.g. 9f20f3d7-7df6-4b4a-8f82-123456789abc',
    description: 'Comma-separated collection IDs to add the uploaded object to',
    displayOptions: { show },
  },
];
