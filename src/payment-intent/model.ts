import { AbstractModel, type ModelData } from '#core/abstract-model.js';
import type { IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';
import { StancerError } from '#core/error/base-error.js';
import type { Currency } from '#payment/enum/currency.js';
import type { Method } from '#payment/enum/method.js';
import type { IdPayment, PaymentAmount, PaymentModel } from '#payment/model.js';
import type { RefundModel } from '#refund/model.js';

import type { IdAddress } from '../address/model.js';
import type { IdCard } from '../card/model.js';
import type { IdCustomer } from '../customer/model.js';
import type { IdSepa } from '../sepa/model.js';
import { type PaymentIntentStatus, failedPaymentIntentStatus, succeedPaymentIntentStatus } from './enum/status.js';
import type { ThreeDS } from './enum/threeds.js';

export type IdPaymentIntent = IdValue<`pi_${string}`>;
export const idPaymentIntent = (id: string) => validateID<IdPaymentIntent>(id, PaymentIntentModel.regex);

export interface PaymentIntentData extends ModelData {
  id: IdPaymentIntent;
  amount: PaymentAmount;
  billingAddress: IdAddress;
  card: IdCard;
  capture: true;
  currency: Currency;
  customer: IdCustomer;
  dateSettlement: Temporal.PlainDate;
  description: string;
  payment: IdPayment;
  metadata: string;
  methodsAllowed: Method[];
  orderId: string;
  origin: string;
  returnUrl: string;
  sepa: IdSepa;
  shippingAddress: IdAddress;
  status: PaymentIntentStatus;
  threeds: ThreeDS;
  url: string;
  uniqueId: string;
}

export class PaymentIntentModel extends AbstractModel<PaymentIntentData> {
  static regex = /^pi_[a-zA-Z0-9]{24}$/;

  private _paymentPopulated = false;
  private _refundPopulated = false;
  private _refundedAmount = 0;
  private _payments: PaymentModel[] = [];
  private _refunds: RefundModel[] = [];

  //#region Methods

  public isFailed() {
    return this.status && failedPaymentIntentStatus.includes(this.status);
  }

  public isNotFailed() {
    return !this.isFailed();
  }

  public isNotSuccess() {
    return !this.isSuccess();
  }

  public isPaymentPopulated() {
    return this._paymentPopulated;
  }

  public isRefundPopulated() {
    return this._refundPopulated;
  }

  public isSuccess() {
    return this.status && succeedPaymentIntentStatus.includes(this.status);
  }

  public populatePayments(payments: PaymentModel[]) {
    this._paymentPopulated = true;
    this._payments = payments;
  }

  public populateRefunds(refunds: RefundModel[]) {
    this._refundPopulated = true;
    this._refundedAmount = refunds.reduce((prev, curr) => prev + (curr.amount ?? 0), 0);
    this._refunds = refunds;
  }

  //#endregion

  //#region Getters

  get amount() {
    return this._data.amount;
  }

  get billingAddress() {
    return this._data.billingAddress;
  }

  get card() {
    return this._data.card;
  }

  get currency() {
    return this._data.currency;
  }

  get customer() {
    return this._data.customer;
  }

  get dateSettlement() {
    return this._data.dateSettlement;
  }

  get description() {
    return this._data.description;
  }

  get methodsAllowed() {
    return this._data.methodsAllowed;
  }

  get orderId() {
    return this._data.orderId;
  }

  get origin() {
    return this._data.origin;
  }

  get payments() {
    return this._payments;
  }

  get refundableAmount() {
    if (!this.amount || !this.id) {
      throw new StancerError('Refunds must be populated before accessing refundableAmount.');
    }
    return this.amount - this.refundedAmount;
  }

  get refundedAmount() {
    if (!this.isRefundPopulated()) {
      throw new StancerError('Refunds must be populated before accessing refundedAmount.');
    }
    return this._refundedAmount;
  }

  get refunds() {
    return this._refunds;
  }

  get returnUrl() {
    return this._data.returnUrl;
  }

  get sepa() {
    return this._data.sepa;
  }

  get shippingAddress() {
    return this._data.shippingAddress;
  }

  get status() {
    return this._data.status;
  }

  get threeDS() {
    return this._data.threeds;
  }

  get uniqueId() {
    return this._data.uniqueId;
  }

  get url() {
    return this._data.url;
  }

  //#endregion

  //#region Setters

  setAmount(amount: PaymentAmount) {
    this._data.amount = amount;
    return this;
  }

  setBillingAddress(address: IdAddress) {
    this._data.billingAddress = address;
    return this;
  }

  setCard(card: IdCard) {
    this._data.card = card;
    return this;
  }

  setCapture(capture: boolean) {
    if (capture === true) {
      this._data.capture = capture;
    }
    return this;
  }

  setCurrency(currency: Currency) {
    this._data.currency = currency;
    return this;
  }

  setCustomer(customer: IdCustomer) {
    this._data.customer = customer;
    return this;
  }

  setDateSettlement(dateSettlement: Temporal.PlainDate) {
    this._data.dateSettlement = dateSettlement;
    return this;
  }

  setDescription(description: string) {
    this._data.description = description;
    return this;
  }

  setMethodsAllowed(methodsAllowed: Method[]) {
    this._data.methodsAllowed = methodsAllowed;
    return this;
  }

  setMetadata(metadata: string) {
    this._data.metadata = metadata;
    return this;
  }

  setOrderId(orderId: string) {
    this._data.orderId = orderId;
    return this;
  }

  setReturnUrl(returnUrl: string) {
    this._data.returnUrl = returnUrl;
    return this;
  }

  setSepa(sepa: IdSepa) {
    this._data.sepa = sepa;
    return this;
  }

  setShippingAddress(shippingAddress: IdAddress) {
    this._data.shippingAddress = shippingAddress;
    return this;
  }

  setUniqueId(uniqueId: string) {
    this._data.uniqueId = uniqueId;
    return this;
  }

  //#endregion
}
