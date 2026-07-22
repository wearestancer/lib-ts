import { StancerValidationError } from '#core/error/validation-error.js';

import type { IdValue } from './branded-type.js';

export const ID_SUFFIX_LENGTH = 24;

export const isValidID = <ID extends IdValue>(id: string, regex: RegExp): id is ID => regex.test(id);
export const IdErrorMessage = (value: string, regex: RegExp) => `The id (${value}) doesn't match the pattern ${regex}`;

export const IdValidator = <Id extends IdValue>(regex: RegExp) => {
  return {
    validate: (arg0: string): arg0 is Id => isValidID<Id>(arg0, regex),
    errorMessage: (value: string) => IdErrorMessage(value, regex),
  };
};

export const validateID = <ID extends IdValue>(id: string, regex: RegExp) => {
  if (isValidID<ID>(id, regex)) {
    return id;
  }

  throw new StancerValidationError(IdErrorMessage(id, regex));
};
