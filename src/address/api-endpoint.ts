import { ApiEndpoint, baseHandler } from '#api/abstract-api-endpoint.js';
import { defaultHandler } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';

import { type AddressData, AddressModel, type IdAddress } from './model.js';

export class AddressApiEndpoint extends ApiEndpoint<AddressData> {
  protected override _handler = {
    ...baseHandler('created_at'),
    id: IdHandler<IdAddress>(AddressModel.regex),
    city: defaultHandler<AddressData['city']>('string', { postRequired: true }),
    country: defaultHandler<AddressData['country']>('string', { postRequired: true }),
    line1: defaultHandler<AddressData['line1']>('string'),
    line2: defaultHandler<AddressData['line2']>('string'),
    line3: defaultHandler<AddressData['line3']>('string'),
    metadata: defaultHandler<AddressData['metadata']>('string'),
    state: defaultHandler<AddressData['state']>('string'),
    zipCode: defaultHandler<AddressData['zipCode']>('string', { postRequired: true }),
  };

  constructor() {
    super({
      name: 'addresses',
      patchable: false,
    });
  }
  endpointUrl(id?: IdAddress) {
    return this._getResourceUri(id);
  }
}
