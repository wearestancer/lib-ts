import { AddressModel, type IdAddress } from '#address/model.js';
import { ApiEndpoint, baseHandler } from '#api/abstract-api-endpoint.js';
import { RFC9557Handler } from '#core/common/handler/date-handler.js';
import { defaultHandler } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';

import { type CustomerData, CustomerModel, type IdCustomer } from './model.js';

export class CustomerApiEndpoint extends ApiEndpoint<CustomerData> {
  protected _handler = {
    ...baseHandler('created'),
    id: IdHandler<IdCustomer>(CustomerModel.regex),
    billingAddress: IdHandler<IdAddress>(AddressModel.regex, { gettable: true, postable: true, patchable: true }),
    country: defaultHandler<CustomerData['country']>('string'),
    dateBirth: RFC9557Handler({}),
    email: defaultHandler<CustomerData['email']>('string', { postRequired: 'partial' }),
    externalId: defaultHandler<CustomerData['externalId']>('string'),
    legalId: defaultHandler<CustomerData['legalId']>('string'),
    mobile: defaultHandler<CustomerData['mobile']>('string', { postRequired: 'partial' }),
    name: defaultHandler<CustomerData['name']>('string'),
    shippingAddress: IdHandler<IdAddress>(AddressModel.regex, { gettable: true, postable: true, patchable: true }),
  };

  constructor() {
    super({
      name: 'customers',
    });
  }
}
