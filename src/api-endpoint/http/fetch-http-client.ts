import { StancerApiUnknownError } from '#error/endpoint/api/api-unknown-error.js';

import { Http } from './index.js';

export const httpClient: Http.Client = {
  makeRequest: async (request: Http.Request): Promise<Http.Response> => {
    const headers = {
      ...(request.headers ?? {}),
    };
    if (!headers['user-agent']) {
      headers['user-agent'] = 'Stancer fetch';
    }
    const partialRequest = {
      method: request.method,
      headers,
    };
    const completeRequest = request.body ? { ...partialRequest, body: request.body } : partialRequest;
    try {
      const response = await fetch(request.url, completeRequest);

      return {
        status: response.status,
        json: async <T>() => (await response.json()) as T,
      };
    } catch (e) {
      throw new StancerApiUnknownError(0, e instanceof Error ? e.message : 'Network error');
    }
  },
};
