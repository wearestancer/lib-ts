import { Temporal } from 'temporal-polyfill';

import { Currency } from '#payment/enum/currency-enum.js';
import { IdPayment, PaymentModel } from '#payment/model.js';
import { refundAmount } from '#refund/model.js';
import { randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdPaymentIntent } from '../../../src/payment-intent/model.js';

const id = `refd_${randomString(24)}`;
const amount = randomNumber(1, 50000);
const currency: Currency = 'eur';
const date_bank = `${randomNumber(1971, 2025)}-${randomMonth().toString().padStart(2, '0')}-${randomNumber(1, 28).toString().padStart(2, '0')}`;
const date_refund = `${randomNumber(1971, 2025)}-${randomMonth().toString().padStart(2, '0')}-${randomNumber(1, 28).toString().padStart(2, '0')}`;
const payment_intent = `pi_${randomString(24)}`;
const payment = new PaymentModel({}, `paym_${randomString(24)}`);
const paymentID = payment.id as IdPayment;
const created = randomNumber(786460000, 1000000000);

const status = 'to_refund';
const payout = `pout_${randomString(24)}`;

export const endpointResource = {
  id,
  amount,
  currency,
  date_bank,
  date_refund,
  payment_intent,
  payment: paymentID,
  created,
  status,
  payout,
};

export const creationResource = {
  amount: refundAmount(amount),
  currency,
  createdAt: Temporal.Instant.fromEpochMilliseconds(created * 1000),
  dateBank: Temporal.PlainDate.from(date_bank),
  dateRefund: Temporal.PlainDate.from(date_refund),
  paymentIntent: payment_intent as IdPaymentIntent,
  payment,
  status,
  payout,
};

export const endpointResourceDeserialized = {
  id,
  ...creationResource,
  payment: paymentID,
};

export const listResource = [
  { ...creationResource, id: `refd_${randomString(21)}one`, amount: 50 },
  { ...creationResource, id: `refd_${randomString(21)}two`, amount: 50 },
  { ...creationResource, id: `refd_${randomString(19)}three`, amount: 50 },
];
