import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import { EndpointInterface } from '#core/endpoint-interface.js';

import { type StubData, StubEndpoint } from './stub-endpoint.js';
import { StubModel, StubValidator } from './stub-model.js';

export class StubRepository extends AbstractRepository<StubData, StubModel> implements Repository<StubData, StubModel> {
  constructor(endpoint?: EndpointInterface<StubData>) {
    super({ endpoint: endpoint ?? new StubEndpoint(), validator: StubValidator, model: StubModel });
  }
}
