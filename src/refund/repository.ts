import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import type { EndpointInterface } from '#core/endpoint-interface.js';
import { RefundApiEndpoint } from '#refund/api-endpoint.js';
import { type RefundData, RefundModel } from '#refund/model.js';
import { refundValidator } from '#refund/validator.js';

export class RefundRepository
  extends AbstractRepository<RefundData, RefundModel>
  implements Repository<RefundData, RefundModel>
{
  constructor(endpoint?: EndpointInterface<RefundData>) {
    super({ endpoint: endpoint ?? new RefundApiEndpoint(), validator: refundValidator, model: RefundModel });
  }
}
