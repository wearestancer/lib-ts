import { Temporal } from 'temporal-polyfill';
import { describe, it } from 'vitest';

import { type PaymentIntentStatus, PaymentIntentStatusEnum } from '#payment-intent/enum/status.js';
import { IdPaymentIntent, PaymentIntentModel } from '#payment-intent/model.js';
import { Currency, CurrencyEnum } from '#payment/enum/currency.ts';
import { Method, MethodEnum } from '#payment/enum/method.ts';
import { PaymentAmount, paymentAmount } from '#payment/model.js';
import { SetterGetter, SetterGetterId, randomNumber, randomPastDate, randomString } from '#test/test-helper.js';

import { IdAddress } from '../../../src/address/model';
import { IdCard } from '../../../src/card/model';
import { IdCustomer } from '../../../src/customer/model';

describe('Setter & Getter', () => {
  const paymentIntent = new PaymentIntentModel({});

  it('id', () => {
    SetterGetterId((value: IdPaymentIntent) => new PaymentIntentModel({}, value), 'paym_' + randomString(24));
  });

  it('amount', () => {
    SetterGetter(
      (value: PaymentAmount) => {
        paymentIntent.setAmount(value);
      },
      () => paymentIntent.amount,
      paymentAmount(randomNumber(50, 3000)),
    );
  });

  it('billing address', () => {
    SetterGetter(
      (value: IdAddress) => paymentIntent.setBillingAddress(value),
      () => paymentIntent.billingAddress,
      'addr_' + randomString(24),
    );
  });

  it('card', () => {
    SetterGetter(
      (value: IdCard) => paymentIntent.setCard(value),
      () => paymentIntent.card,
      'card_' + randomString(24),
    );
  });

  it.each(CurrencyEnum.map((n) => [n]))('currency %s', (currency: Currency) => {
    paymentIntent._data.currency = null;
    SetterGetter(
      (value: Currency) => paymentIntent.setCurrency(value),
      () => paymentIntent.currency,
      currency,
    );
  });

  it('customer', () => {
    SetterGetter(
      (value: IdCustomer) => paymentIntent.setCustomer(value),
      () => paymentIntent.customer,
      'cust_' + randomString(24),
    );
  });

  it('dateSettlement', () => {
    SetterGetter(
      (value: Temporal.PlainDate) => (paymentIntent._data.dateSettlement = value),
      () => paymentIntent.dateSettlement,
      randomPastDate(),
    );
  });

  it('description', () => {
    SetterGetter(
      (value: string) => paymentIntent.setDescription(value),
      () => paymentIntent.description,
      randomString(24),
    );
  });

  it.each(MethodEnum.map((n) => [[n]]))('methodsAllowed %s', (method) => {
    paymentIntent._data.methodsAllowed = null;
    SetterGetter(
      (value: Method[]) => paymentIntent.setMethodsAllowed(value),
      () => paymentIntent.methodsAllowed,
      method,
    );
  });

  it('orderId', () => {
    SetterGetter(
      (value: string) => paymentIntent.setOrderId(value),
      () => paymentIntent.orderId,
      randomString(24),
    );
  });

  it('origin', () => {
    SetterGetter(
      (value: number) => (paymentIntent._data.origin = value),
      () => paymentIntent.origin,
      randomNumber(0, 8),
    );
  });

  it('returnUrl', () => {
    paymentIntent._data.returnUrl = null;
    SetterGetter(
      (value: string) => paymentIntent.setReturnUrl(value),
      () => paymentIntent.returnUrl,
      randomString(1, 1000),
    );
  });

  it('Sepa', () => {
    paymentIntent._data.sepa = null;
    SetterGetter(
      (value: string) => paymentIntent.setSepa(value),
      () => paymentIntent.sepa,
      'sepa_' + randomString(24),
    );
  });

  it('Shipping address', () => {
    SetterGetter(
      (value: IdAddress) => paymentIntent.setShippingAddress(value),
      () => paymentIntent.shippingAddress,
      'addr_' + randomString(24),
    );
  });

  it.each(PaymentIntentStatusEnum.map((n) => [n]))('status %s', (status) => {
    paymentIntent._data.status = null;
    SetterGetter(
      (value: PaymentIntentStatus) => (paymentIntent._data.status = value),
      () => paymentIntent.status,
      status,
    );
  });

  it('url', () => {
    paymentIntent._data.url = null;
    SetterGetter(
      (value: string) => (paymentIntent._data.url = value),
      () => paymentIntent.url,
      randomString(1, 2048),
    );
  });

  it('uniqueId', () => {
    SetterGetter(
      (value: string) => paymentIntent.setUniqueId(value),
      () => paymentIntent.uniqueId,
      randomString(24),
    );
  });
});
