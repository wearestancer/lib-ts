import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';

import { CustomerModel } from '#customer/model.js';
import { customerValidator } from '#customer/validator.js';
import { checkType, goldilocks, randomMonth, randomNumber, randomPastDate, randomString } from '#test/test-helper.js';

describe('Goldilocks', () => {
  const customer = new CustomerModel(customerValidator);

  it('Country', () => {
    goldilocks((value: string) => customer.setCountry(value), 'string', { min: 2, max: 2 });
    checkType((value: string) => customer.setCountry(value), ['string'], randomString(2, 2));
  });

  it('Email', () => {
    goldilocks((value: string) => customer.setEmail(value), 'string', { min: 1, max: 64 });
    checkType((value: string) => customer.setEmail(value), ['string'], randomString(1, 64));
  });

  it('ExternalId', () => {
    goldilocks((value: string) => customer.setExternalId(value), 'string', { min: 1, max: 36 });
    checkType((value: string) => customer.setExternalId(value), ['string'], randomString(1, 36));
  });

  it('LegalId', () => {
    goldilocks((value: string) => customer.setLegalId(value), 'string', { min: 1, max: 16 });
    checkType((value: string) => customer.setLegalId(value), ['string'], randomString(1, 16));
  });

  it('Mobile', () => {
    goldilocks((value: string) => customer.setMobile(value), 'string', { min: 1, max: 16 });
  });
  it('Name', () => {
    goldilocks((value: string) => customer.setName(value), 'string', { min: 1, max: 64 });
    checkType((value: string) => customer.setName(value), ['string'], randomString(3, 64));
  });

  it('DateBirth', () => {
    const falseDateBirth = new Temporal.PlainDate(9999, randomMonth(), randomNumber(1, 30));
    const DateBirth = randomPastDate();
    expect(() => customer.setDateBirth(falseDateBirth)).toThrow();
    customer.setDateBirth(DateBirth);
    expect(customer.dateBirth).toBe(DateBirth);
  });

  it('billingAddress', () => {
    const falseAddress = randomString(1, 28);
    const trueAddress = `addr_${randomString(24)}`;
    expect(() => (customer._data.billingAddress = falseAddress)).toThrow();
    customer._data.billingAddress = trueAddress;
    expect(customer.billingAddress).toBe(trueAddress);
  });

  it('shippingAddress', () => {
    const falseAddress = randomString(1, 28);
    const trueAddress = `addr_${randomString(24)}`;
    expect(() => (customer._data.shippingAddress = falseAddress)).toThrow();
    customer._data.shippingAddress = trueAddress;
    expect(customer.shippingAddress).toBe(trueAddress);
  });
});
