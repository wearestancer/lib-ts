import { IdValue } from '#core/common/branded-type.js';
import { randomNumber, randomString } from '#test/test-helper.js';

const id = 'stub_' + randomString(24, 24);
const defaultValue = randomString(1, 50);
const defaultNumber = randomNumber(12, 200);
export const stubSerialized = {
  id,
  default: defaultValue,
  default_number: defaultNumber,
  untouchable: false,
  all_authorized: true,
  ungettable: false,
  unmodifiable: false,
};
export const stubDeserialized = {
  id: id as IdValue,
  default: defaultValue,
  defaultNumber: defaultNumber,
  allAuthorized: true,
  unmodifiable: false,
};
