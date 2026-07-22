import { Temporal } from 'temporal-polyfill';

import { randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdCustomer } from '../../../src/customer/model';
import { bicDataProvider, ibanDataProvider } from './sepa-helper';

const id = `sepa_${randomString(24)}`;

const bic = bicDataProvider(true) as string;
const created = randomNumber(1786460000, 2000000000);
const customer = `cust_${randomString(24)}`;
const deleted = false;
const date_mandate = `${String(randomNumber(1971, 2020))}-${String(randomMonth()).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`;
const dateMandate = Temporal.PlainDate.from(date_mandate);
const iban = ibanDataProvider(true) as string;
const last4 = iban.slice(iban.length - 4);
const mandate = randomString(1, 35);
const name = randomString(1, 64);

export const endpointResource = {
  bic,
  created,
  customer,
  date_mandate: date_mandate,
  deleted,
  id,
  last4,
  mandate,
  name,
};

export const endpointResourceDeserialized = {
  bic,
  createdAt: Temporal.Instant.fromEpochMilliseconds(created * 1000),
  customer: customer as IdCustomer,
  dateMandate,
  deleted,
  id,
  last4,
  mandate,
  name,
};
export const creationResource = {
  mandate,
  name,
  dateMandate,
  iban,
  bic,
  customer,
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
