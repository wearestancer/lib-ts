import { IdValidator } from '#core/common/id-validator.js';
import { type Validator, createdAtValidator, enumValidator, goldilocksValidator } from '#core/validator.js';

import { CustomerModel, type IdCustomer } from '../customer/model.js';
import { FundingCardEnum } from './enum/funding.js';
import { NatureCardEnum } from './enum/nature.js';
import { NetworkCardEnum, PreferredNetworkCardEnum } from './enum/network.js';
import { type CardData, CardModel, type IdCard } from './model.js';

const expMonthValidator = {
  validate: (arg0: number) => typeof arg0 === 'number' && arg0 > 0 && arg0 <= 12,
  errorMessage: (value: string) => `${value} is not a month (between 1 and 12)`,
};
const expYearValidator = {
  validate: (arg0: number) => typeof arg0 === 'number' && String(arg0).length === 4,
  errorMessage: (value: string) => `${value} is not a correct year (must be 4 digits)`,
};

export const cardNumberValidator = {
  validate: (arg0: string) => {
    if (typeof arg0 !== 'string') {
      return false;
    }

    const numb = arg0.replaceAll(/\s/g, '').replaceAll(/\D/g, '');

    if (!numb) {
      return false;
    }

    const reversed: string[] = numb.split('').reverse();
    const calc = (digit: number) => {
      const number = digit * 2;
      if (number < 10) {
        return number;
      }
      const splited = String(number).split('');
      return Number(splited[0]) + Number(splited[1]);
    };
    const sum = reversed.reduce((n, sum, index) => {
      if (index % 2) {
        return String(Number(n) + calc(Number(sum)));
      }
      return String(Number(n) + Number(sum));
    }, '0');

    if (Number(sum) % 10) {
      return false;
    }

    return true;
  },
  errorMessage: (value: string) => `${value} is not a valid credit card number`,
};

export const cardValidator: Validator<CardData> = {
  id: IdValidator<IdCard>(CardModel.regex),
  brand: true,
  country: goldilocksValidator('country', { size: 2 }),
  customer: IdValidator<IdCustomer>(CustomerModel.regex),
  cvc: {
    validate: (arg0: string) => /^\d{3}$/.test(arg0),
    errorMessage: (value: string) => `${value} is not a valid CVC (must be 3 digits)`,
  },
  createdAt: createdAtValidator,
  deleted: true,
  expMonth: expMonthValidator,
  expYear: expYearValidator,
  externalId: goldilocksValidator('externalID', { min: 1, max: 36 }),
  funding: enumValidator(FundingCardEnum, false),
  last4: true,
  name: goldilocksValidator('name', { min: 1, max: 64 }),
  nature: enumValidator(NatureCardEnum, false),
  network: enumValidator(NetworkCardEnum, false),
  number: cardNumberValidator,
  preferredNetwork: enumValidator(PreferredNetworkCardEnum),
  tokenize: true,
  zipCode: goldilocksValidator('zipCode', { min: 0, max: 8 }),
};
