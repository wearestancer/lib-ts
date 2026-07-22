import { AbstractModel, type ModelData } from '#core/abstract-model.js';
import type { IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';

import type { IdCustomer } from '../customer/model.js';
import { type FundingCard } from './enum/funding.js';
import type { NatureCard } from './enum/nature.js';
import type { NetworkCard, PreferredNetworkCard } from './enum/network.js';

export type IdCard = IdValue<`card_${string}`>;
export const idCard = (id: string) => validateID<IdCard>(id, CardModel.regex);
export interface CardData extends ModelData {
  brand: string;
  country: string;
  customer: IdCustomer;
  cvc: string;
  deleted: boolean;
  expMonth: number;
  expYear: number;
  externalId: string;
  funding: FundingCard;
  id: IdCard;
  last4: string;
  name: string;
  nature: NatureCard;
  network: NetworkCard;
  number: string;
  preferredNetwork: PreferredNetworkCard;
  tokenize: boolean;
  zipCode: string;
}

export class CardModel extends AbstractModel<CardData> {
  static regex = /^card_[a-zA-Z0-9]{24}$/;

  get customer() {
    return this._data.customer;
  }

  get brand() {
    return this._data.brand;
  }

  get country() {
    return this._data.country;
  }

  get expMonth() {
    return this._data.expMonth;
  }

  get expYear() {
    return this._data.expYear;
  }

  get externalId() {
    return this._data.externalId;
  }

  get funding() {
    return this._data.funding;
  }

  get last4() {
    if (!this._data.last4 && this._data.number) {
      return this._data.number.slice(-4);
    }
    return this._data.last4;
  }

  get name() {
    return this._data.name;
  }

  get nature() {
    return this._data.nature;
  }

  get preferredNetwork() {
    return this._data.preferredNetwork;
  }

  get network() {
    return this._data.network;
  }

  get zipCode() {
    return this._data.zipCode;
  }

  setCustomer(value: IdCustomer) {
    this._data.customer = value;
    return this;
  }

  setCvc(value: string) {
    this._data.cvc = value;
    return this;
  }

  setExpYear(value: number) {
    this._data.expYear = value;
    return this;
  }

  setExpMonth(value: number) {
    this._data.expMonth = value;
    return this;
  }
  setExternalId(value: string) {
    this._data.externalId = value;
    return this;
  }

  setName(value: string) {
    this._data.name = value;
    return this;
  }

  setNumber(value: string) {
    this._data.number = value;
    return this;
  }

  setPreferredNetwork(value: PreferredNetworkCard) {
    this._data.preferredNetwork = value;
    return this;
  }

  setTokenize(value: boolean) {
    this._data.tokenize = value;
    return this;
  }

  setZipCode(value: string) {
    this._data.zipCode = value;
    return this;
  }
}
