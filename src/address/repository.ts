import { AddressApiEndpoint } from '#address/api-endpoint.js';
import { type AddressData, AddressModel } from '#address/model.js';
import { addressValidator } from '#address/validator.js';
import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import type { EndpointInterface } from '#core/endpoint-interface.js';

export class AddressRepository
  extends AbstractRepository<AddressData, AddressModel>
  implements Repository<AddressData, AddressModel>
{
  constructor(endpoint?: EndpointInterface<AddressData>) {
    super({
      endpoint: endpoint ?? new AddressApiEndpoint(),
      validator: addressValidator,
      model: AddressModel,
    });
  }
}
