import { Temporal } from 'temporal-polyfill';

import { IdValidator } from '#core/common/id-validator.js';
import {
  type Validator,
  createdAtValidator,
  enumValidator,
  goldilocksValidator,
  plainDateValidator,
} from '#core/validator.js';

import { AddressModel, type IdAddress } from '../address/model.js';
import { CardModel, type IdCard } from '../card/model.js';
import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { type IdPaymentIntent, PaymentIntentModel } from '../payment-intent/model.js';
import { type IdPayout, PayoutModel } from '../payout/model.js';
import { type IdSepa, SepaModel } from '../sepa/model.js';
import { CurrencyEnum } from './enum/currency.js';
import { MethodEnum } from './enum/method.js';
import { StatusEnum } from './enum/status.js';
import { type Device, type IdPayment, type PaymentData, PaymentModel } from './model.js';

export const amountValidator = {
  validate: (value: number) => Number.isInteger(value) && value >= 0,
  errorMessage: (value: string) => `value (${value}) must be a positive integer (in cents)`,
};

const authValidator = {
  validate: (arg0: boolean) => typeof arg0 === 'boolean',
  errorMessage: (value: string) => `auth must be true (received: ${value})`,
};

export const captureValidator = {
  validate: (arg0: boolean) => typeof arg0 === 'boolean',
  errorMessage: (value: string) => `capture must be boolean (received: ${value})`,
};

const deviceValidator = {
  validate: (arg0: Device | boolean) => typeof arg0 === 'boolean' || Object.hasOwn(arg0, 'city'),
  errorMessage: () => `device must be a boolean or a Device `,
};

const instantValidator = (field: string) => {
  return {
    validate: (arg0: Temporal.Instant) =>
      Temporal.Instant.compare(Temporal.Now.instant().toZonedDateTimeISO('UTC'), arg0) >= 0,
    errorMessage: () => `${field} must be a date in the past.`,
  };
};

export const methodsAllowedValidator = {
  validate: (arg0: ('card' | 'sepa')[]) => {
    if (!Array.isArray(arg0)) {
      return false;
    }
    const validator = enumValidator(MethodEnum);
    if (validator === true) {
      return true;
    }
    return arg0.every((method) => validator.validate(method));
  },
  errorMessage: (value: string) => `${value.toString()} is not a valid array of allowed method`,
};

export const paymentValidator: Validator<PaymentData> = {
  id: IdValidator<IdPayment>(PaymentModel.regex),
  amount: amountValidator,
  auth: authValidator,
  billingAddress: IdValidator<IdAddress>(AddressModel.regex),
  card: IdValidator<IdCard>(CardModel.regex),
  capture: captureValidator,
  createdAt: createdAtValidator,
  currency: enumValidator(CurrencyEnum),
  customer: IdValidator<IdCustomer>(CustomerModel.regex),
  dateBank: plainDateValidator('dateBank'),
  datePayment: instantValidator('datePayment'),
  dateSettlement: plainDateValidator('dateSettlement'),
  deleted: true,
  description: goldilocksValidator('description', { min: 1, max: 64 }),
  device: deviceValidator,
  fee: true,
  method: enumValidator(MethodEnum, false),
  methodsAllowed: methodsAllowedValidator,
  orderId: goldilocksValidator('orderId', { min: 1, max: 36 }),
  origin: true,
  paymentIntent: IdValidator<IdPaymentIntent>(PaymentIntentModel.regex),
  payout: IdValidator<IdPayout>(PayoutModel.regex),
  response: true,
  responseAuthor: true,
  returnUrl: goldilocksValidator('returnUrl', { min: 1, max: 2048 }),
  sepa: IdValidator<IdSepa>(SepaModel.regex),
  shippingAddress: IdValidator<IdAddress>(AddressModel.regex),
  status: enumValidator(StatusEnum, false),
  uniqueId: goldilocksValidator('uniqueId', { min: 1, max: 36 }),
  wallet: true,
};
