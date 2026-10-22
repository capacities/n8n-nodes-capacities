import type { IHttpRequestMethods, IHttpRequestOptions } from 'n8n-workflow';

export type CapacitiesRequest = (options: IHttpRequestOptions) => Promise<unknown>;

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
    create: (body: Record<string, unknown>) => this.call('POST', '/object', { body }),
    delete: (id: string) => this.call('DELETE', '/object', { qs: { id } }),
  };

  private call(method: IHttpRequestMethods, path: string, extra: Partial<IHttpRequestOptions> = {}) {
    return this.request({ method, url: `${this.baseUrl}${path}`, json: true, ...extra });
  }
}
