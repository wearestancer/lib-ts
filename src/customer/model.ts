import type { IdAddress } from '#address/model.js';
import { AbstractModel, type ModelType } from '#core/abstract-model.js';
import type { IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';

export type IdCustomer = IdValue<`cust_${string}`>;
export const idCustomer = (id: string) => validateID<IdCustomer>(id, CustomerModel.regex);

export interface CustomerData extends ModelType {
  id: IdCustomer;
  country: string;
  dateBirth: Temporal.PlainDate;
  email: string;
  externalId: string;
  legalId: string;
  mobile: string;
  name: string;
  billingAddress: IdAddress;
  shippingAddress: IdAddress;
}

export class CustomerModel extends AbstractModel<CustomerData> {
  static regex = /^cust_[a-zA-Z0-9]{24}$/;

  //#region Getters

  get billingAddress() {
    return this._data.billingAddress;
  }

  get country() {
    return this._data.country;
  }

  get dateBirth() {
    return this._data.dateBirth;
  }

  get email() {
    return this._data.email;
  }

  get externalId() {
    return this._data.externalId;
  }

  get legalId() {
    return this._data.legalId;
  }

  get mobile() {
    return this._data.mobile;
  }

  get name() {
    return this._data.name;
  }

  get shippingAddress() {
    return this._data.shippingAddress;
  }

  //#endregion

  //#region Setters

  setBillingAddress(value: IdAddress) {
    this._data.billingAddress = value;
    return this;
  }

  setCountry(value: string) {
    this._data.country = value;
    return this;
  }

  setDateBirth(value: Temporal.PlainDate) {
    this._data.dateBirth = value;
    return this;
  }

  setEmail(value: string) {
    this._data.email = value;
    return this;
  }

  setExternalId(value: string) {
    this._data.externalId = value;
    return this;
  }

  setLegalId(value: string) {
    this._data.legalId = value;
    return this;
  }

  setMobile(value: string) {
    this._data.mobile = value;
    return this;
  }

  setName(value: string) {
    this._data.name = value;
    return this;
  }

  setShippingAddress(value: IdAddress) {
    this._data.shippingAddress = value;
    return this;
  }

  //#endregion
}
