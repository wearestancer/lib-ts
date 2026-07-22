import { Temporal } from 'temporal-polyfill';

import { IdCustomer } from '#customer/model.js';
import { randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdAddress } from '../../../src/address/temporary-types';

const billing_address = 'addr_' + randomString(24);
const country = randomString(2);
const created = randomNumber(1786460000, 2000000000);
const date_birth = `${randomNumber(1000, 2025)}-${randomMonth().toString().padStart(2, '0')}-${randomNumber(1, 28).toString().padStart(2, '0')}`;
const deleted = false;
const email = randomString(1, 64);
const external_id = randomString(1, 36);
const id = `cust_${randomString(24)}`;
const legal_id = randomString(1, 16);
const mobile = randomString(4, 16);
const name = randomString(3, 64);
const shipping_address = 'addr_' + randomString(24);

export const endpointResource = {
  billing_address,
  country,
  created,
  date_birth,
  deleted,
  email,
  external_id,
  id,
  legal_id,
  mobile,
  name,
  shipping_address,
};

export const endpointResourceDeserialized = {
  createdAt: Temporal.Instant.fromEpochMilliseconds(created * 1000),

  billingAddress: billing_address as IdAddress,
  country,
  dateBirth: Temporal.PlainDate.from(date_birth),
  deleted,
  email,
  externalId: external_id,
  id: id as IdCustomer,
  legalId: legal_id,
  mobile,
  name,
  shippingAddress: shipping_address as IdAddress,
};

export const creationResource = {
  billingAddress: billing_address,
  country,
  dateBirth: Temporal.PlainDate.from(date_birth),
  email,
  externalId: external_id,
  id,
  legalId: legal_id,
  mobile,
  name,
  shippingAddress: shipping_address,
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
