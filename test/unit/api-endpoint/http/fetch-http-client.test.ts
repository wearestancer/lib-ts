import { describe, expect, it } from 'vitest';

import { httpClient } from '#api/http/fetch-http-client.js';
import { Http } from '#api/http/index.js';
import { mockFetch, randomString } from '#test/test-helper.js';

describe('test fetch client', () => {
  it('uses base user agent', async () => {
    // as we only touch headers in this function we will just look for headers in the response
    const resolver = (url: string, req: Http.Request) => req.headers;

    const cleaner = mockFetch(resolver);
    const request: Http.Request = {
      url: randomString(1, 24),
      method: 'DELETE',
      _tag: 'HttpClientRequest',
      headers: {},
    };
    const response = await httpClient.makeRequest(request);
    expect(response).haveOwnProperty('status');
    expect(response).haveOwnProperty('json');
    const json: typeof request.headers = await response.json();
    expect(json).toEqual({ 'user-agent': 'Stancer fetch' });
    cleaner();
  });

  it('uses custom user agent', async () => {
    const userAgent = randomString(12, 24);
    // as we only touch headers in this function we will just look for headers in the response
    const resolver = (url: string, req: Http.Request) => req.headers;
    const cleaner = mockFetch(resolver);
    const request: Http.Request = {
      url: randomString(1, 12),
      method: 'DELETE',
      headers: { 'user-agent': userAgent },
    };
    const response = await httpClient.makeRequest(request);
    expect(response).haveOwnProperty('status');
    expect(response).haveOwnProperty('json');
    const json: typeof request.headers = await response.json();
    expect(json).toEqual({ 'user-agent': `${userAgent}` });
    cleaner();
  });
});
