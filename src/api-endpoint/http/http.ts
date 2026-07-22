import {
  StancerApiConflictError,
  StancerApiError,
  StancerApiNotFoundError,
  StancerApiUnauthorizedError,
  StancerApiUnknownError,
  StancerApiValidationError,
  type StancerApiValidationErrorDetails,
} from '#error/endpoint/api/index.js';

import { Configuration } from '../configuration.js';

//#region interfaces
export interface Client {
  makeRequest: (request: Request) => Promise<Response>;
}

export interface Request {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  authenticated?: boolean;
}

export interface Response {
  status: number;
  json<T>(): Promise<T>;
}
//#endregion

//#region implementation
export const createRequest = (req: Request): Request => {
  return {
    ...req,
    headers: {
      ...(req.authenticated ? Configuration.httpBasicAuthHeader : {}),
      ...Configuration.defaultHttpHeaders,
      ...req.headers,
    },
  };
};

export const handleHttpResponseErrors = async (response: Response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  try {
    const data = await response.json<{ error: string | object; detail: StancerApiValidationErrorDetails[] }>();
    const stringifyError = (error: string | object) => (typeof error === 'string' ? error : JSON.stringify(error));
    switch (response.status) {
      case 401:
        throw new StancerApiUnauthorizedError(stringifyError(data.error));
      case 422:
        throw new StancerApiValidationError(data.detail);
      case 404:
        throw new StancerApiNotFoundError(stringifyError(data.error));
      case 409:
        throw new StancerApiConflictError(stringifyError(data.error));
      default:
        throw new StancerApiUnknownError(response.status, stringifyError(data.error) ?? `${response.status} error`);
    }
  } catch (e) {
    if (e instanceof StancerApiError) {
      throw e;
    }
    throw new StancerApiUnknownError(response.status, `HTTP Error ${response.status}`);
  }
};

export const transformResponseToData = async <T>(response: Response) => {
  await handleHttpResponseErrors(response);
  return response.json<T>();
};
//#endregion
