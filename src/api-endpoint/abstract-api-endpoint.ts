import type { ModelData, ModelType } from '#core/abstract-model.js';
import type { IdValue } from '#core/common/branded-type.js';
import { timestampHandler } from '#core/common/handler/date-handler.js';
import { type Handler, defaultHandler } from '#core/common/handler/handler.js';
import type { EndpointInterface, ListParams } from '#core/endpoint-interface.js';
import { StancerError } from '#core/error/base-error.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import { UnsendableError } from '#error/unsendable-error.js';

import { Configuration } from './configuration.js';
import { Http } from './http/index.js';

export interface Restriction {
  postable?: boolean;
  patchable?: boolean;
  listable?: boolean;
  deletable?: boolean;
}

export const baseHandler = (
  payloadName: string = 'createdAt',
): { [Property in keyof ModelData]: Handler<ModelData[Property]> } => {
  return {
    createdAt: { ...timestampHandler({ patchable: false, postable: false }), payloadName },
    deleted: defaultHandler<boolean>('boolean', { postable: false, patchable: false }),
  };
};
interface Config<Data> extends Restriction {
  name: string;
  deserializeResource: (resource: Record<string, unknown>) => Partial<Data>;
  postObjectSerializer: (obj: Partial<Data>) => object;
  patchObjectSerializer: (obj: Partial<Data>) => object;
}
type Handlers<T> = {
  [Property in keyof T]: Handler<T[Property]>;
};

export type ConfigParameter = {
  name: string;
} & Restriction;

type RangeParam = { start: number; end: number; limit: number; count: number; has_more: boolean };
type Range<Data> = { range: RangeParam } & {
  [_key: string]: Partial<Data>[];
};

export const camelCaseTo_snake_case = (key: string): string =>
  key.replaceAll(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);

export abstract class ApiEndpoint<Data extends ModelType> implements EndpointInterface<Data> {
  //#region constructor & property
  protected abstract _handler: Handlers<Data>;

  // All the property in our Data has the same name (cased in camelCase) as our API property, if not we specify a payloadName
  private _payloadKey = (key: keyof Data & string) => this._handler[key]?.payloadName ?? camelCaseTo_snake_case(key);

  private config: Config<Data> = {
    name: '',
    patchable: true,
    postable: true,
    listable: true,
    deletable: true,

    //Deserializer take an unknown resource and make it a Data from a specific model of our library
    deserializeResource: (resource: Record<string, unknown>): Partial<Data> => {
      // By definition Object.keys(specificArray) return array<keyof specificArray>
      const keys = Object.keys(this._handler) as Array<keyof Data & string>;
      return Object.fromEntries(
        keys
          .filter((key) => {
            return this._handler[key].gettable && resource[this._payloadKey(key)] !== undefined;
          })
          .map((key) => {
            return [key, this._handler[key].deserialize(resource[this._payloadKey(key)])];
          }),
      ) as Partial<Data>;
    },
    //Serializers take our model and make it readable by an external resource (api ...)
    postObjectSerializer: (data: Partial<Data>): Record<string, unknown> => {
      // By definition Object.keys(specificArray) return array<keyof specificArray>
      const keys = Object.keys(this._handler) as Array<keyof Data & string>;

      const partiallyRequired = keys.filter((key) => this._handler[key].postRequired === 'partial');
      const partialFullfilled = partiallyRequired.filter((key) => data[key] !== undefined);
      if (!partialFullfilled.length && partiallyRequired.length) {
        throw new UnsendableError(`one of the partially required data ( ${partiallyRequired.join(' or ')})`);
      }
      return Object.fromEntries(
        keys
          .filter((key) => {
            if (this._handler[key].postRequired === true && data[key] === undefined) {
              throw new UnsendableError(key);
            }
            return this._handler[key].postable && data[key] !== undefined;
          })
          .map((key) => [this._payloadKey(key), this._handler[key].serialize(data[key] as Data[keyof Data & string])]),
      );
    },
    patchObjectSerializer: (data: Partial<Data>): Record<string, unknown> => {
      // By definition Object.keys(specificArray) return array<keyof specificArray>
      const keys = Object.keys(this._handler) as Array<keyof Data & string>;

      const partiallyRequired = keys.filter((key) => this._handler[key].patchRequired === 'partial');
      const partialFullfilled = partiallyRequired.filter((key) => data[key] !== undefined);
      if (!partialFullfilled.length && partiallyRequired.length) {
        throw new UnsendableError(`one of the partially required data (${partiallyRequired.join(' or ')}) `);
      }
      return Object.fromEntries(
        keys
          .filter((key) => {
            if (this._handler[key].patchRequired === true && data[key] === undefined) {
              throw new UnsendableError(key);
            }
            return this._handler[key].patchable && data[key] !== undefined;
          })
          .map((key) => [this._payloadKey(key), this._handler[key].serialize(data[key] as Data[keyof Data & string])]),
      );
    },
  };

