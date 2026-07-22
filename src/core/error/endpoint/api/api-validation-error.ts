import { StancerApiError } from './api-error.js';

export interface StancerApiValidationErrorDetails {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export class StancerApiValidationError extends StancerApiError {
  constructor(public details?: StancerApiValidationErrorDetails[]) {
    super(422, details ? `Validation failed: ${JSON.stringify(details)}` : 'Payload cannot be validated');
  }
}
