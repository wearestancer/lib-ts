import { Temporal } from 'temporal-polyfill';

import { CurrencyEnum } from '#payment/enum/currency.js';
import { MethodEnum } from '#payment/enum/method.js';
import { StatusEnum } from '#payment/enum/status.js';
import { Device, paymentAmount } from '#payment/model.js';
import { randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdAddress } from '../../../src/address/model';
import { IdCard } from '../../../src/card/model';
import { IdCustomer } from '../../../src/customer/model';
import { IdPaymentIntent } from '../../../src/payment-intent/model';
import { IdPayout } from '../../../src/payout/model';
import { IdSepa } from '../../../src/sepa/model';

export const id = `paym_${randomString(24)}`; // required post
const amount = randomNumber(50, 4294967295);
const billingAddress = `addr_${randomString(24)}`;
const card = `card_${randomString(24)}`;
const capture = true;
const created = randomNumber(786460000, 1790692636);
const currency = CurrencyEnum[randomNumber(0, CurrencyEnum.length - 1)];
const customer = `cust_${randomString(24)}`;
const date_paym = randomNumber(786460000, 1000000000);
const date_settlement = `${randomNumber(1971, 2025)}-${randomMonth().toString().padStart(2, '0')}-${randomNumber(1, 28).toString().padStart(2, '0')}`;
const date_bank = `${randomNumber(1971, 2025)}-${randomMonth().toString().padStart(2, '0')}-${randomNumber(1, 28).toString().padStart(2, '0')}`;
const description = randomString(3, 64);
const fee = randomNumber(0, 4294967295);
const method = MethodEnum[randomNumber(0, MethodEnum.length - 1)];
const methodsAllowed = [MethodEnum[randomNumber(0, MethodEnum.length - 1)]];
const orderId = randomString(1, 36);
const origin = 'api';
const paymentIntent = `pi_${randomString(24)}`;
const payout = `pout_${randomString(24)}`;
const response = randomString(2);
const responseAuthor = randomString(2, 100);
const returnUrl = randomString(1, 66);
const sepa = `sepa_${randomString(24)}`;
const shippingAddress = `addr_${randomString(24)}`;
const status = StatusEnum[randomNumber(0, StatusEnum.length - 1)];
const uniqueId = randomString(1, 36);
export const wallet = {}; // walletObject

export const endpointResource = {
  id,
  amount,
  auth: { returnUrl: 'returnUrl' },
  device: { city: 'city' },
  billing_address: billingAddress,
  capture,
  card,
  created,
  currency,
  customer,
  date_paym,
  date_settlement,
  date_bank,
  description,
  fee,
  method,
  methods_allowed: methodsAllowed,
  order_id: orderId,
  unique_id: uniqueId,
  response,
  response_author: responseAuthor,
  return_url: returnUrl,
  sepa,
  shipping_address: shippingAddress,
  status,
  origin,
  payout,
  payment_intent: paymentIntent,
  wallet,
};

export const creationResource = {
  amount: paymentAmount(amount),
  auth: true,
  capture,
  createdAt: Temporal.Instant.fromEpochMilliseconds(created * 1000),
  currency,
  customer: customer as IdCustomer,
  datePayment: Temporal.Instant.fromEpochMilliseconds(date_paym * 1000),
  dateSettlement: Temporal.PlainDate.from(date_settlement),
  dateBank: Temporal.PlainDate.from(date_bank),
  description,
  device: true as unknown as Device,
  fee,
  method,
  methodsAllowed,
  orderId,
  uniqueId,
  response,
  responseAuthor,
  returnUrl,
  card: card as IdCard,
  sepa: sepa as IdSepa,
  status,
  origin,
  payout: payout as IdPayout,
  billingAddress: billingAddress as IdAddress,
  shippingAddress: shippingAddress as IdAddress,
  paymentIntent: paymentIntent as IdPaymentIntent,
};

export const endpointResourceDeserialized = {
  id,
  ...creationResource,
  device: { city: 'city' },
};

export const listResource = [
  { ...creationResource, uniqueId: 'firstResource' },
  { ...creationResource, uniqueId: 'secondResource' },
  { ...creationResource, uniqueId: 'thirdResource' },
];
