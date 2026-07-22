import { Temporal } from 'temporal-polyfill';
import { describe, it } from 'vitest';

import { Currency, CurrencyEnum } from '#payment/enum/currency.js';
import { IdPayment, PaymentModel, idPayment } from '#payment/model.js';
import { RefundStatus, RefundStatusEnum } from '#refund/enum/refund-status.js';
import { RefundAmount, RefundModel, refundAmount } from '#refund/model.js';
import { SetterGetter, SetterGetterId, randomNumber, randomString } from '#test/test-helper.js';

import { IdPaymentIntent } from '../../../src/payment-intent/model';
import { IdPayout } from '../../../src/payout/model';

describe('Setter & Getter', () => {
  const refund = new RefundModel({});

  it('id', () => {
    SetterGetterId((value: IdPayment) => new RefundModel({}, value), 'refd_' + randomString(24));
  });

  it('amount', () => {
    SetterGetter(
      (value: RefundAmount) => refund.setAmount(value),
      () => refund.amount,
      refundAmount(randomNumber(50, 2000000)),
    );
  });

  it('payment', () => {
    SetterGetter(
      (value: PaymentModel) => refund.setPayment(value),
      () => refund.payment,
      new PaymentModel({}),
    );
    refund._data.payment = null;
    SetterGetter(
      (value: string) => refund.setPayment(value),
      () => refund.payment,
      idPayment('paym_' + randomString(24)),
    );
  });

  it('currency', () => {
    SetterGetter(
      (value: Currency) => (refund._data.currency = value),
      () => refund.currency,
      CurrencyEnum[randomNumber(0, CurrencyEnum.length - 1)],
    );
  });

  it('dateBank', () => {
    SetterGetter(
      (value: Temporal.PlainDate) => (refund._data.dateBank = value),
      () => refund.dateBank,
      Temporal.Now.plainDateISO(),
    );
  });

  it('dateRefund', () => {
    SetterGetter(
      (value: Temporal.PlainDate) => (refund._data.dateRefund = value),
      () => refund.dateRefund,
      Temporal.Now.plainDateISO(),
    );
  });

  it('paymentIntent', () => {
    SetterGetter(
      (value: IdPaymentIntent) => (refund._data.paymentIntent = value),
      () => refund.paymentIntent,
      ('pi_' + randomString(24)) as IdPaymentIntent,
    );
  });

  it('Payout', () => {
    SetterGetter(
      (value: IdPayout) => (refund._data.payout = value),
      () => refund.payout,
      ('pout_' + randomString(24)) as IdPayout,
    );
  });

  it('status', () => {
    SetterGetter(
      (value: RefundStatus) => (refund._data.status = value),
      () => refund.status,
      RefundStatusEnum[randomNumber(0, RefundStatusEnum.length - 1)],
    );
  });
});
