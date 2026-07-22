import { AbstractModel, type ModelType } from '#core/abstract-model.js';
import type { IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';

export type IdAddress = IdValue<`addr_${string}`>;
export const idAddress = (id: string) => validateID<IdAddress>(id, AddressModel.regex);

export interface AddressData extends ModelType {
  city: string;
  country: string;
  id: IdAddress;
  line1: string;
  line2: string;
  line3: string;
  metadata: string;
  state: string;
  zipCode: string;
}
export class AddressModel extends AbstractModel<AddressData> {
  static regex = /^addr_[a-zA-Z0-9]{24}$/;

  get city() {
    return this._data.city;
  }
  get country() {
    return this._data.country;
  }
  get line1() {
    return this._data.line1;
  }
  get line2() {
    return this._data.line2;
  }
  get line3() {
    return this._data.line3;
  }
  get metadata() {
    return this._data.metadata;
  }
  get state() {
    return this._data.state;
  }
  get zipCode() {
    return this._data.zipCode;
  }

  setCity(value: string) {
    this._data['city'] = value;
    return this;
  }
  setCountry(value: string) {
    this._data['country'] = value;
    return this;
  }
  setLine1(value: string) {
    this._data['line1'] = value;
    return this;
  }
  setLine2(value: string) {
    this._data['line2'] = value;
    return this;
  }
  setLine3(value: string) {
    this._data['line3'] = value;
    return this;
  }
  setMetadata(value: string) {
    this._data['metadata'] = value;
    return this;
  }
  setState(value: string) {
    this._data['state'] = value;
    return this;
  }
  setZipCode(value: string) {
    this._data['zipCode'] = value;
    return this;
  }
}
