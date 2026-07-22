import { describe, expect, it, vi } from 'vitest';

import { Configuration } from '#api/configuration.js';
import ListEndpointFixtures from '#test/fixtures/list-endpoint.stub.js';
import { StubEndpoint } from '#test/stub/stub-endpoint.js';
import { randomNumber, randomString } from '#test/test-helper.js';

vi.mock('../../../src/http/http.js', async (importHTTP) => {
  const original: Record<string, Promise<unknown>> = await importHTTP();
  return {
    ...original,
    transformResponseToData: vi.fn((value) => value.json()),
  };
});
vi.mock('#api/http/fetch-http-client.js', () => {
  return {
    httpClient: {
      makeRequest: vi.fn(() => {
        return Promise.resolve({
          status: 200,
          json: () => {
            return {
              ...ListEndpointFixtures,
            };
          },
        });
      }),
    },
  };
});

describe('stub list', () => {
  it('does not start if unlistable', async () => {
    const unListableEndpoint = new StubEndpoint({ listable: false });
    expect(unListableEndpoint.listable).toBeFalsy();
    expect(() => unListableEndpoint.list({})).toThrow('LIST is not allowed for stubs resource');
  });

  it('list correctly fixtured objects', async () => {
    const endpoint = new StubEndpoint();
    const generator = endpoint.list({ limit: 2 });
    const item1 = await generator.next();
    expect(item1.done).toBe(false);
    expect(item1.value).toHaveProperty('id');
    const item2 = await generator.next();
    expect(item2.done).toBe(false);
    expect(item1.value).toHaveProperty('id');
    const item3 = await generator.next();
    expect(item3.done).toBe(true);
  });

  it('iterate correctly', async () => {
    const endpoint = new StubEndpoint();
    const generator = endpoint.list({});
    for (const item in generator) {
      expect(item).toHaveProperty('id');
    }
  });
});

describe('create URL', () => {
  it('return simple stubUrl', () => {
    const endpoint = new StubEndpoint();
    const url = endpoint.createListUrl(endpoint._endpointBaseUrl, { start: 0, limit: 100, filters: {} });
    expect(url).toBeTypeOf('object');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toBe('https://api.stancer.com/v2/stubs/?start=0&limit=100');
  });

  it('return complex url', () => {
    const endpoint = new StubEndpoint();
    const endpointUrl = randomString(10, 20);
    const limit = randomNumber(1, 100);
    const start = randomNumber(1, 20);
    const filters = {
      filter1: randomString(10, 20),
      filter2: randomString(10, 20),
    };
    const url = endpoint.createListUrl(`${Configuration.baseUrl}/${endpointUrl}`, { limit, start, filters });
    expect(url).toBeTypeOf('object');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toBe(
      `https://api.stancer.com/v2/${endpointUrl}/?start=${start}&limit=${limit}&filter1=${filters.filter1}&filter2=${filters.filter2}`,
    );
  });
});
