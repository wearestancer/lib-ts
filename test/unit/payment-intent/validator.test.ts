import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';

import { PaymentIntentStatus, PaymentIntentStatusEnum } from '#payment-intent/enum/status.js';
import { type ThreeDS, ThreeDSEnum } from '#payment-intent/enum/threeds.js';
import { PaymentIntentModel } from '#payment-intent/model.js';
import { PaymentIntentValidator } from '#payment-intent/validator.js';
import { Currency, CurrencyEnum } from '#payment/enum/currency.js';
import { PaymentAmount, PaymentModel, paymentAmount } from '#payment/model.js';
import { IdSepa } from '#sepa/model.js';
import { checkType, goldilocks, goldilocksId, randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdAddress } from '../../../src/address/model';
import { IdCard } from '../../../src/card/model';
import { IdCustomer } from '../../../src/customer/model';

describe('Goldilocks & type', () => {
  const paymentIntent = new PaymentIntentModel(PaymentIntentValidator);

  it('amount', () => {
    goldilocks((value: PaymentAmount) => paymentIntent.setAmount(value), 'number', { min: 0 });
    checkType((value: PaymentAmount) => paymentIntent.setAmount(value), ['number'], paymentAmount(randomNumber(50)));
  });

  it('billing address', () => {
    goldilocksId((value: IdAddress) => paymentIntent.setBillingAddress(value), 'addr_');
    checkType(
      (value: IdAddress) => paymentIntent.setBillingAddress(value),
      ['object', 'string'],
      `addr_${randomString(24)}`,
    );
  });

  it('capture', () => {
    checkType((value: boolean) => (paymentIntent._data.capture = value), ['boolean'], true);
  });

  it('card', () => {
    goldilocksId((value: IdCard) => paymentIntent.setCard(value), 'card_');
    checkType((value: IdCard) => paymentIntent.setCard(value), ['string', 'object'], `card_${randomString(24)}`);
  });

  it.each(CurrencyEnum.map((n) => [n]))('currency %s', (currency) => {
    const falseCurrency = randomString(3);
    expect(() => paymentIntent.setCurrency(falseCurrency)).toThrow();
    paymentIntent.setCurrency(currency);
    expect(paymentIntent.currency).toBe(currency);
    checkType((value: Currency) => paymentIntent.setCurrency(value), [], currency);
  });

  it('Customer', () => {
    const falseCustomer = randomString(24);
    const trueCustomer = `cust_${randomString(24)}`;
    expect(() => paymentIntent.setCustomer(falseCustomer)).toThrow();
    goldilocksId((value: IdCustomer) => paymentIntent.setCustomer(value), 'cust_');
    checkType((value: IdCustomer) => paymentIntent.setCustomer(value), ['string'], trueCustomer);
  });

  it('DateSettlement', () => {
    const falseDateSettlement = new Temporal.PlainDate(9999, randomMonth(), randomNumber(1, 28));

    const DateSettlement = new Temporal.PlainDate(
      randomNumber(1971, Temporal.PlainDate.from(Temporal.Now.plainDateISO()).year),
      randomMonth(),
      randomNumber(1, 30),
    );
    expect(() => paymentIntent.setDateSettlement(falseDateSettlement)).toThrow();
    paymentIntent.setDateSettlement(DateSettlement);
    expect(paymentIntent.dateSettlement).toBe(DateSettlement);
  });

  it('Description', () => {
    goldilocks((value: string) => paymentIntent.setDescription(value), 'string', { min: 1, max: 64 });
    checkType((value: string) => paymentIntent.setDescription(value), ['string'], randomString(64));
  });

  it('orderId', () => {
    goldilocks((value: string) => paymentIntent.setOrderId(value), 'string', { min: 1, max: 36 });
    checkType((value: string) => paymentIntent.setOrderId(value), ['string'], randomString(24));
  });

  it('payment', () => {
    checkType(
      (value: PaymentModel) => (paymentIntent._data.payment = value),
      ['string', 'object'],
      `paym_${randomString(24)}`,
    );
    const newPaymentIntent = new PaymentIntentModel(PaymentIntentValidator);
    expect(() => newPaymentIntent._data.payment(IdPayment(`paym_${randomString(24)}`)));
  });

  it('returnUrl', () => {
    goldilocks((value: string) => paymentIntent.setReturnUrl(value), 'string', { min: 1, max: 2048 });
    checkType((value: string) => paymentIntent.setReturnUrl(value), ['string'], randomString(24));
  });

  it('Sepa', () => {
    goldilocksId((value: IdSepa) => paymentIntent.setSepa(value), 'sepa_');
    checkType((value: IdSepa) => paymentIntent.setSepa(value), ['string', 'object'], `sepa_${randomString(24)}`);
  });

  it('shipping address', () => {
    goldilocksId((value: IdAddress) => paymentIntent.setShippingAddress(value), 'addr_');
    checkType(
      (value: IdAddress) => paymentIntent.setShippingAddress(value),
      ['object', 'string'],
      `addr_${randomString(24)}`,
    );
  });

  it.each(PaymentIntentStatusEnum.map((n) => [n]))('paymentIntent status %s', (status) => {
    const falseStatus = randomString(100, 200);
    expect(() => (paymentIntent._data.status = falseStatus)).toThrow();
    paymentIntent._data.status = status;
    expect(paymentIntent.status).toBe(status);
    checkType((value: PaymentIntentStatus) => (paymentIntent._data.status = value), [], status);
  });

  it.each(ThreeDSEnum.map((n) => [n]))('paymentIntent status %s', (threeds) => {
    const falsethreeds = randomString(100, 200);
    expect(() => (paymentIntent._data.threeds = falsethreeds)).toThrow();
    paymentIntent._data.threeds = threeds;
    expect(paymentIntent.threeDS).toBe(threeds);
    checkType((value: ThreeDS) => (paymentIntent._data.threeds = value), [], threeds);
  });

  it('url', () => {
    goldilocks((value: string) => (paymentIntent._data.url = value), 'string', { min: 1, max: 2048 });
    checkType((value: string) => (paymentIntent._data.url = value), ['string'], randomString(24));
  });

  it('uniqueId', () => {
    goldilocks((value: string) => paymentIntent.setUniqueId(value), 'string', { min: 1, max: 36 });
    checkType((value: string) => paymentIntent.setUniqueId(value), ['string'], randomString(24));
  });
});
