import { Temporal } from 'temporal-polyfill';

import { idAddress } from '#address/model.js';
import { randomNumber, randomString } from '#test/test-helper.js';

const city = randomString(1, 50);
const country = randomString(2);
// arbitrary future timestamp, we don't really care about it except that is is a timestamp
const created_at = randomNumber(1786460000, 2000000000);
const deleted = false;
const id = idAddress('addr_' + randomString(24));
const line1 = randomString(1, 50);
const line2 = randomString(1, 50);
const line3 = randomString(1, 50);
const state = randomString(1, 3);
const zip_code = randomString(2, 16);

export const endpointResource = {
  city,
  country,
  created_at, // actual API field in snake_case
  deleted,
  id,
  line1,
  line2,
  line3,
  state,
  zip_code, // actual API field in snake_case
};

export const endpointResourceDeserialized = {
  city,
  country,
  createdAt: Temporal.Instant.fromEpochMilliseconds(created_at * 1000),
  deleted,
  id,
  line1,
  line2,
  line3,
  state,
  zipCode: zip_code,
};

export const creationResource = {
  city,
  country,
  line1,
  line2,
  line3,
  state,
  zip_code,
};

export const listResource = [
  endpointResource,
  {
    ...endpointResource,
    city: randomString(1, 50),
  },
];
