import { StancerApiError } from './api-error.js';

export class StancerApiUnknownError extends StancerApiError {
  constructor(code?: number, message?: string) {
    super(code ?? 500, message ?? 'Unknown Error');
  }
}
