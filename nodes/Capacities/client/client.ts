import {
  NodeApiError,
  NodeOperationError,
  type IDataObject,
  type IHttpRequestMethods,
  type IHttpRequestOptions,
  type INode,
  type JsonObject,
} from 'n8n-workflow';

export type CapacitiesRequest = (options: IHttpRequestOptions) => Promise<unknown>;

export type MediaFile = {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  title?: string;
  collections?: string[];
};

type MediaUploadInit = { id: string; partSize: number; partCount: number };

export class CapacitiesClient {
  constructor(
    private readonly baseUrl: string,
    private readonly request: CapacitiesRequest,
    private readonly node: INode,
  ) {}

  readonly space = {
    get: () => this.call('GET', '/space'),
    structures: () => this.call('GET', '/space/structures'),
  };

  readonly object = {
    get: (id: string) => this.call('GET', '/object', { qs: { id } }),
    create: (body: IDataObject) => this.call('POST', '/object', { body }),
    update: (body: IDataObject) => this.call('PATCH', '/object', { body }),
    delete: (id: string, hardDelete?: boolean) => this.call('DELETE', '/object', { qs: { id, hardDelete } }),
    createFromUrl: (body: IDataObject) => this.call('POST', '/object/url', { body }),
    markdown: {
      get: (id: string) => this.call('GET', '/object/markdown', { qs: { id } }),
      create: (body: IDataObject) => this.call('POST', '/object/markdown', { body }),
      update: (body: IDataObject) => this.call('PATCH', '/object/markdown', { body }),
    },
  };

  readonly media = {
    upload: (file: MediaFile) => this.uploadMedia(file),
  };

  readonly objects = {
    search: (body: IDataObject) => this.call('POST', '/objects/search', { body }),
    structure: (id: string, cursor?: string, pageSize?: number) =>
      this.call('GET', '/objects/structure', { qs: { id, cursor, pageSize } }),
    tag: (id: string, cursor?: string, pageSize?: number) =>
      this.call('GET', '/objects/tag', { qs: { id, cursor, pageSize } }),
    collection: (id: string, cursor?: string, pageSize?: number) =>
      this.call('GET', '/objects/collection', { qs: { id, cursor, pageSize } }),
  };

  readonly blocks = {
    append: (body: IDataObject) => this.call('POST', '/blocks/append', { body }),
    dailyNote: {
      append: (body: IDataObject) => this.call('POST', '/blocks/daily-note/append', { body }),
    },
    block: {
      delete: (objectId: string, blockId: string) => this.call('DELETE', '/block', { qs: { objectId, blockId } }),
      update: (body: IDataObject) => this.call('PATCH', '/blocks/block', { body }),
    },
  };

  private async uploadMedia(file: MediaFile) {
    const upload = (await this.call('POST', '/object/media/upload', {
      body: {
        fileName: file.fileName,
        fileSize: file.buffer.length,
        fileType: file.mimeType,
        title: file.title,
        collections: file.collections,
      },
    })) as MediaUploadInit;

    try {
      for (let partNumber = 1; partNumber <= upload.partCount; partNumber++) {
        const start = (partNumber - 1) * upload.partSize;
        await this.call('PUT', '/object/media/upload/part', {
          qs: { id: upload.id, partNumber },
          body: file.buffer.subarray(start, start + upload.partSize),
          json: false,
          headers: { 'Content-Type': 'application/octet-stream' },
        });
      }
      return await this.call('POST', '/object/media/upload/complete', { body: { id: upload.id } });
    } catch (error) {
      await this.call('POST', '/object/media/upload/abort', { body: { id: upload.id } }).catch(() => undefined);
      throw new NodeApiError(this.node, error as JsonObject);
    }
  }

  private call(method: IHttpRequestMethods, path: string, extra: Partial<IHttpRequestOptions> = {}) {
    const { headers: extraHeaders, qs, body, ...rest } = extra;
    const payload = parseJsonBody(body, this.node);
    const headers: IDataObject = { ...extraHeaders };
    if (payload !== undefined && rest.json !== false && !Buffer.isBuffer(payload)) {
      headers['Content-Type'] = (headers['Content-Type'] as string | undefined) ?? 'application/json';
    }
    return this.request({
      method,
      url: `${this.baseUrl}${path}`,
      json: true,
      ...rest,
      body: payload,
      qs: qs ? definedQuery(qs) : undefined,
      headers,
    });
  }
}

function definedQuery(qs: IDataObject): IDataObject {
  return Object.fromEntries(Object.entries(qs).filter(([, value]) => value !== undefined && value !== ''));
}

function parseJsonBody(body: IHttpRequestOptions['body'], node: INode): IHttpRequestOptions['body'] {
  if (typeof body !== 'string') return body;
  const trimmed = body.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return body;
  try {
    return JSON.parse(trimmed) as IHttpRequestOptions['body'];
  } catch (error) {
    throw new NodeOperationError(node, 'Request body is not valid JSON', {
      description: error instanceof Error ? error.message : undefined,
    });
  }
}
