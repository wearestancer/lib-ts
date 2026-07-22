import { AbstractModel, type ModelData } from '#core/abstract-model.js';
import { IdValue } from '#core/common/branded-type.js';
import { isValidID } from '#core/common/id-validator.js';
import { Validator, createdAtValidator } from '#core/validator.js';

//#region Data interface

export type IdStub = IdValue<`stub_${string}`>;
export const STUB_DEFAULT_MAX_LENGTH = 64;
export const STUB_DEFAULT_NUMBER_MAX_LENGTH = 264;
export interface StubData extends ModelData {
  id: IdValue;
  default: string;
  defaultNumber: number;
  untouchable: boolean;
  allAuthorized: boolean;
  ungettable: boolean;
  unmodifiable: boolean;
}

//#endregion
//#region validator
export const StubValidator: Validator<StubData> = {
  id: {
    validate: (arg0) => isValidID<IdStub>(arg0, StubModel.regex),
    errorMessage: (value: string) => `The id (${value}) doesn't verify the regex ${StubModel.regex}`,
  },
  default: {
    validate: (arg0) => arg0.length < STUB_DEFAULT_MAX_LENGTH,
    errorMessage: (value: string) => `The length of value (${value.length}) is too long`,
  },
  defaultNumber: {
    validate: (arg0) => arg0 < STUB_DEFAULT_NUMBER_MAX_LENGTH,
    errorMessage: (value: string) => `DefaultNumber is too big of a number (${value})`,
  },
  ungettable: true,
  unmodifiable: true,
  untouchable: true,
  allAuthorized: true,
  createdAt: createdAtValidator,
  deleted: true,
};

//#endregion

export class StubModel extends AbstractModel<StubData> {
  //#region properties
  static regex = /^stub_[a-zA-Z0-9]{24}$/;

  //#endregion
  //#region setter & getter

  get allAuthorized() {
    return this._data.allAuthorized;
  }

  setAllAuthorized(value: boolean) {
    this._data.allAuthorized = value;
  }

  get default() {
    return this._data.default;
  }

  setDefault(value: string) {
    this._data.default = value;
  }

  get defaultNumber() {
    return this._data.defaultNumber;
  }
  setDefaultNumber(value: number) {
    this._data.defaultNumber = value;
  }

  setUngettable(value: boolean) {
    this._data.ungettable = value;
  }
  get unmodifiable() {
    return this._data.unmodifiable;
  }
}
