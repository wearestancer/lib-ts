import { StancerApiError } from './api-error.js';

export class StancerApiUnauthorizedError extends StancerApiError {
  constructor(message?: string) {
    super(401, message ?? 'Unauthorized');
  }
}