  constructor(config: ConfigParameter) {
    this.config.name = config.name;
    this.config.patchable = config.patchable ?? true;
    this.config.postable = config.postable ?? true;
    this.config.listable = config.listable ?? true;
    this.config.deletable = config.deletable ?? true;
  }

  //#endregion
  //#region endpoint interface

  public delete(id: IdValue) {
    if (!this.deletable) {
      throw new StancerRouteInaccessibleError('DELETE', this.config.name);
    }
    return this._httpClient
      .makeRequest(
        Http.createRequest({
          url: this._getResourceUri(id),
          method: 'DELETE',
          authenticated: true,
        }),
      )
      .then(Http.transformResponseToData<Record<string, unknown>>)
      .then(this.deserializeResource);
  }

  public get(id: IdValue): Promise<Partial<Data>> /*Gettable resources*/ {
    return this._httpClient
      .makeRequest(
        Http.createRequest({
          url: this._getResourceUri(id),
          method: 'GET',
          authenticated: true,
        }),
      )
      .then(Http.transformResponseToData<Record<string, unknown>>)
      .then(this.deserializeResource);
  }

  public send(id: IdValue | undefined, mutations: Partial<Data>): Promise<Partial<Data>> {
    if (!mutations || Object.keys(mutations).length === 0) {
      throw new StancerError('You cannot send a model whithout modification');
    }
    if (id) {
      return this.patch(id, mutations);
    }
    return this.post(mutations);
  }

  //#endregion

  public list({
    start = 0,
    limit = 100,
    end = 1000,
    filters = {},
  }: Partial<ListParams>): AsyncGenerator<Partial<Data>, void, Partial<Data>> {
    if (!this.listable) {
      throw new StancerRouteInaccessibleError('LIST', this.config.name);
    }
    return this.listGenerator({ start, limit, end, filters });
  }

  private createListUrl(endpoint: string, { start, limit, filters }: Omit<ListParams, 'end'>) {
    const url = new URL(endpoint + '/');
    url.searchParams.append('start', start.toString());
    url.searchParams.append('limit', limit.toString());
    for (const [key, value] of Object.entries(filters)) {
      url.searchParams.append(key, String(value));
    }
    return url;
  }

  private async *listGenerator(
    { start, limit, end, filters }: ListParams,
    endpoint = this._endpointBaseUrl,
  ): AsyncGenerator<Partial<Data>, void, Partial<Data>> {
    if (limit <= 0) {
      return;
    }
    for (let currentStart = start; currentStart - start < end; currentStart = currentStart + limit) {
      const url = this.createListUrl(endpoint, { start: currentStart, limit, filters });
      const endpointName = this.config.name;

      const data = await this._httpClient
        .makeRequest(
          Http.createRequest({
            url: url.toString(),
            method: 'GET',
            authenticated: true,
          }),
        )
        .then(Http.transformResponseToData<Range<Data>>)
        .then((result) => {
          if (!Array.isArray(result[endpointName])) {
            return;
          }
          const serializedData = result[endpointName].map((data) => this.deserializeResource(data)) ?? [];

          return { [endpointName]: serializedData, range: result.range };
        });

      if (!data || !Array.isArray(data[endpointName])) {
        return;
      }

      yield* data[endpointName];

      if (!data.range?.has_more) {
        return;
      }
    }
  }

  //#endregion
  //#region method

  private sendRequest(method: 'PATCH' | 'POST', url: string, data: object): Promise<Partial<Data>> {
    return this._httpClient
      .makeRequest(
        Http.createRequest({
          url,
          method,
          authenticated: true,
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
      )
      .then(Http.transformResponseToData<Record<string, unknown>>)
      .then(this.deserializeResource);
  }

  public patch(id: IdValue, data: Partial<Data>) {
    if (!this.patchable) {
      throw new StancerRouteInaccessibleError('PATCH', this.config.name);
    }
    return this.sendRequest('PATCH', this._getResourceUri(id), this.patchObjectSerializer(data));
  }

  public post(data: Partial<Data>): Promise<Partial<Data>> {
    if (!this.postable) {
      throw new StancerRouteInaccessibleError('POST', this.config.name);
    }
    return this.sendRequest('POST', this._getResourceUri(), this.postObjectSerializer(data));
  }
  //#endregion

  //#region getter

  protected get _endpointBaseUrl() {
    return `${Configuration.baseUrl}/${this.config.name}`;
  }
  protected _getResourceUri(id?: IdValue) {
    return id ? `${this._endpointBaseUrl}/${id}` : `${this._endpointBaseUrl}/`;
  }

  protected get _httpClient() {
    return Configuration.httpClient;
  }
  get deletable() {
    return this.config.deletable;
  }
  get patchable() {
    return this.config.patchable;
  }

  get postable() {
    return this.config.postable;
  }

  get listable() {
    return this.config.listable;
  }

  get deserializeResource() {
    return this.config.deserializeResource;
  }

  get postObjectSerializer() {
    return this.config.postObjectSerializer;
  }

  get patchObjectSerializer() {
    return this.config.patchObjectSerializer;
  }
  //#endregion
}
