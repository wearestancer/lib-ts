import { randomNumber, randomString } from '#test/test-helper.js';

const model = {
  default: randomString(1, 50),
  defaultNumber: randomNumber(12, 100),
  untouchable: true,
  allAuthorized: true,
  ungettable: true,
  unmodifiable: true,
};

export default model;
