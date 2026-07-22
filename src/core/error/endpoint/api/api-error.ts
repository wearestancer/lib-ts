import { StancerError } from '../../base-error.js';

export class StancerApiError extends StancerError {
  constructor(
    public httpStatus: number,
    message: string,
  ) {
    super(message);
  }
}
