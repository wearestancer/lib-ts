import { Temporal } from 'temporal-polyfill';

import { FundingCardEnum } from '#card/enum/funding.js';
import { NatureCardEnum } from '#card/enum/nature.js';
import { NetworkCardEnum, PreferredNetworkCardEnum } from '#card/enum/network.js';
import { idCard } from '#card/model.js';
import { idCustomer } from '#customer/model.ts';
import { randomCVC, randomExpYear, randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { randomCardNumber } from './card-helper';

const id = `card_${randomString(24)}`;

const brand = randomString(2, 10);
const country = randomString(2);
const customer = `cust_${randomString(24)}`;
const cvc = randomCVC();
const created = randomNumber(1786460000, 2000000000);
const deleted = false;
const expMonth = randomMonth();
const expYear = randomExpYear();
const externalId = randomString(1, 36);
const funding = FundingCardEnum[randomNumber(0, FundingCardEnum.length - 1)];
const number = randomCardNumber();
const last4 = number.slice(number.length - 4);
const name = randomString(1, 64);
const nature = NatureCardEnum[randomNumber(0, NatureCardEnum.length - 1)];
const network = NetworkCardEnum[randomNumber(0, NetworkCardEnum.length - 1)];
const preferredNetwork = PreferredNetworkCardEnum[randomNumber(0, PreferredNetworkCardEnum.length - 1)];
const tokenize = Boolean(randomNumber(0, 1));
const zipCode = randomString(2, 8);

export const endpointResource = {
  id,
  brand,
  country,
  customer,
  cvc,
  created,
  deleted,
  exp_month: expMonth,
  exp_year: expYear,
  external_id: externalId,
  funding,
  last4,
  name,
  nature,
  network,
  number,
  preferred_network: preferredNetwork,
  zip_code: zipCode,
};

export const endpointResourceDeserialized = {
  id: idCard(id),
  brand,
  country,
  customer: idCustomer(customer),
  createdAt: Temporal.Instant.fromEpochMilliseconds(created * 1000),
  deleted,
  expMonth,
  expYear,
  externalId,
  funding,
  last4,
  name,
  nature,
  network,
  preferredNetwork,
  zipCode,
};

export const creationResource = {
  cvc,
  number,
  tokenize,
};
export const listResource = [
  {
    ...endpointResource,
    name: 'item1',
  },
  {
    ...endpointResource,
    name: 'item2',
  },
];
