import { ApiEndpoint, baseHandler } from '#api/abstract-api-endpoint.js';
import { enumHandler } from '#core/common/handler/enum-handler.js';
import { defaultHandler } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';

import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { FundingCardEnum } from './enum/funding.js';
import { NatureCardEnum } from './enum/nature.js';
import { NetworkCardEnum, PreferredNetworkCardEnum } from './enum/network.js';
import { type CardData, CardModel, type IdCard } from './model.js';

export class CardApiEndpoint extends ApiEndpoint<CardData> {
  public _handler = {
    ...baseHandler('created'),
    id: IdHandler<IdCard>(CardModel.regex),
    brand: defaultHandler<CardData['brand']>('string', { patchable: false, postable: false }),
    country: defaultHandler<CardData['country']>('string', { patchable: false, postable: false }),
    customer: IdHandler<IdCustomer>(CustomerModel.regex, { patchable: false }),
    cvc: defaultHandler<CardData['cvc']>('string', { gettable: false, patchable: false }),
    expMonth: defaultHandler<CardData['expMonth']>('number', { postRequired: true }),
    expYear: defaultHandler<CardData['expYear']>('number', { postRequired: true }),
    externalId: defaultHandler<CardData['externalId']>('string'),
    funding: enumHandler(FundingCardEnum, { patchable: false, postable: false }),
    last4: defaultHandler<CardData['last4']>('string', { postable: false, patchable: false }),
    name: defaultHandler<CardData['name']>('string', { patchable: false }),
    nature: enumHandler(NatureCardEnum, { patchable: false, postable: false }),
    network: enumHandler(NetworkCardEnum, { postable: false, patchable: false }),
    number: defaultHandler<CardData['number']>('string', { gettable: false, patchable: false, postRequired: true }),
    preferredNetwork: enumHandler(PreferredNetworkCardEnum, { patchable: false }),
    tokenize: defaultHandler<CardData['tokenize']>('boolean', { gettable: false, patchable: false }),
    zipCode: defaultHandler<CardData['zipCode']>('string'),
  };

  constructor() {
    super({
      name: 'cards',
    });
  }
}
