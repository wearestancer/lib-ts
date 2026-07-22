import { StancerApiError } from './api-error.js';

export class StancerApiNotFoundError extends StancerApiError {
  constructor(message?: string) {
    super(404, message ?? 'Not Found');
  }
}
