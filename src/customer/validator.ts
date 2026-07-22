import { Temporal } from 'temporal-polyfill';

import { AddressModel, type IdAddress } from '#address/model.js';
import { IdValidator } from '#core/common/id-validator.js';
import { type Validator, createdAtValidator, goldilocksValidator } from '#core/validator.js';

import { type CustomerData, CustomerModel, type IdCustomer } from './model.js';

export const customerValidator: Validator<CustomerData> = {
  id: IdValidator<IdCustomer>(CustomerModel.regex),
  billingAddress: IdValidator<IdAddress>(AddressModel.regex),
  country: goldilocksValidator('country', { size: 2 }),
  createdAt: createdAtValidator,
  dateBirth: {
    validate: (arg0: Temporal.PlainDate) =>
      arg0 instanceof Temporal.PlainDate && Temporal.PlainDate.compare(Temporal.Now.plainDateISO(), arg0) === 1,
    errorMessage: (arg0) => `DateBirth ${arg0.toString()} must be a Temporal.PlainDate set in the past.`,
  },
  deleted: true,
  email: goldilocksValidator('email', { min: 1, max: 64 }),
  externalId: goldilocksValidator('externalId', { min: 1, max: 36 }),
  legalId: goldilocksValidator('legalId', { min: 1, max: 16 }),
  mobile: goldilocksValidator('mobile', { min: 1, max: 16 }),
  name: goldilocksValidator('name', { min: 1, max: 64 }),
  shippingAddress: IdValidator<IdAddress>(AddressModel.regex),
};
