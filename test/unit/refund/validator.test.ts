import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';

import { Currency, CurrencyEnum } from '#payment/enum/currency.js';
import { PaymentModel, idPayment } from '#payment/model.js';
import { paymentValidator } from '#payment/validator.js';
import { RefundStatus, RefundStatusEnum } from '#refund/enum/refund-status.js';
import { RefundAmount, RefundModel, refundAmount } from '#refund/model.js';
import { refundValidator } from '#refund/validator.js';
import { checkType, goldilocks, goldilocksId, randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdPaymentIntent } from '../../../src/payment-intent/model';
import { IdPayout } from '../../../src/payout/model';

describe('Goldilocks & type', () => {
  const refund = new RefundModel(refundValidator);

  it('amount', () => {
    goldilocks((value: RefundAmount) => refund.setAmount(value), 'number', { min: 0 });
    checkType((value: RefundAmount) => refund.setAmount(value), ['number'], refundAmount(randomNumber(50)));
  });

  it('payment', () => {
    checkType(
      (value: PaymentModel) => refund.setPayment(value),
      ['string', 'object'],
      new PaymentModel(paymentValidator, `paym_${randomString(24)}`),
    );
    const newRefund = new RefundModel(refundValidator);
    expect(() => newRefund.setPayment(idPayment(`paym_${randomString(24)}`)));
    expect(() => newRefund.setPayment(new PaymentModel(paymentValidator).id)).toThrow();
    const id = `paym_${randomString(24)}`;
    const refundablePayment = new PaymentModel(paymentValidator, id);
    newRefund.setPayment(refundablePayment.id);
    expect(newRefund.payment).toStrictEqual(refundablePayment.id);
  });

  it.each(CurrencyEnum.map((n) => [n]))('currency %s', (currency) => {
    const falseCurrency = randomString(3);
    expect(() => (refund._data.currency = falseCurrency)).toThrow();
    refund._data.currency = currency;

    expect(refund.currency).toBe(currency);
    checkType((value: Currency) => (refund._data.currency = value), [], currency);
  });

  it('DateRefund', () => {
    const falseDateRefund = new Temporal.PlainDate(9999, randomMonth(), randomNumber(1, 28));
    const DateRefund = new Temporal.PlainDate(
      randomNumber(1971, Temporal.PlainDate.from(Temporal.Now.plainDateISO()).year),
      randomMonth(),
      randomNumber(1, 28),
    );
    expect(() => (refund._data.dateRefund = falseDateRefund)).toThrow();
    refund._data.dateRefund = DateRefund;
    expect(refund._data.dateRefund).toBe(DateRefund);
  });

  it('DateBank', () => {
    const falseDateBank = new Temporal.PlainDate(9999, randomMonth(), randomNumber(1, 28));
    const DateBank = new Temporal.PlainDate(
      randomNumber(1971, Temporal.PlainDate.from(Temporal.Now.plainDateISO()).year),
      randomMonth(),
      randomNumber(1, 28),
    );
    expect(() => (refund._data.dateBank = falseDateBank)).toThrow();
    refund._data.dateBank = DateBank;
    expect(refund._data.dateBank).toBe(DateBank);
  });

  it('Payment intent', () => {
    goldilocksId((value: IdPaymentIntent) => (refund._data.paymentIntent = value), 'pi_');
    checkType((value: string) => (refund._data.paymentIntent = value), ['string', 'object'], `pi_${randomString(24)}`);
  });

  it.each(RefundStatusEnum.map((n) => [n]) as RefundStatus[][])('refund status %s', (status) => {
    const falseStatus = randomString(3);
    expect(RefundStatusEnum.includes(falseStatus)).toBeFalsy();
    expect(() => (refund._data.status = falseStatus)).toThrow();
    refund._data.status = status;
    expect(refund.status).toBe(status);
    checkType((value: RefundStatus) => (refund._data.status = value), [], status);
  });

  it('payout', () => {
    goldilocksId((value: IdPayout) => (refund._data.payout = value), 'pout_');
    checkType((value: IdPayout) => (refund._data.payout = value), ['string', 'object'], `pout_${randomString(24)}`);
  });
});
