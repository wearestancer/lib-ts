import { IdValidator } from '#core/common/id-validator.js';
import {
  type Validator,
  createdAtValidator,
  enumValidator,
  goldilocksValidator,
  plainDateValidator,
} from '#core/validator.js';
import { CurrencyEnum } from '#payment/enum/currency.js';
import { type IdPayment, PaymentModel } from '#payment/model.js';
import { amountValidator, captureValidator, methodsAllowedValidator } from '#payment/validator.js';

import { AddressModel, type IdAddress } from '../address/model.js';
import { CardModel, type IdCard } from '../card/model.js';
import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { type IdSepa, SepaModel } from '../sepa/model.js';
import { PaymentIntentStatusEnum } from './enum/status.js';
import { ThreeDSEnum } from './enum/threeds.js';
import { type IdPaymentIntent, type PaymentIntentData, PaymentIntentModel } from './model.js';

export const PaymentIntentValidator: Validator<PaymentIntentData> = {
  id: IdValidator<IdPaymentIntent>(PaymentIntentModel.regex),
  amount: amountValidator,
  billingAddress: IdValidator<IdAddress>(AddressModel.regex),
  card: IdValidator<IdCard>(CardModel.regex),
  capture: captureValidator,
  createdAt: createdAtValidator,
  currency: enumValidator(CurrencyEnum),
  customer: IdValidator<IdCustomer>(CustomerModel.regex),
  dateSettlement: plainDateValidator('dateSettlement'),
  deleted: true,
  description: goldilocksValidator('description', { min: 1, max: 64 }),
  metadata: true,
  methodsAllowed: methodsAllowedValidator,
  orderId: goldilocksValidator('orderId', { min: 1, max: 36 }),
  origin: true,
  payment: IdValidator<IdPayment>(PaymentModel.regex),
  returnUrl: goldilocksValidator('returnUrl', { min: 1, max: 2048 }),
  sepa: IdValidator<IdSepa>(SepaModel.regex),
  shippingAddress: IdValidator<IdAddress>(AddressModel.regex),
  status: enumValidator(PaymentIntentStatusEnum, false),
  threeds: enumValidator(ThreeDSEnum, false),
  uniqueId: goldilocksValidator('uniqueId', { min: 1, max: 36 }),
  url: goldilocksValidator('url', { min: 1, max: 2048 }),
};
