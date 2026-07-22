import type { Url } from 'url';

import type { IdValue } from './common/branded-type.js';

export interface ListParams {
  filters: Record<string, unknown>;
  limit: number;
  start: number;
  end: number;
}

export type EndpointGenerator<Data> = AsyncIterableIterator<Partial<Data>, void, Partial<Data>>;
export interface EndpointInterface<Data> {
  /**
   * Delete the object with specific id in the API
   * @param id The Id of the object we want to delete
   * @returns The response of the API
   */
  delete: (id: IdValue) => Promise<Partial<Data>>;

  /**
   * Get an object from the API
   * @param id The Id of the object we want to get
   * @returns The data of an object
   */
  get: (id: IdValue) => Promise<Partial<Data>>;

  /**
   * Get a list of object from the API
   * @param params The params of the listing
   * @param endpoint A custom url for specific subObject
   * @returns A generator of object Data
   */
  list: (params: Partial<ListParams>, endpoint?: Url) => EndpointGenerator<Data>;

  /**
   * Sent an object to the API
   * @param id The ID of the object
   * @param mutations The data to be sent to our API
   * @returns The new data of the object.
   */
  send: (id: IdValue | undefined, mutations: Partial<Data>) => Promise<Partial<Data>>;
}
