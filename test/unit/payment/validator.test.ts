import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';

import { Currency, CurrencyEnum } from '#payment/enum/currency.ts';
import { Method, MethodEnum } from '#payment/enum/method.ts';
import { PaymentStatus, StatusEnum } from '#payment/enum/status.ts';
import { Device, PaymentModel } from '#payment/model.js';
import { paymentValidator } from '#payment/validator.js';
import { checkType, goldilocks, goldilocksId, randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdAddress } from '../../../src/address/model';
import { IdCard } from '../../../src/card/model';
import { IdCustomer } from '../../../src/customer/model';
import { IdPaymentIntent } from '../../../src/payment-intent/model';
import { IdSepa } from '../../../src/sepa/model';

describe('Goldilocks & type', () => {
  const payment = new PaymentModel(paymentValidator);
  it('id', () => {
    goldilocksId((value: string) => new PaymentModel(paymentValidator, value), 'paym_');
  });
  it('amount', () => {
    goldilocks((value: number) => payment.setAmount(value), 'number', { min: 0 });
    checkType((value: number) => payment.setAmount(value), ['number'], randomNumber(0, 20000000));
  });
  it('auth', () => {
    checkType((value: boolean) => (payment._data.auth = value), ['boolean'], true);
  });
  it('billing address', () => {
    goldilocksId((value: IdAddress) => payment.setBillingAddress(value), 'addr_');
    checkType((value: IdAddress) => payment.setBillingAddress(value), ['object', 'string'], `addr_${randomString(24)}`);
  });
  it('capture', () => {
    checkType((value: boolean) => payment.setCapture(value), ['boolean'], true);
  });
  it('card', () => {
    goldilocksId((value: IdCard) => payment.setCard(value), 'card_');
    checkType((value: IdCard) => payment.setCard(value), ['string', 'object'], `card_${randomString(24)}`);
  });

  it.each(CurrencyEnum.map((n) => [n]))('currency %s', (currency) => {
    const falseCurrency = randomString(3);
    expect(() => payment.setCurrency(falseCurrency)).toThrow();
    payment.setCurrency(currency);
    expect(payment.currency).toBe(currency);
    checkType((value: Currency) => payment.setCurrency(value), [], currency);
  });

  it('Customer', () => {
    const falseCustomer = randomString(24);
    const trueCustomer = `cust_${randomString(24)}`;
    expect(() => payment.setCustomer(falseCustomer)).toThrow();
    goldilocksId((value: IdCustomer) => payment.setCustomer(value), 'cust_');
    checkType((value: IdCustomer) => payment.setCustomer(value), ['string'], trueCustomer);
  });

  it('DateSettlement', () => {
    const falseDateSettlement = new Temporal.PlainDate(9999, randomMonth(), randomNumber(1, 30));

    const DateSettlement = new Temporal.PlainDate(
      randomNumber(1971, Temporal.PlainDate.from(Temporal.Now.plainDateISO()).year),
      randomMonth(),
      randomNumber(1, 30),
    );

    expect(() => payment.setDateSettlement(falseDateSettlement)).toThrow();

    payment.setDateSettlement(DateSettlement);

    expect(payment.dateSettlement).toBe(DateSettlement);
  });

  it('Description', () => {
    goldilocks((value: string) => payment.setDescription(value), 'string', { min: 1, max: 64 });
    checkType((value: string) => payment.setDescription(value), ['string'], randomString(64));
  });

  it('device', () => {
    checkType((value: Device | boolean) => payment.setDevice(value), ['object', 'boolean'], { city: 'city' });
    checkType((value: Device | boolean) => payment.setDevice(value), ['object', 'boolean'], true);
  });

  it.each(MethodEnum.map((n) => [[n]]))('method allowed: %s', (methodsAllowed) => {
    const falseMethodsAllowed = randomString(100, 200);
    expect(() => payment.setMethodsAllowed(falseMethodsAllowed)).toThrow();
    payment.setMethodsAllowed(methodsAllowed);
    expect(payment.methodsAllowed).toBe(methodsAllowed);
    checkType((value: Method[]) => payment.setMethodsAllowed(value), [], methodsAllowed);
  });

  it('orderId', () => {
    goldilocks((value: string) => payment.setOrderId(value), 'string', { min: 1, max: 36 });
    checkType((value: string) => payment.setOrderId(value), ['string'], randomString(24));
  });

  it('uniqueID', () => {
    goldilocks((value: string) => payment.setUniqueId(value), 'string', { min: 1, max: 36 });
    checkType((value: string) => payment.setUniqueId(value), ['string'], randomString(24));
  });

  it('returnUrl', () => {
    goldilocks((value: string) => payment.setReturnUrl(value), 'string', { min: 1, max: 2048 });
    checkType((value: string) => payment.setReturnUrl(value), ['string'], randomString(24));
  });

  it('Sepa', () => {
    payment._data.currency = 'eur';
    goldilocksId((value: IdSepa) => payment.setSepa(value), 'sepa_');
    checkType((value: IdSepa) => payment.setSepa(value), ['string', 'object'], `sepa_${randomString(24)}`);
  });

  it('shipping address', () => {
    goldilocksId((value: IdAddress) => payment.setShippingAddress(value), 'addr_');
    checkType(
      (value: IdAddress) => payment.setShippingAddress(value),
      ['object', 'string'],
      `addr_${randomString(24)}`,
    );
  });

  it('Payment intent', () => {
    goldilocksId((value: IdPaymentIntent) => (payment._data.paymentIntent = value), 'pi_');
    checkType(
      (value: IdPaymentIntent) => (payment._data.paymentIntent = value),
      ['string', 'object'],
      `pi_${randomString(24)}`,
    );
  });

  it.each(StatusEnum.map((n) => [n]))('payment status %s', (status) => {
    const falseStatus = randomString(100, 200);
    expect(() => (payment._data.status = falseStatus)).toThrow();
    payment._data.status = status;
    expect(payment.status).toBe(status);
    checkType((value: PaymentStatus) => (payment._data.status = value), [], status);
  });
});
