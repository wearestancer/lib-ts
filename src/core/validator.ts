import { Temporal } from 'temporal-polyfill';

import { StancerValidationError } from './error/validation-error.js';

//#region Types

interface ValidatorObject<Property> {
  errorMessage: (value: string) => string;
  validate: (value: Property) => boolean;
}

/**
 * Validator configuration mapping each property to either a ValidatorObject or true (pass-through).
 */
export type Validator<ValidationData> = {
  [Property in keyof ValidationData]: ValidatorObject<ValidationData[Property]> | true;
};

/**
 * Validation function that validates a single property value.
 * @returns true if valid
 * @throws {StancerValidationError} if invalid
 */
export type ValidationFunction<Data> = <Key extends keyof Data>(key: Key, value: Data[Key]) => true | never;

interface ExactSize {
  size: number;
  min?: undefined;
  max?: undefined;
}

interface BorderedSize {
  min: number;
  max: number;
  size?: undefined;
}

type GoldilocksSize = ExactSize | BorderedSize;

//#endregion

//#region Core Validation Logic

/**
 * Creates a validation function from a validator configuration.
 */
export const processValidator = <Data>(validator: Validator<Data>): ValidationFunction<Data> => {
  return (key, value) => {
    const rule = validator[key];

    if (!rule || rule === true) {
      return true;
    }

    if (!rule.validate(value)) {
      throw new StancerValidationError(rule.errorMessage(String(value)));
    }

    return true;
  };
};

//#endregion

//#region Validator Factories

/**
 * Pass-through validator that accepts any value without validation.
 * Use for fields like createdAt that are set server-side.
 */
export const createdAtValidator = true;

/**
 * Creates a string length validator with exact size or min/max bounds.
 * @throws {StancerValidationError} At creation time if configuration is invalid
 */
export const goldilocksValidator = (propertyName: string, { max, min, size }: GoldilocksSize) => {
  const hasExactSize = size !== undefined || (max !== undefined && max === min);
  const hasBoundedSize = min !== undefined && max !== undefined && min <= max;

  if (hasExactSize) {
    const exactLength = size ?? max;
    return {
      errorMessage: (value: string) => `${value} of ${propertyName} must be exactly ${exactLength} characters`,
      validate: (value: string) => value.length === exactLength,
    };
  }

  if (hasBoundedSize) {
    return {
      errorMessage: (value: string) => `${value} of ${propertyName} must be between ${min} and ${max} characters`,
      validate: (value: string) => value.length >= min && value.length <= max,
    };
  }

  throw new StancerValidationError(
    `goldilocksValidator for ${propertyName} requires either a size parameter or both min and max parameters`,
  );
};

/**
 * Creates an enum validator for string union types.
 * @param strict - When false and not in DEBUG mode, bypasses validation to prevent SDK crashes
 *                 when API adds new enum values unknown to the SDK.
 */
export const enumValidator = <Enum extends readonly string[]>(values: Enum, strict: boolean = true) => {
  if (!strict && process.env['DEBUG'] !== 'true') {
    return true;
  }

  return {
    validate: (value: unknown): value is (typeof values)[number] =>
      typeof value === 'string' && values.includes(value as (typeof values)[number]),
    errorMessage: (value: string) => `Expected one of ${values.join(', ')}. Got ${value}`,
  };
};

/**
 * Creates a PlainDate validator ensuring the date is between 1971 and today.
 */
export const plainDateValidator = (field: string) => {
  return {
    validate: (value: Temporal.PlainDate) =>
      value.year > 1970 && Temporal.PlainDate.compare(Temporal.Now.plainDateISO(), value) === 1,
    errorMessage: () => `${field} must be a date between 1971 and now.`,
  };
};

//#endregion
