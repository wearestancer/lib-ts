import { describe, expect, it } from 'vitest';

import { FundingCardEnum } from '#card/enum/funding.js';
import { NatureCardEnum } from '#card/enum/nature.js';
import { NetworkCardEnum, PreferredNetworkCardEnum } from '#card/enum/network.js';
import { CardModel } from '#card/model.js';
import { cardValidator } from '#card/validator.js';
import { checkType, goldilocks, randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdCustomer } from '../../../src/customer/model';
import { randomCardNumber } from './card-helper';

describe('Goldilocks', () => {
  const card = new CardModel(cardValidator);

  it('country', () => {
    goldilocks((value: string) => (card._data.country = value), 'string', { min: 2, max: 2 });
    checkType((value: string) => (card._data.country = value), ['string'], randomString(2, 2));
  });
  it('customer', () => {
    const falseCustomer = randomString(24);
    const trueCustomer = `cust_${randomString(24)}` as IdCustomer;
    expect(() => card.setCustomer(falseCustomer)).toThrow();
    card.setCustomer(trueCustomer);
    expect(card.customer).toBe(trueCustomer);
  });
  it('cvc', () => {
    const cvc = String(randomNumber(0, 999)).padStart(3, '0');
    expect(() => card.setCvc(cvc.padStart(4, '0'))).toThrow();
    expect(() => card.setCvc(String(randomNumber(0, 99)).padStart(2, '0'))).toThrow();
    expect(() => card.setCvc(randomString(3))).toThrow();

    checkType((value: string) => card.setCvc(value), ['string'], cvc);
  });

  it('expMonth', () => {
    checkType((value: number) => card.setExpMonth(value), ['number'], randomMonth());
    goldilocks((value: number) => card.setExpMonth(value), 'number', { min: 1, max: 12 });
  });

  it('expYear', () => {
    checkType((value: number) => card.setExpYear(value), ['number'], randomNumber(1000, 9999));
    goldilocks((value: number) => card.setExpYear(value), 'number', { min: 1000, max: 9999 });
  });

  it('externalId', () => {
    goldilocks((value: string) => card.setExternalId(value), 'string', { min: 1, max: 36 });
    checkType((value: string) => card.setExternalId(value), ['string'], randomString(1, 36));
  });

  it.each(FundingCardEnum.map((n) => [n]))('funding', (funding) => {
    const falseFunding = randomString(123, 188);
    expect(() => (card._data.funding = falseFunding)).toThrow();
    card._data.funding = funding;
    expect(card.funding).toBe(funding);
  });

  it('name', () => {
    goldilocks((value: string) => card.setName(value), 'string', { min: 1, max: 64 });
    checkType((value: string) => card.setName(value), ['string'], randomString(1, 64));
  });

  it.each(NatureCardEnum.map((n) => [n]))('nature', (nature) => {
    const falseNature = randomString(123, 188);
    expect(() => (card._data.nature = falseNature)).toThrow();
    card._data.nature = nature;
    expect(card.nature).toBe(nature);
  });

  it.each(NetworkCardEnum.map((n) => [n]))('network', (network) => {
    const falseNetwork = randomString(123, 188);
    expect(() => (card._data.network = falseNetwork)).toThrow();
    card._data.network = network;
    expect(card.network).toBe(network);
  });

  it('number', () => {
    const falseCardNumber = String(Number(randomCardNumber()) + 1);
    expect(() => card.setNumber(falseCardNumber)).toThrow();
    const trueCardNumber = randomCardNumber();
    card.setNumber(trueCardNumber);
    expect(card._data.number).toBe(trueCardNumber);
  });

  it.each(PreferredNetworkCardEnum.map((n) => [n]))('preferredNetwork', (network) => {
    const falsePreferredNetwork = randomString(123, 188);
    expect(() => card.setPreferredNetwork(falsePreferredNetwork)).toThrow();
    card.setPreferredNetwork(network);
    expect(card.preferredNetwork).toBe(network);
  });

  it('zipCode', () => {
    goldilocks((value: string) => card.setZipCode(value), 'string', { min: 0, max: 8 });
    checkType((value: string) => card.setZipCode(value), ['string'], randomString(0, 8));
  });
});
