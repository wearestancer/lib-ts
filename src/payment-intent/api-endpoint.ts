import { ApiEndpoint, baseHandler } from '#api/abstract-api-endpoint.js';
import { Http } from '#api/http/index.js';
import { RFC9557Handler } from '#core/common/handler/date-handler.js';
import { enumHandler } from '#core/common/handler/enum-handler.js';
import { defaultHandler } from '#core/common/handler/handler.js';
import { IdHandler } from '#core/common/handler/id-handler.js';
import { PaymentApiEndpoint, methodsAllowedHandler } from '#payment/api-endpoint.js';
import { CurrencyEnum } from '#payment/enum/currency.js';
import { type IdPayment, type PaymentAmount, PaymentModel } from '#payment/model.js';
import { paymentValidator } from '#payment/validator.js';
import { RefundApiEndpoint } from '#refund/api-endpoint.js';
import { type RefundAmount, RefundModel } from '#refund/model.js';
import { refundValidator } from '#refund/validator.js';

import { AddressModel, type IdAddress } from '../address/model.js';
import { CardModel, type IdCard } from '../card/model.js';
import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { type IdSepa, SepaModel } from '../sepa/model.js';
import { PaymentIntentStatusEnum } from './enum/status.js';
import { ThreeDSEnum } from './enum/threeds.js';
import { type IdPaymentIntent, type PaymentIntentData, PaymentIntentModel } from './model.js';

export interface PaymentIntentEndpoint extends ApiEndpoint<PaymentIntentData> {
  refunds: (id: IdPaymentIntent) => Promise<RefundModel[]>;
  payments: (id: IdPaymentIntent) => Promise<PaymentModel[]>;
  capture: (id: IdPaymentIntent) => Promise<Partial<PaymentIntentData>>;
  refund: (id: IdPaymentIntent, amount: RefundAmount) => Promise<Partial<PaymentIntentData>>;
}

export class PaymentIntentApiEndpoint extends ApiEndpoint<PaymentIntentData> {
  public _handler = {
    ...baseHandler('created_at'),
    id: IdHandler<IdPaymentIntent>(PaymentIntentModel.regex),
    amount: defaultHandler<PaymentAmount>('number', { postRequired: true }),
    billingAddress: IdHandler<IdAddress>(AddressModel.regex, { postable: true }),
    card: IdHandler<IdCard>(CardModel.regex, { postable: true }),
    capture: defaultHandler<PaymentIntentData['capture']>('boolean', {}),
    currency: enumHandler(CurrencyEnum, { postable: true, postRequired: true }),
    customer: IdHandler<IdCustomer>(CustomerModel.regex, { postable: true, patchable: true }),
    dateBank: RFC9557Handler({ postable: false, patchable: false }),
    dateSettlement: RFC9557Handler({}),
    description: defaultHandler<PaymentIntentData['description']>('string'),
    metadata: defaultHandler<PaymentIntentData['metadata']>('string'),
    methodsAllowed: methodsAllowedHandler,
    orderId: defaultHandler<PaymentIntentData['orderId']>('string'),
    origin: defaultHandler<PaymentIntentData['origin']>('string', { postable: false, patchable: false }),
    payment: IdHandler<IdPayment>(PaymentModel.regex, { postable: false, patchable: false }),
    returnUrl: defaultHandler<PaymentIntentData['returnUrl']>('string'),
    sepa: IdHandler<IdSepa>(SepaModel.regex, { postable: true }),
    shippingAddress: IdHandler<IdAddress>(AddressModel.regex, { postable: true }),
    status: enumHandler(PaymentIntentStatusEnum, { postable: false, patchable: false }),
    threeds: enumHandler(ThreeDSEnum),
    uniqueId: defaultHandler<PaymentIntentData['uniqueId']>('string'),
    url: defaultHandler<PaymentIntentData['url']>('string'),
  };

  constructor() {
    super({
      name: 'payment_intents',
    });
  }

  public async capture(id: IdPaymentIntent): Promise<Partial<PaymentIntentData>> {
    return this._httpClient
      .makeRequest(
        Http.createRequest({
          url: `${this._getResourceUri(id)}/capture`,
          method: 'POST',
          authenticated: true,
        }),
      )
      .then(Http.transformResponseToData<Record<string, unknown>>)
      .then(this.deserializeResource);
  }

  public async payments(id: IdPaymentIntent): Promise<PaymentModel[]> {
    return this._httpClient
      .makeRequest(
        Http.createRequest({
          url: `${this._getResourceUri(id)}/payments`,
          method: 'GET',
          authenticated: true,
        }),
      )
      .then(Http.transformResponseToData<Record<string, unknown>[]>)
      .then((payments) =>
        Object.values(payments).map(
          (data) => new PaymentModel(paymentValidator, new PaymentApiEndpoint().deserializeResource(data)),
        ),
      );
  }

  public async refund(id: IdPaymentIntent, amount: RefundAmount): Promise<Partial<PaymentIntentData>> {
    return this._httpClient
      .makeRequest(
        Http.createRequest({
          url: `${this._getResourceUri(id)}/refunds`,
          method: 'POST',
          authenticated: true,
          body: JSON.stringify({ amount }),
        }),
      )
      .then(Http.transformResponseToData<Record<string, unknown>>)
      .then(this.deserializeResource);
  }

  public async refunds(id: IdPaymentIntent): Promise<RefundModel[]> {
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
          (data) => new RefundModel(refundValidator, new RefundApiEndpoint().deserializeResource(data)),
        ),
      );
  }
}
