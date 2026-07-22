import { Temporal } from 'temporal-polyfill';

import { AbstractModel, type ModelType } from '#core/abstract-model.js';
import type { Branded, IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';
import { StancerValidationError } from '#core/error/validation-error.js';
import type { Currency } from '#payment/enum/currency.js';
import type { IdPayment } from '#payment/model.js';

import type { IdPaymentIntent } from '../payment-intent/model.js';
import type { IdPayout } from '../payout/model.js';
import type { RefundStatus } from './enum/refund-status.js';

export type IdRefund = IdValue<`refd_${string}`>;
export const idRefund = (id: string) => validateID<IdRefund>(id, RefundModel.regex);

export type RefundAmount = Branded<number, 'refundAmount'>;
export const isRefundAmount = (value: number): value is RefundAmount => value >= 0;
export const refundAmount = (value: number): RefundAmount => {
  if (!isRefundAmount(value)) {
    throw new StancerValidationError(`${value} is not a valid Refund amount`);
  }
  return value;
};

export interface RefundData extends ModelType {
  id: IdRefund;
  amount: RefundAmount;
  currency: Currency;
  dateBank: Temporal.PlainDate;
  dateRefund: Temporal.PlainDate;
  payment: IdPayment;
  paymentIntent: IdPaymentIntent;
  payout: IdPayout;
  status: RefundStatus;
}

export class RefundModel extends AbstractModel<RefundData> {
  static regex = /^refd_[a-zA-Z0-9]{24}$/;

  //#region Getters

  get amount() {
    return this._data.amount;
  }

  get currency() {
    return this._data.currency;
  }

  get dateBank() {
    return this._data.dateBank;
  }

  get dateRefund() {
    return this._data.dateRefund;
  }

  get payment() {
    return this._data.payment;
  }

  get paymentIntent() {
    return this._data.paymentIntent;
  }

  get payout() {
    return this._data.payout;
  }

  get status() {
    return this._data.status;
  }

  //#endregion

  //#region Setters

  setAmount(value: RefundAmount) {
    this._data.amount = value;
    return this;
  }

  setPayment(value: IdPayment) {
    this._data.payment = value;
    return this;
  }

  //#endregion
}
