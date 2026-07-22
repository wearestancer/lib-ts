import { Temporal } from 'temporal-polyfill';

import { AbstractModel, type ModelData } from '#core/abstract-model.js';
import type { Branded, IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';
import { StancerUnpopulatedError } from '#core/error/unpopulated-error.js';
import { StancerValidationError } from '#core/error/validation-error.js';
import type { RefundModel } from '#refund/model.js';

import type { IdAddress } from '../address/model.js';
import type { IdCard } from '../card/model.js';
import type { IdCustomer } from '../customer/model.js';
import type { IdPaymentIntent } from '../payment-intent/model.js';
import type { IdPayout } from '../payout/model.js';
import type { IdSepa } from '../sepa/model.js';
import type { Currency } from './enum/currency.js';
import type { Method } from './enum/method.js';
import { type PaymentStatus, succeedPaymentStatus } from './enum/status.js';

export type IdPayment = IdValue<`paym_${string}`>;
export const idPayment = (id: string) => validateID<IdPayment>(id, PaymentModel.regex);

export type PaymentAmount = Branded<number, 'amount'>;

export const paymentAmount = (amount: number): PaymentAmount => {
  if (!Number.isInteger(amount) && amount >= 0) {
    throw new StancerValidationError(`Payment amount must be a positive integer (in cents)`);
  }
  return amount as PaymentAmount;
};

export interface Auth {
  device: Device | null;
  message: string | null;
  redirectUrl: string | null;
  returnUrl: string | null;
  status: string | null;
  uuid: string | null;
}

export interface Wallet {
  apple_pay: {
    paymentData: {
      data: string;
      signature: string;
      header: Headers;
      version: string;
    };
  };
}
export interface Device {
  city: string;
  country: string;
  http_accept: string;
  ip: string;
  languages: string;
  port: number;
  user_agent: string;
  zip_code: string;
}

export interface PaymentData extends ModelData {
  id: IdPayment;
  amount: PaymentAmount;
  auth: boolean;
  wallet: Wallet;
  capture: boolean;
  currency: Currency;
  customer: IdCustomer;
  datePayment: Temporal.Instant;
  dateSettlement: Temporal.PlainDate;
  dateBank: Temporal.PlainDate;
  description: string;
  device: Device;
  fee: number;
  method: Method;
  methodsAllowed: Method[];
  orderId: string;
  uniqueId: string;
  response: string;
  responseAuthor: string;
  returnUrl: string;
  card: IdCard;
  sepa: IdSepa;
  status: PaymentStatus;
  origin: string;
  payout: IdPayout;
  billingAddress: IdAddress;
  shippingAddress: IdAddress;
  paymentIntent: IdPaymentIntent;
}
export class PaymentModel extends AbstractModel<PaymentData> {
  static regex = /^paym_[a-zA-Z0-9]{24}$/;

  private _refundedAmount = 0;
  private _refundPopulated = false;
  private _refunds: RefundModel[] = [];

  //#region Getters

  get amount() {
    return this._data.amount;
  }

  get auth() {
    return this._data.auth;
  }

  get billingAddress() {
    return this._data.billingAddress;
  }

  get capture() {
    return this._data.capture;
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

  get dateBank() {
    return this._data.dateBank;
  }

  get datePayment() {
    return this._data.datePayment;
  }

  get datePaym() {
    return this.datePayment;
  }

  get dateSettlement() {
    return this._data.dateSettlement;
  }

  get description() {
    return this._data.description;
  }

  get device() {
    return this._data.device;
  }

  get fee() {
    return this._data.fee;
  }

  get method() {
    return this._data.method;
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

  get payout() {
    return this._data.payout;
  }

  get paymentIntent() {
    return this._data.paymentIntent;
  }

  get refundableAmount() {
    if (!this.isRefundPopulated()) {
      throw new StancerUnpopulatedError('refund is not populated');
    }

    if (this.amount) {
      return this.amount - this.refundedAmount;
    }

    return 0;
  }

  get refundedAmount() {
    if (!this.isRefundPopulated()) {
      throw new StancerUnpopulatedError('refund is not populated');
    }

    return this._refundedAmount;
  }

  get refunds() {
    if (!this.isRefundPopulated()) {
      throw new StancerUnpopulatedError('refund is not populated');
    }

    return this._refunds;
  }

  get response() {
    return this._data.response;
  }

  get responseAuthor() {
    return this._data.responseAuthor;
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

  get uniqueId() {
    return this._data.uniqueId;
  }

  //#endregion

  //#region Methods

  isError(): boolean {
    if (!this.status) {
      return false;
    }

    if (this.capture === false && this.status === 'authorized') {
      return false;
    }

    return !succeedPaymentStatus.includes(this.status);
  }

  isNotError() {
    return !this.isError();
  }

  isNotSuccess() {
    return !this.isSuccess();
  }

  isRefundPopulated() {
    return this._refundPopulated;
  }

  isSuccess() {
    if (this.capture === false && this.status === 'authorized') {
      return true;
    }

    return this.status && succeedPaymentStatus.includes(this.status);
  }

  populateRefund(refunds: RefundModel[]) {
    this._refundPopulated = true;
    this._refundedAmount = refunds.reduce((prev, curr) => prev + (curr.amount ?? 0), 0);
    this._refunds = refunds;
  }

  setAmount(value: number) {
    this._data.amount = value as PaymentAmount;
    return this;
  }

  setAuth(value: boolean) {
    if (value === true) {
      this._data.auth = true;
    }

    return this;
  }

  setBillingAddress(value: IdAddress) {
    this._data.billingAddress = value;
    return this;
  }

  setCapture(value: boolean) {
    this._data.capture = value;
    return this;
  }

  setCard(value: IdCard) {
    this._data.card = value;
    this._data.method = 'card';
    return this;
  }

  setCurrency(value: Currency) {
    if ((this.methodsAllowed?.includes('sepa') || this._data.method === 'sepa') && value !== 'eur') {
      throw new StancerValidationError(`You can not use ${value} currency with sepa method`);
    }

    this._data.currency = value;
    return this;
  }

  setCustomer(value: IdCustomer) {
    this._data.customer = value;
    return this;
  }

  setDateSettlement(value: Temporal.PlainDate) {
    this._data.dateSettlement = value;
    return this;
  }

  setDescription(value: string) {
    this._data.description = value;
    return this;
  }

  setDevice(value: Device) {
    this._data.device = value;
    return this;
  }

  setMethodsAllowed(values: Method[]) {
    this._data.methodsAllowed = values;
    return this;
  }

  setOrderId(value: string) {
    this._data.orderId = value;
    return this;
  }

  setReturnUrl(value: string) {
    this._data.returnUrl = value;
    return this;
  }

  setSepa(value: IdSepa) {
    if (this._data.currency && this._data.currency !== 'eur') {
      throw new StancerValidationError(`You can not use ${this._data.currency} currency with sepa method`);
    }

    this._data.sepa = value;
    this._data.method = 'sepa';
    return this;
  }

  setShippingAddress(value: IdAddress) {
    this._data.shippingAddress = value;
    return this;
  }

  setStatus(value: PaymentStatus) {
    this._data.status = value;
    return this;
  }

  setUniqueId(value: string) {
    this._data.uniqueId = value;
    return this;
  }

  //#endregion
}
