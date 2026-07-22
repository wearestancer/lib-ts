import { Temporal } from 'temporal-polyfill';

import { IdValidator } from '#core/common/id-validator.js';
import { type Validator, createdAtValidator, goldilocksValidator } from '#core/validator.js';

import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { type IdSepa, type SepaData, SepaModel } from './model.js';

// IBAN validation using ISO/IEC 7064 MOD 97-10 algorithm
// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number#Validating_the_IBAN
export const ibanValidator = {
  validate: (arg0: string) => {
    const iban = arg0.replaceAll(' ', '');
    if (!/^[a-zA-Z0-9]+$/.test(iban)) {
      return false;
    }
    const start = iban.slice(0, 4);
    const bban = iban.slice(4);
    const codeWithLetters = (bban + start).toUpperCase();

    const letterToNumber = (character: string) => character.charCodeAt(0) - 55;

    const code = codeWithLetters
      .split('')
      .map((character) => (Number.isNaN(Number(character)) ? letterToNumber(character) : character))
      .join('');

    const check = code.slice(0, 2);
    const parts = code.slice(2).match(/.{1,7}/g) ?? [];

    const result = parts.reduce((prev, curr) => String(Number(prev + curr) % 97), check);

    if (result === '1') {
      return true;
    }
    return false;
  },
  errorMessage: (value: string) => `IBAN ending in ${value.slice(-4)} is not valid`,
};

export const sepaValidator: Validator<SepaData> = {
  id: IdValidator<IdSepa>(SepaModel.regex),
  bic: goldilocksValidator('bic', { min: 8, max: 11 }),
  customer: IdValidator<IdCustomer>(CustomerModel.regex),
  createdAt: createdAtValidator,
  deleted: true,
  dateMandate: {
    validate: (arg0: Temporal.PlainDate) =>
      arg0.year > 1970 && Temporal.PlainDate.compare(Temporal.Now.plainDateISO(), arg0) === 1,
    errorMessage: () => 'DateMandate must be a past date.',
  },
  iban: ibanValidator,
  last4: true,
  mandate: goldilocksValidator('mandate', { min: 1, max: 35 }),
  name: goldilocksValidator('name', { min: 3, max: 64 }),
};
