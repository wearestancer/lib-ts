import { describe, it } from 'vitest';

import { IdAddress, idAddress } from '#address/model.ts';
import { Validator } from '#core/validator.js';
import { CustomerData, CustomerModel } from '#customer/model.js';
import { SetterGetter, randomString } from '#test/test-helper.js';

describe('Customer Class', () => {
  describe('Setter & Getter', () => {
    const customer = new CustomerModel((() => true) as unknown as Validator<CustomerData>);

    it('country', () => {
      SetterGetter(
        (value: string) => customer.setCountry(value),
        () => customer.country,
        randomString(2),
      );
    });

    it('email', () => {
      SetterGetter(
        (value: string) => customer.setEmail(value),
        () => customer.email,
        randomString(30),
      );
    });

    it('externalId', () => {
      SetterGetter(
        (value: string) => customer.setExternalId(value),
        () => customer.externalId,
        randomString(30),
      );
    });

    it('legalId', () => {
      SetterGetter(
        (value: string) => customer.setLegalId(value),
        () => customer.legalId,
        randomString(15),
      );
    });

    it('mobile', () => {
      SetterGetter(
        (value: string) => customer.setMobile(value),
        () => customer.mobile,
        randomString(12),
      );
    });

    it('name', () => {
      SetterGetter(
        (value: string) => customer.setName(value),
        () => customer.name,
        randomString(12),
      );
    });

    it('billing Address', () => {
      SetterGetter(
        (value: IdAddress) => customer.setBillingAddress(value),
        () => customer.billingAddress,
        idAddress(`addr_${randomString(24)}`),
      );
    });

    it('Shipping Address', () => {
      SetterGetter(
        (value: IdAddress) => customer.setShippingAddress(value),
        () => customer.shippingAddress,
        idAddress(`addr_${randomString(24)}`),
      );
    });

    it('deleted (unsettable)', () => {
      SetterGetter(
        (value: boolean) => (customer._data.deleted = value),
        () => customer.deleted,
        true,
      );
      customer._data.deleted = null;
      SetterGetter(
        (value: boolean) => (customer._data.deleted = value),
        () => customer.deleted,
        false,
      );
    });
  });
});
