import { AbstractModel, type ModelData } from '#core/abstract-model.js';
import type { IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';

import type { IdCustomer } from '../customer/model.js';

export type IdSepa = IdValue<`sepa_${string}`>;
export const IdSepa = (id: string) => validateID<IdSepa>(id, SepaModel.regex);
export interface SepaData extends ModelData {
  bic: string;
  customer: IdCustomer;
  dateMandate: Temporal.PlainDate;
  deleted: boolean;
  id: IdSepa;
  last4: string;
  mandate: string;
  name: string;
  iban: string;
}
export class SepaModel extends AbstractModel<SepaData> {
  static regex = /^sepa_[a-zA-Z0-9]{24}$/;

  get bic() {
    return this._data.bic;
  }

  get customer() {
    return this._data.customer;
  }

  get last4() {
    if (this._data.iban && !this._data.last4) {
      return this._data.iban?.slice(-4);
    }
    return this._data.last4;
  }

  get mandate() {
    return this._data.mandate;
  }

  get dateMandate() {
    return this._data.dateMandate;
  }

  get name() {
    return this._data.name;
  }

  setMandate(value: string) {
    this._data.mandate = value;
    return this;
  }

  setName(value: string) {
    this._data.name = value;
    return this;
  }

  setDateMandate(value: Temporal.PlainDate) {
    this._data.dateMandate = value;
    return this;
  }

  setIban(value: string) {
    this._data.iban = value;
    this._data.last4 = value.slice(-4);
    return this;
  }

  setBic(value: string) {
    this._data.bic = value;
    return this;
  }

  setCustomer(value: IdCustomer) {
    this._data.customer = value;
    return this;
  }
}
