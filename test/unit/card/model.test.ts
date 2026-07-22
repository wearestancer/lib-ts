import { describe, it } from 'vitest';

import { FundingCardEnum } from '#card/enum/funding.js';
import { NatureCardEnum } from '#card/enum/nature.js';
import { NetworkCardEnum, PreferredNetworkCardEnum } from '#card/enum/network.js';
import { CardData, CardModel } from '#card/model.js';
import { Validator } from '#core/validator.js';
import { IdCustomer } from '#customer/model.ts';
import { SetterGetter, randomExpYear, randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { randomCardNumbers } from './card-helper';

describe('card Class', () => {
  const card = new CardModel((() => true) as unknown as Validator<CardData>);

  describe('Setter & Getter', () => {
    it('brand', () => {
      SetterGetter(
        (value: string) => (card._data.brand = value),
        () => card.brand,
        randomString(30),
      );
    });

    it('deleted (unsettable)', () => {
      SetterGetter(
        (value: boolean) => (card._data.deleted = value),
        () => card.deleted,
        true,
      );
      card._data.deleted = null;
      SetterGetter(
        (value: boolean) => (card._data.deleted = value),
        () => card.deleted,
        false,
      );
    });

    it('country', () => {
      SetterGetter(
        (value: string) => (card._data.country = value),
        () => card.country,
        randomString(2),
      );
    });

    it('customer', () => {
      SetterGetter(
        (value: IdCustomer) => card.setCustomer(value),
        () => card.customer,
        ``,
      );
    });

    it('cvc', () => {
      SetterGetter(
        (value: string) => card.setCvc(value),
        () => card._data.cvc,
        randomString(3),
      );
    });

    it('expMonth', () => {
      SetterGetter(
        (value: number) => card.setExpMonth(value),
        () => card.expMonth,
        randomMonth(),
      );
    });

    it('expYear', () => {
      SetterGetter(
        (value: string) => card.setExpYear(value),
        () => card.expYear,
        randomExpYear(),
      );
    });

    it('externalId', () => {
      SetterGetter(
        (value: string) => card.setExternalId(value),
        () => card.externalId,
        randomString(1, 36),
      );
    });

    it.each([FundingCardEnum.map((value) => [value])])('funding', (value) => {
      SetterGetter(
        (value: (typeof FundingCardEnum)[number]) => (card._data.funding = value),
        () => card.funding,
        value,
      );
    });

    it('last4', () => {
      SetterGetter(
        (value: string) => (card._data.last4 = value),
        () => card.last4,
        String(randomNumber(0, 9999)).padStart(4, '0'),
      );
    });

    it('name', () => {
      SetterGetter(
        (value: string) => card.setName(value),
        () => card.name,
        randomString(1, 64),
      );
    });

    it.each([NatureCardEnum.map((value) => [value])])('nature', (value) => {
      SetterGetter(
        (value: (typeof NatureCardEnum)[number]) => (card._data.nature = value),
        () => card.nature,
        value,
      );
    });

    it.each([NetworkCardEnum.map((value) => [value])])('network', (value) => {
      SetterGetter(
        (value: (typeof NetworkCardEnum)[number]) => (card._data.network = value),
        () => card.network,
        value,
      );
    });

    it.each((randomCardNumbers() as string[]).map((value) => [value]))('number %s', (number) => {
      card._data.number = null;
      SetterGetter(
        (value: string) => card.setNumber(value),
        () => card._data.number,
        number,
      );
    });

    it.each(PreferredNetworkCardEnum.map((value) => [value]))('preferredNetwork %s', (value) => {
      card._data.preferredNetwork = null;
      SetterGetter(
        (value: (typeof PreferredNetworkCardEnum)[number]) => card.setPreferredNetwork(value),
        () => card.preferredNetwork,
        value,
      );
    });

    it('tokenize (unsettable)', () => {
      SetterGetter(
        (value: boolean) => (card._data.tokenize = value),
        () => card._data.tokenize,
        true,
      );
      card._data.tokenize = null;
      SetterGetter(
        (value: boolean) => (card._data.tokenize = value),
        () => card._data.tokenize,
        false,
      );
    });

    it('zipCode', () => {
      SetterGetter(
        (value: string) => card.setZipCode(value),
        () => card._data.zipCode,
        randomString(2, 8),
      );
    });
  });
});
