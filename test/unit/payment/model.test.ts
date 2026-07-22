import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';

import { Currency, CurrencyEnum } from '#payment/enum/currency.ts';
import { Method, MethodEnum } from '#payment/enum/method.ts';
import { PaymentStatus, StatusEnum } from '#payment/enum/status.ts';
import { Device, IdPayment, PaymentModel } from '#payment/model.js';
import { SetterGetter, SetterGetterId, randomNumber, randomPastDate, randomString } from '#test/test-helper.js';

import { IdAddress } from '../../../src/address/model';
import { IdPaymentIntent } from '../../../src/payment-intent/model';
import { IdPayout } from '../../../src/payout/model';

describe('Setter & Getter', () => {
  const payment = new PaymentModel({});

  it('id', () => {
    SetterGetterId((value: IdPayment) => new PaymentModel({}, value), 'paym_' + randomString(24));
  });

  it('amount', () => {
    SetterGetter(
      (value: number) => {
        payment.setAmount(value);
      },
      () => payment.amount,
      randomNumber,
    );
  });

  it('auth', () => {
    SetterGetter(
      (value: boolean) => payment.setAuth(value),
      () => payment.auth,
      true,
    );
    payment._data.auth = null;
    expect(payment.auth).toBeNullable();
    payment.setAuth(false);
    expect(payment.auth).toBeNullable();
  });

  it('billing address', () => {
    SetterGetter(
      (value: string) => payment.setBillingAddress(value),
      () => payment.billingAddress,
      'addr_' + randomString(24),
    );
  });

  it('card', () => {
    SetterGetter(
      (value: string) => payment.setCard(value),
      () => payment.card,
      'card_' + randomString(24),
    );
  });

  it.each(CurrencyEnum.map((n) => [n]) as string[][])('currency %s', (currency: string) => {
    payment._data.currency = null;
    SetterGetter(
      (value: Currency) => payment.setCurrency(value),
      () => payment.currency,
      currency,
    );
  });

  it('customer', () => {
    SetterGetter(
      (value: string) => payment.setCustomer(value),
      () => payment.customer,
      'cust_' + randomString(24),
    );
  });

  it('datePayment', () => {
    SetterGetter(
      (value: Temporal.PlainDate) => (payment._data.datePayment = value),
      () => payment.datePayment,
      randomPastDate(),
    );
    payment._data.datePayment = null;
    SetterGetter(
      (value: Temporal.PlainDate) => (payment._data.datePayment = value),
      () => payment.datePaym,
      randomPastDate(),
    );
  });

  it('dateSettlement', () => {
    SetterGetter(
      (value: Temporal.PlainDate) => payment.setDateSettlement(value),
      () => payment.dateSettlement,
      randomPastDate(),
    );
  });

  it('date_bank', () => {
    SetterGetter(
      (value: Temporal.PlainDate) => (payment._data.dateBank = value),
      () => payment.dateBank,
      randomPastDate(),
    );
  });

  it('description', () => {
    SetterGetter(
      (value: string) => payment.setDescription(value),
      () => payment.description,
      randomString(24),
    );
  });

  it('device', () => {
    SetterGetter(
      (value: Device) => payment.setDevice(value),
      () => payment.device,
      {},
    );
  });

  it('fee', () => {
    SetterGetter(
      (value: number) => (payment._data.fee = value),
      () => payment.fee,
      randomNumber(0, 5000),
    );
  });

  it.each(MethodEnum.map((n) => [n]) as string[][])('method %s', (method) => {
    payment._data.method = null;

    SetterGetter(
      (value: string) => (payment._data.method = value),
      () => payment.method,
      method,
    );
  });

  it.each(MethodEnum.map((n) => [[n]]) as string[][][])('method %s', (method) => {
    payment._data.methodsAllowed = null;
    SetterGetter(
      (value: Method[]) => payment.setMethodsAllowed(value),
      () => payment.methodsAllowed,
      method,
    );
  });

  it('orderId', () => {
    SetterGetter(
      (value: string) => payment.setOrderId(value),
      () => payment.orderId,
      randomString(24),
    );
  });

  it('origin', () => {
    SetterGetter(
      (value: number) => (payment._data.origin = value),
      () => payment.origin,
      randomNumber(0, 8),
    );
  });

  it('uniqueId', () => {
    SetterGetter(
      (value: string) => payment.setUniqueId(value),
      () => payment.uniqueId,
      randomString(1, 32),
    );
  });

  it('response', () => {
    SetterGetter(
      (value: string) => (payment._data.response = value),
      () => payment.response,
      randomString(1, 32),
    );
  });

  it('responseAuthor', () => {
    SetterGetter(
      (value: string) => (payment._data.responseAuthor = value),
      () => payment.responseAuthor,
      randomString(1, 32),
    );
  });

  it('returnUrl', () => {
    payment._data.returnUrl = null;
    SetterGetter(
      (value: string) => payment.setReturnUrl(value),
      () => payment.returnUrl,
      randomString(1, 1000),
    );
  });

  it('Sepa', () => {
    payment._data.currency = 'eur';
    payment._data.sepa = null;
    SetterGetter(
      (value: string) => payment.setSepa(value),
      () => payment.sepa,
      'sepa_' + randomString(24),
    );
  });

  it('Shippping address', () => {
    SetterGetter(
      (value: IdAddress) => payment.setShippingAddress(value),
      () => payment.shippingAddress,
      'addr_' + randomString(24),
    );
  });

  it.each(StatusEnum.map((n) => [n]))('status %s', (status) => {
    payment._data.status = null;
    SetterGetter(
      (value: PaymentStatus) => payment.setStatus(value),
      () => payment.status,
      status,
    );
  });

  it('payout', () => {
    SetterGetter(
      (value: IdPayout) => (payment._data.payout = value),
      () => payment.payout,
      'pout_' + randomString(24),
    );
  });

  it('payment intent', () => {
    SetterGetter(
      (value: IdPaymentIntent) => (payment._data.paymentIntent = value),
      () => payment.paymentIntent,
      'pi_' + randomString(24),
    );
  });
});
