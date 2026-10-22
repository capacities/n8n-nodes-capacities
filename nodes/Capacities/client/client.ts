import type { IDataObject, IHttpRequestMethods, IHttpRequestOptions } from 'n8n-workflow';

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
    createFromMedia: async (file: MediaFile) => {
      const upload = (await this.object.media.init({
        fileName: file.fileName,
        fileSize: file.buffer.length,
        fileType: file.mimeType,
        title: file.title,
        collections: file.collections,
      })) as MediaUploadInit;
      try {
        for (let partNumber = 1; partNumber <= upload.partCount; partNumber++) {
          const start = (partNumber - 1) * upload.partSize;
          await this.object.media.uploadPart(upload.id, partNumber, file.buffer.subarray(start, start + upload.partSize));
        }
        return await this.object.media.complete(upload.id);
      } catch (error) {
        await this.object.media.abort(upload.id).catch(() => undefined);
        throw error;
      }
    },
    media: {
      init: (body: IDataObject) => this.call('POST', '/object/media/upload', { body }),
      uploadPart: (id: string, partNumber: number, body: Buffer) =>
        this.call('PUT', '/object/media/upload/part', {
          qs: { id, partNumber },
          body,
          json: false,
          headers: { 'Content-Type': 'application/octet-stream' },
        }),
      complete: (id: string) => this.call('POST', '/object/media/upload/complete', { body: { id } }),
      abort: (id: string) => this.call('POST', '/object/media/upload/abort', { body: { id } }),
    },
    markdown: {
      get: (id: string) => this.call('GET', '/object/markdown', { qs: { id } }),
      create: (body: IDataObject) => this.call('POST', '/object/markdown', { body }),
      update: (body: IDataObject) => this.call('PATCH', '/object/markdown', { body }),
    },
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

  private call(method: IHttpRequestMethods, path: string, extra: Partial<IHttpRequestOptions> = {}) {
    return this.request({ method, url: `${this.baseUrl}${path}`, json: true, ...extra });
  }
}
