import { type AddressData, AddressModel } from '#address/model.js';
import { IdValidator } from '#core/common/id-validator.js';
import { type Validator, createdAtValidator, goldilocksValidator } from '#core/validator.js';

const cityMaxLength = 50;
const cityMinLength = 1;
const countryLength = 2;
const lineMaxLength = 50;
const lineMinLength = 1;
const stateMaxLength = 3;
const stateMinLength = 1;
const zipCodeMaxLength = 16;
const zipCodeMinLength = 2;

const lineValidator = (lineName: string) => {
  return goldilocksValidator(lineName, { max: lineMaxLength, min: lineMinLength });
};

export const addressValidator: Validator<AddressData> = {
  id: IdValidator(AddressModel.regex),
  city: goldilocksValidator('city', { min: cityMinLength, max: cityMaxLength }),
  // country check for ISO 3166-1 alpha-2 country codes, because API wait for this precise type.
  country: goldilocksValidator('country', { size: countryLength }),
  createdAt: createdAtValidator,
  // Deleted is a system-managed field for soft deletes, not validated on client side.
  deleted: true,
  line1: lineValidator('line1'),
  line2: lineValidator('line2'),
  line3: lineValidator('line3'),
  // Metadata doesn't have strict set value, so we don't validate it, we let the API reject it.
  metadata: true,
  state: goldilocksValidator('state', { max: stateMaxLength, min: stateMinLength }),
  zipCode: goldilocksValidator('zipCode', { min: zipCodeMinLength, max: zipCodeMaxLength }),
};
