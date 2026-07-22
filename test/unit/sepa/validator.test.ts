import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';

import { idCustomer } from '#customer/model.ts';
import { SepaModel } from '#sepa/model.js';
import { sepaValidator } from '#sepa/validator.js';
import { checkType, goldilocks, randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { ibanDataProvider } from './sepa-helper';

describe('Goldilocks', () => {
  const sepa = new SepaModel(sepaValidator);

  it('bic', () => {
    goldilocks((value: string) => sepa.setBic(value), 'string', { min: 8, max: 11 });
    checkType((value: string) => (sepa._data.bic = value), ['string'], randomString(8, 11));
  });

  it('customer', () => {
    const falseCustomer = randomString(24);
    const trueCustomer = idCustomer(`cust_${randomString(24)}`);
    expect(() => sepa.setCustomer(falseCustomer)).toThrow();
    sepa.setCustomer(trueCustomer);
    expect(sepa.customer).toBe(trueCustomer);
  });

  it('dateMandate', () => {
    const falseDateMandate = new Temporal.PlainDate(9999, randomMonth(), randomNumber(1, 28));
    const notInstantDateMandate = new Temporal.PlainDate(1969, randomMonth(), randomNumber(1, 28));
    const dateMandate = new Temporal.PlainDate(
      randomNumber(1971, Temporal.Now.plainDateISO().year),
      randomMonth(),
      randomNumber(1, 28),
    );
    expect(() => sepa.setDateMandate(falseDateMandate)).toThrow();
    expect(() => sepa.setDateMandate(notInstantDateMandate)).toThrow();
    sepa.setDateMandate(dateMandate);
    expect(sepa.dateMandate).toBe(dateMandate);
  });

  it('iban', () => {
    const falseSepaNumber = randomString(14, 34);
    expect(() => sepa.setIban(falseSepaNumber)).toThrow();
    const trueSepaNumber = ibanDataProvider(true);
    sepa.setIban(trueSepaNumber);
    expect(sepa._data.iban).toBe(trueSepaNumber);
  });

  it('mandate', () => {
    goldilocks((value: string) => sepa.setMandate(value), 'string', { min: 1, max: 35 });
    checkType((value: string) => sepa.setMandate(value), ['string'], randomString(1, 35));
  });

  it('name', () => {
    goldilocks((value: string) => sepa.setName(value), 'string', { min: 3, max: 64 });
    checkType((value: string) => sepa.setName(value), ['string'], randomString(3, 64));
  });
});
