import { ApiEndpoint, baseHandler } from '#api/abstract-api-endpoint.js';
import { RFC9557Handler } from '#core/common/handler/date-handler.js';
import { enumHandler } from '#core/common/handler/enum-handler.js';
import { defaultHandler } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';
import { CurrencyEnum } from '#payment/enum/currency.js';
import { type IdPayment, PaymentModel } from '#payment/model.js';

import { type IdPaymentIntent, PaymentIntentModel } from '../payment-intent/model.js';
import { type IdPayout, PayoutModel } from '../payout/model.js';
import { RefundStatusEnum } from './enum/refund-status.js';
import { type IdRefund, type RefundAmount, type RefundData, RefundModel } from './model.js';

export class RefundApiEndpoint extends ApiEndpoint<RefundData> {
  public _handler = {
    ...baseHandler('created'),
    id: IdHandler<IdRefund>(RefundModel.regex),
    amount: defaultHandler<RefundAmount>('number', { postRequired: true }),
    currency: enumHandler(CurrencyEnum, { postable: false }),
    dateBank: RFC9557Handler({ postable: false, patchable: false }),
    dateRefund: RFC9557Handler({ postable: false, patchable: false }),
    payment: IdHandler<IdPayment>(PaymentModel.regex, { postRequired: true }),
    paymentIntent: IdHandler<IdPaymentIntent>(PaymentIntentModel.regex, { postable: false, patchable: false }),
    payout: IdHandler<IdPayout>(PayoutModel.regex, { postable: false, patchable: false }),
    status: enumHandler(RefundStatusEnum, { postable: false }),
  };
  constructor() {
    super({
      name: 'refunds',
      patchable: false,
    });
  }
}
