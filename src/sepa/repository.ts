import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import type { EndpointInterface } from '#core/endpoint-interface.js';
import { SepaApiEndpoint } from '#sepa/api-endpoint.js';
import { type SepaData, SepaModel } from '#sepa/model.js';
import { sepaValidator } from '#sepa/validator.js';

export class SepaRepository extends AbstractRepository<SepaData, SepaModel> implements Repository<SepaData, SepaModel> {
  constructor(endpoint?: EndpointInterface<SepaData>) {
    super({ endpoint: endpoint ?? new SepaApiEndpoint(), validator: sepaValidator, model: SepaModel });
  }
}
