import { describe, expect, it } from 'vitest';

import { Request, Response, createRequest, handleHttpResponseErrors, transformResponseToData } from '#api/http/http.js';
import {
  StancerApiConflictError,
  StancerApiError,
  StancerApiNotFoundError,
  StancerApiUnauthorizedError,
  StancerApiValidationError,
} from '#error/endpoint/api/index.js';
import { randomString } from '#test/test-helper.js';

describe('Test http', () => {
  describe('createRequest', () => {
    it('Create request authenticate, with a body', () => {
      const url = randomString(1, 45);
      const body = randomString(1, 25);
      const method = 'GET';
      const req: Omit<Request, '_tag'> & { authenticated?: boolean } = {
        authenticated: true,
        headers: {
          one: randomString(10, 24),
          two: randomString(11, 45),
        },
        url,
        method,
        body,
      };
      const request = createRequest(req);
      expect(request).toHaveProperty('url');
      expect(request.url).toBe(url);
      expect(request).toHaveProperty('method');
      expect(request.method).toBe(method);
      expect(request).toHaveProperty('body');
      expect(request.body).toBe(body);
      expect(request).toHaveProperty('authenticated');
      expect(request.authenticated).toBe(true);
    });

    it('Create request unauthenticated, with a body', () => {
      const url = randomString(1, 45);
      const body = randomString(1, 25);
      const method = 'GET';
      const req: Omit<Request, '_tag'> & { authenticated?: boolean } = {
        authenticated: false,
        headers: {
          one: randomString(10, 24),
          two: randomString(11, 45),
        },
        url,
        method,
        body,
      };
      const request = createRequest(req);
      expect(request).toHaveProperty('url');
      expect(request.url).toBe(url);
      expect(request).toHaveProperty('method');
      expect(request.method).toBe(method);
      expect(request).toHaveProperty('body');
      expect(request.body).toBe(body);
      expect(request).toHaveProperty('authenticated');
      expect(request.authenticated).toBe(false);
    });
    it('Create request authenticated, with nobody', () => {
      const url = randomString(1, 45);
      const body = undefined;
      const method = 'GET';
      const req: Omit<Request, '_tag'> & { authenticated?: boolean } = {
        authenticated: true,
        headers: {
          one: randomString(10, 24),
          two: randomString(11, 45),
        },
        url,
        method,
        body,
      };
      const request = createRequest(req);
      expect(request).toHaveProperty('url');
      expect(request.url).toBe(url);
      expect(request).toHaveProperty('method');
      expect(request.method).toBe(method);
      expect(request).toHaveProperty('body');
      expect(request.body).toBeUndefined();
      expect(request).toHaveProperty('authenticated');
      expect(request.authenticated).toBe(true);
    });
    it('Create request unauthenticated, with nobody', () => {
      const url = randomString(1, 45);
      const body = undefined;
      const method = 'GET';
      const req: Omit<Request, '_tag'> & { authenticated?: boolean } = {
        authenticated: false,
        headers: {
          one: randomString(10, 24),
          two: randomString(11, 45),
        },
        url,
        method,
        body,
      };
      const request = createRequest(req);
      expect(request).toHaveProperty('url');
      expect(request.url).toBe(url);
      expect(request).toHaveProperty('method');
      expect(request.method).toBe(method);
      expect(request).toHaveProperty('body');
      expect(request.body).toBeUndefined();
      expect(request).toHaveProperty('authenticated');
      expect(request.authenticated).toBe(false);
    });
  });

  describe('handleHttpResponseErrors', () => {
    it.each([
      [401, StancerApiUnauthorizedError],
      [422, StancerApiValidationError],
      [404, StancerApiNotFoundError],
      [409, StancerApiConflictError],
      [400, StancerApiError],
      [500, StancerApiError],
    ])('%d throw appropriate error', async (status, expectedError) => {
      const response: Response = {
        status,
        json: async <T>() => {
          return Promise.resolve({ error: randomString(1, 24) }) as T;
        },
      };

      await expect(handleHttpResponseErrors(response)).rejects.toThrow(expectedError);
    });
    it('is successful(200)', async () => {
      const response: Response = {
        status: Number(200), //we start at 23 to avoid triggering known exceptions
        json: async <T>() => {
          return { error: randomString(1, 24) } as T;
        },
      };
      await expect(handleHttpResponseErrors(response)).resolves.toStrictEqual(response);
    });
  });
  describe('transform response to data', () => {
    it('return response.json', async () => {
      const information = randomString(1, 24);
      const response: Response = {
        status: 200,
        json: async <T>() => (await Promise.resolve(information)) as T,
      };
      expect(await transformResponseToData<string>(response)).toStrictEqual(information);
    });
  });
});
