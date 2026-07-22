import { describe, it } from 'vitest';

import { Validator } from '#core/validator.js';
import { IdCustomer } from '#customer/model.ts';
import { SepaData, SepaModel } from '#sepa/model.js';
import { SetterGetter, randomPastDate, randomString } from '#test/test-helper.js';

import { bicDataProvider, ibanDataProvider } from './sepa-helper';

describe('sepa Class', () => {
  const sepa = new SepaModel((() => true) as unknown as Validator<SepaData>);

  describe('Setter & Getter', () => {
    it.each((bicDataProvider(false) as string[]).map((n) => [n]))('bic', (bic) => {
      sepa._data.bic = null;
      SetterGetter(
        (value: string) => sepa.setBic(value),
        () => sepa.bic,
        bic,
      );
    });

    it('deleted (unsettable)', () => {
      SetterGetter(
        (value: boolean) => (sepa._data.deleted = value),
        () => sepa.deleted,
        true,
      );
      sepa._data.deleted = null;
      SetterGetter(
        (value: boolean) => (sepa._data.deleted = value),
        () => sepa.deleted,
        false,
      );
    });

    it('customer', () => {
      SetterGetter(
        (value: IdCustomer) => sepa.setCustomer(value),
        () => sepa.customer,
        ``,
      );
    });

    it('dateMandate', () => {
      SetterGetter(
        (value: string) => sepa.setDateMandate(value),
        () => sepa.dateMandate,
        randomPastDate(),
      );
    });

    it('last4', () => {
      SetterGetter(
        (value: string) => (sepa._data.last4 = value),
        () => sepa.last4,
        randomString(4),
      );
    });

    it('mandate', () => {
      SetterGetter(
        (value: string) => sepa.setMandate(value),
        () => sepa.mandate,
        randomString(0, 35),
      );
    });

    it('name', () => {
      SetterGetter(
        (value: string) => sepa.setName(value),
        () => sepa.name,
        randomString(0, 64),
      );
    });

    it.each((ibanDataProvider() as string[]).map((value) => [value]))('iban %s', (value) => {
      sepa._data.iban = null;
      SetterGetter(
        (value: string) => sepa.setIban(value),
        () => sepa._data.iban,
        value,
      );
    });
  });
});
