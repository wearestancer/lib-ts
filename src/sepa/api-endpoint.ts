import { ApiEndpoint, baseHandler } from '#api/abstract-api-endpoint.js';
import { RFC9557Handler } from '#core/common/handler/date-handler.js';
import { defaultHandler } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';

import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { type IdSepa, type SepaData, SepaModel } from './model.js';

export class SepaApiEndpoint extends ApiEndpoint<SepaData> {
  public _handler = {
    ...baseHandler('created'),
    bic: defaultHandler<SepaData['bic']>('string', { patchable: false }),
    customer: IdHandler<IdCustomer>(CustomerModel.regex, { patchable: false }),
    dateMandate: RFC9557Handler({}),
    id: IdHandler<IdSepa>(SepaModel.regex, { postable: false, patchable: false }),
    last4: defaultHandler<SepaData['last4']>('string', { postable: false, patchable: false }),
    mandate: defaultHandler<SepaData['mandate']>('string'),
    name: defaultHandler<SepaData['name']>('string', { postRequired: true }),
    iban: defaultHandler<SepaData['iban']>('string', { postRequired: true, gettable: false, patchable: false }),
  };
  constructor() {
    super({
      name: 'sepa',
    });
  }
}
