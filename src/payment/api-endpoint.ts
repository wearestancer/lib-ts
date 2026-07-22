import { ApiEndpoint, baseHandler } from '#api/abstract-api-endpoint.js';
import { Http } from '#api/http/index.js';
import { RFC9557Handler, timestampHandler } from '#core/common/handler/date-handler.js';
import { enumHandler } from '#core/common/handler/enum-handler.js';
import { type Handler, defaultHandler, setAccess } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';
import { RefundApiEndpoint } from '#refund/api-endpoint.js';
import { RefundModel } from '#refund/model.js';
import { refundValidator } from '#refund/validator.js';

import { AddressModel, type IdAddress } from '../address/model.js';
import { CardModel, type IdCard } from '../card/model.js';
import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { type IdPaymentIntent, PaymentIntentModel } from '../payment-intent/model.js';
import { type IdPayout, PayoutModel } from '../payout/model.js';
import { type IdSepa, SepaModel } from '../sepa/model.js';
import { CurrencyEnum } from './enum/currency.js';
import { type Method, MethodEnum } from './enum/method.js';
import { StatusEnum } from './enum/status.js';
import { type Device, type IdPayment, type PaymentAmount, type PaymentData, PaymentModel } from './model.js';

const authHandler: Handler<boolean> = {
  deserialize: (arg0: unknown): boolean | undefined => {
    if (arg0) {
      return true;
    }
    return undefined;
  },
  serialize: (arg0: boolean) => {
    if (arg0 === false) {
      return undefined;
    }
    return true;
  },
  ...setAccess({}),
};
export const methodsAllowedHandler: Handler<Method[]> = {
  deserialize: (arg0: unknown) => {
    if (!Array.isArray(arg0)) {
      return undefined;
    }
    return arg0
      .map((value) => (MethodEnum.includes(value) ? value : undefined))
      .filter((value) => value !== undefined) as Method[];
  },
  serialize: (arg0: Method[]) => {
    return arg0;
  },
  ...setAccess({}),
};
const deviceHandler: Handler<Device> = {
  deserialize: (arg0: unknown) => (arg0 as Device) ?? undefined,
  serialize: (arg0: Device) => arg0,
  ...setAccess({}),
};
export class PaymentApiEndpoint extends ApiEndpoint<PaymentData> {
  public _handler = {
    ...baseHandler('created'),
    id: IdHandler<IdPayment>(PaymentModel.regex),
    amount: defaultHandler<PaymentAmount>('number', { postRequired: true }),
    auth: authHandler,
    billingAddress: IdHandler<IdAddress>(AddressModel.regex, { postable: true }),
    card: IdHandler<IdCard>(CardModel.regex, { postable: true }),
    capture: defaultHandler<PaymentData['capture']>('boolean', {}),
    currency: enumHandler(CurrencyEnum, { postable: true, postRequired: true }),
    customer: IdHandler<IdCustomer>(CustomerModel.regex, { postable: true, patchable: true }),
    dateBank: RFC9557Handler({ postable: false, patchable: false }),
    datePayment: timestampHandler({ postable: false, patchable: false }, 'date_paym'),
    dateSettlement: RFC9557Handler({}),
    description: defaultHandler<PaymentData['description']>('string'),
    device: deviceHandler,
    fee: defaultHandler<PaymentData['fee']>('number', { postable: false, patchable: false }),
    method: enumHandler(MethodEnum, { postable: false, patchable: false }),
    methodsAllowed: methodsAllowedHandler,
    orderId: defaultHandler<PaymentData['orderId']>('string'),
    origin: defaultHandler<PaymentData['origin']>('string', { postable: false, patchable: false }),
    paymentIntent: IdHandler<IdPaymentIntent>(PaymentIntentModel.regex, { postable: false, patchable: false }),
    payout: IdHandler<IdPayout>(PayoutModel.regex, { postable: false, patchable: false }),
    response: defaultHandler<PaymentData['response']>('string', { postable: false, patchable: false }),
    responseAuthor: defaultHandler<PaymentData['responseAuthor']>('string', { postable: false, patchable: false }),
    returnUrl: defaultHandler<PaymentData['returnUrl']>('string'),
    sepa: IdHandler<IdSepa>(SepaModel.regex, { postable: true }),
    shippingAddress: IdHandler<IdAddress>(AddressModel.regex, { postable: true }),
    status: enumHandler(StatusEnum, { postable: false }),
    uniqueId: defaultHandler<PaymentData['uniqueId']>('string', { patchable: false }),
    wallet: defaultHandler<PaymentData['wallet']>('object', { gettable: false }),
  };
  private _refundApiEndpoint?: RefundApiEndpoint;
  constructor(refundApiEndpoint?: RefundApiEndpoint) {
    super({
      name: 'payments',
    });
    if (refundApiEndpoint) {
      this._refundApiEndpoint = refundApiEndpoint;
    }
  }

  async refunds(id: IdPayment): Promise<RefundModel[]> {
    if (this._refundApiEndpoint === undefined) {
      this._refundApiEndpoint = new RefundApiEndpoint();
    }
    const refundEndpoint = this._refundApiEndpoint;
    return this._httpClient
      .makeRequest(
        Http.createRequest({
          url: `${this._getResourceUri(id)}/refunds`,
          method: 'GET',
          authenticated: true,
        }),
      )
      .then(Http.transformResponseToData<Record<string, unknown>[]>)
      .then((refunds) =>
        Object.values(refunds).map(
          (data) => new RefundModel(refundValidator, refundEndpoint.deserializeResource(data)),
        ),
      );
  }
}
