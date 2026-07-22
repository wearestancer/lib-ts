import { describe, it } from 'vitest';

import { addressValidator } from '#address/validator.js';
import { processValidator } from '#core/validator.js';
import { checkType, goldilocks, randomString } from '#test/test-helper.js';

const validator = processValidator(addressValidator);

describe('Test boundaries', () => {
  const goldilocksLine = (line: CallableFunction) => goldilocks(line, 'string', { min: 1, max: 50 });

  it('line1', () => {
    goldilocksLine((value: string) => validator('line1', value));
    checkType((value: string) => validator('line1', value), ['string'], randomString(1, 50));
  });

  it('line2', () => {
    goldilocksLine((value: string) => validator('line2', value));

    checkType((value: string) => validator('line2', value), ['string'], randomString(1, 50));
  });

  it('line3', () => {
    goldilocksLine((value: string) => validator('line3', value));

    checkType((value: string) => validator('line3', value), ['string'], randomString(1, 50));
  });

  it('ZipCode', () => {
    goldilocks((value: string) => validator('zipCode', value), 'string', { min: 2, max: 16 });
    checkType((value: string) => validator('zipCode', value), ['string'], randomString(2, 16));
  });

  it('state', () => {
    goldilocks((value: string) => validator('state', value), 'string', { min: 1, max: 3 });

    checkType((value: string) => validator('state', value), ['string'], randomString(1, 3));
  });

  it('country', () => {
    goldilocks((value: string) => validator('country', value), 'string', { min: 2, max: 2 });
    checkType((value: string) => validator('country', value), ['string'], randomString(2, 2));
  });

  it('city', () => {
    goldilocks((value: string) => validator('city', value), 'string', { min: 1, max: 50 });
    checkType((value: string) => validator('city', value), ['string'], randomString(1, 50));
  });
});
