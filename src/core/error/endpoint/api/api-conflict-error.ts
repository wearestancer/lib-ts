import { StancerApiError } from './api-error.js';

export class StancerApiConflictError extends StancerApiError {
  constructor(message?: string) {
    super(409, message ?? 'Conflict');
  }
}
