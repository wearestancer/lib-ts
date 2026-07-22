import { StancerError } from '../base-error.js';

export class StancerRouteInaccessibleError extends StancerError {
  constructor(verb: 'POST' | 'PATCH' | 'LIST' | 'DELETE', resource: string, error?: ErrorOptions) {
    const message = `${verb} is not allowed for ${resource} resource`;
    super(message, error);
  }
}
