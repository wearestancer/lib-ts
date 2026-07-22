import { Temporal } from 'temporal-polyfill';

import { PaymentIntentStatusEnum } from '#payment-intent/enum/status.js';
import { ThreeDSEnum } from '#payment-intent/enum/threeds.js';
import { idPaymentIntent } from '#payment-intent/model.js';
import { Currency } from '#payment/enum/currency.js';
import { MethodEnum } from '#payment/enum/method.js';
import { idPayment, paymentAmount } from '#payment/model.js';
import { randomMonth, randomNumber, randomString } from '#test/test-helper.js';

import { IdAddress } from '../../../src/address/model';
import { IdCard } from '../../../src/card/model';
import { IdCustomer } from '../../../src/customer/model';
import { IdSepa } from '../../../src/sepa/model';

const id = `pi_${randomString(24)}`;
const amount = randomNumber(1, 50000);
const billing_address = `addr_${randomString(24)}`;
const capture = true;
const card = `card_${randomString(24)}`;
const currency: Currency = 'eur';
const customer = `cust_${randomString(24)}`;
const created_at = randomNumber(786460000, 1000000000);
const date_settlement = `${randomNumber(1971, 2025)}-${randomMonth().toString().padStart(2, '0')}-${randomNumber(1, 28).toString().padStart(2, '0')}`;
const description = randomString(1, 64);
const metadata = randomString(24);
const methods_allowed = [MethodEnum[randomNumber(0, MethodEnum.length - 1)]];
const order_id = randomString(1, 36);
const origin = 'api';
const payment = `paym_${randomString(24)}`;
const return_url = 'https://' + randomString(24);
const sepa = `sepa_${randomString(24)}`;
const shipping_address = `addr_${randomString(24)}`;
const status = PaymentIntentStatusEnum[randomNumber(0, PaymentIntentStatusEnum.length - 1)];
const threeds = ThreeDSEnum[randomNumber(0, ThreeDSEnum.length - 1)];
const url = 'https://' + randomString(1, 800);

export const endpointResource = {
  id,
  amount,
  billing_address,
  capture,
  card,
  currency,
  customer,
  created_at,
  date_settlement,
  description,
  metadata,
  methods_allowed,
  order_id,
  origin,
  payment,
  return_url,
  sepa,
  shipping_address,
  status,
  threeds,
  url,
};

export const creationResource = {
  amount: paymentAmount(amount),
  billingAddress: billing_address as IdAddress,
  capture,
  card: card as IdCard,
  currency,
  customer: customer as IdCustomer,
  dateSettlement: Temporal.PlainDate.from(date_settlement),
  description,
  metadata,
  methodsAllowed: methods_allowed,
  orderId: order_id,
  origin,
  payment: idPayment(payment),
  returnUrl: return_url,
  sepa: sepa as IdSepa,
  shippingAddress: shipping_address as IdAddress,
  status,
  threeds,
  url,
};

export const endpointResourceDeserialized = {
  id: idPaymentIntent(id),
  createdAt: Temporal.Instant.fromEpochMilliseconds(created_at * 1000),
  ...creationResource,
};

export const listResource = [
  { ...creationResource, orderId: 'firstResource' },
  { ...creationResource, orderId: 'secondResource' },
  { ...creationResource, orderId: 'thirdResource' },
];
