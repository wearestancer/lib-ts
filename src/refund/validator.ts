import { IdValidator, isValidID } from '#core/common/id-validator.js';
import { type Validator, createdAtValidator, enumValidator, plainDateValidator } from '#core/validator.js';
import { CurrencyEnum } from '#payment/enum/currency.js';
import { type IdPayment, PaymentModel } from '#payment/model.js';

import { type IdPaymentIntent, PaymentIntentModel } from '../payment-intent/model.js';
import { type IdPayout, PayoutModel } from '../payout/model.js';
import { RefundStatusEnum } from './enum/refund-status.js';
import { type IdRefund, type RefundData, RefundModel, isRefundAmount } from './model.js';

const amountValidator = {
  validate: (value: number) => typeof value === 'number' && isRefundAmount(value),
  errorMessage: (value: string) => `value (${value}) is not a valid amount (not a number or too low a number)`,
};

const paymentValidator = {
  validate: (arg0: PaymentModel | IdPayment) => {
    if (typeof arg0 === 'string') {
      return isValidID<IdPayment>(arg0, PaymentModel.regex);
    }
    if (!(arg0 instanceof PaymentModel)) {
      return false;
    }
    if (!arg0.id) {
      return false;
    }
    return true;
  },
  errorMessage: () => `payment must be a payment model and have an id to be refunded`,
};

export const refundValidator: Validator<RefundData> = {
  id: IdValidator<IdRefund>(RefundModel.regex),
  amount: amountValidator,
  currency: enumValidator(CurrencyEnum),
  createdAt: createdAtValidator,
  dateBank: plainDateValidator('dateBank'),
  dateRefund: plainDateValidator('dateRefund'),
  deleted: true,
  payment: paymentValidator,
  paymentIntent: IdValidator<IdPaymentIntent>(PaymentIntentModel.regex),
  payout: IdValidator<IdPayout>(PayoutModel.regex),
  status: enumValidator(RefundStatusEnum, false),
};
