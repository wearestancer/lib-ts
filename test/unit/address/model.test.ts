import { describe, it } from 'vitest';

import { AddressData, AddressModel } from '#address/model.js';
import { Validator } from '#core/validator.js';
import { SetterGetter, randomNumber, randomString } from '#test/test-helper.js';

describe('Address Class', () => {
  describe('Test Setter & Getters', () => {
    const address = new AddressModel((() => true) as unknown as Validator<AddressData>);

    it('line1', () => {
      SetterGetter(
        (value: string) => address.setLine1(value),
        () => address.line1,
        randomString(1, 64),
      );
    });

    it('line2', () => {
      SetterGetter(
        (value: string) => address.setLine2(value),
        () => address.line2,
        randomString(1, 64),
      );
    });

    it('line3', () => {
      SetterGetter(
        (value: string) => address.setLine3(value),
        () => address.line3,
        randomString(1, 64),
      );
    });

    it('country', () => {
      SetterGetter(
        (value: string) => address.setCountry(value),
        () => address.country,
        randomString(2, 2),
      );
    });

    it('zipCode', () => {
      SetterGetter(
        (value: string) => address.setZipCode(value),
        () => address.zipCode,
        randomString(1, 16),
      );
    });

    it('State', () => {
      SetterGetter(
        (value: string) => address.setState(value),
        () => address.state,
        randomString(1, 3),
      );
    });

    it('City', () => {
      SetterGetter(
        (value: string) => address.setCity(value),
        () => address.city,
        randomString(1, 50),
      );
    });

    it('deleted', () => {
      SetterGetter(
        (value: boolean) => (address._data.deleted = value),
        () => address.deleted,
        Boolean(randomNumber(0, 1)),
      );
    });
  });
});
