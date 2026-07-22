import { randomNumber, randomString } from '#test/test-helper.js';

const stub = {
  stubs: [
    {
      id: 'stub_' + randomString(24, 24),
      default: randomString(1, 50),
      defaultNumber: randomNumber(12, 263),
      untouchable: true,
      all_authorized: true,
      ungettable: true,
      unmodifiable: true,
    },
    {
      id: 'stub_' + randomString(24, 24),
      default: randomString(1, 50),
      defaultNumber: randomNumber(12, 263),
      untouchable: true,
      all_authorized: true,
      ungettable: true,
      unmodifiable: true,
    },
  ],
  range: {
    count: 2080,
    end: 9,
    has_more: false,
    limit: 2,
    start: 0,
  },
};

export default stub;
