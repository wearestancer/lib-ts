import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import type { EndpointInterface } from '#core/endpoint-interface.js';
import { CustomerApiEndpoint } from '#customer/api-endpoint.js';
import { type CustomerData, CustomerModel } from '#customer/model.js';
import { customerValidator } from '#customer/validator.js';

export class CustomerRepository
  extends AbstractRepository<CustomerData, CustomerModel>
  implements Repository<CustomerData, CustomerModel>
{
  constructor(endpoint?: EndpointInterface<CustomerData>) {
    super({ endpoint: endpoint ?? new CustomerApiEndpoint(), validator: customerValidator, model: CustomerModel });
  }
}
