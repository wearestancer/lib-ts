import { Temporal } from 'temporal-polyfill';
import { expect, vi } from 'vitest';

import { Http } from '#api/http/index.js';
import { ID_SUFFIX_LENGTH } from '#core/common/id-validator.js';

type Boundaries = { min?: number; max?: number };

export const checkType = (
  setter: CallableFunction,
  type: ('string' | 'object' | 'number' | 'boolean')[],
  validValue: unknown,
) => {
  if (!type.includes('object')) {
    expect(() => setter({})).toThrow();
  }
  if (!type.includes('string')) {
    expect(() => setter('a')).toThrow();
  }
  if (!type.includes('number')) {
    expect(() => setter(0)).toThrow();
  }
  if (!type.includes('boolean')) {
    expect(() => setter(true)).toThrow();
  }
  expect(() => setter(validValue)).not.toThrow();
};

export const goldilocks = (validation: CallableFunction, type: 'number' | 'string', boundaries: Boundaries) => {
  const randomFunction = type === 'number' ? randomNumber : randomString;

  const min = boundaries?.min !== undefined && boundaries.min > 0 ? boundaries.min : 0;
  const max = boundaries?.max;
  if (max !== undefined) {
    expect(() => validation(randomFunction(max + 1, 100000))).toThrow();
  }
  if (min) {
    expect(() => validation(randomFunction(0, min - 1))).toThrow();
  }
  expect(() => validation(randomFunction(min ?? 0, max ?? 100))).not.toThrow();
};

export const goldilocksId = (setter: CallableFunction, prefix: string) => {
  const IDLength = prefix.length + ID_SUFFIX_LENGTH;
  expect.soft(() => setter(randomString(1, IDLength - 1))).toThrow();
  expect.soft(() => setter(randomString(IDLength + 1, 50))).toThrow();
  expect.soft(() => setter(randomString(IDLength))).toThrow();
  expect.soft(() => setter(prefix + randomString(ID_SUFFIX_LENGTH))).not.toThrow();
};

/**
 *
 * @param resolver
 * @returns cleanup function that must be called after using mockfetch to reinitialise the global stub
 */
export const mockFetch = (resolver: <T = unknown>(arg0: string, arg1: Http.Request) => T): (() => void) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string, req: Http.Request) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(resolver(url, req)),
        status: 200,
        statusText: 'OK',
        clone: function () {
          return { ...this };
        },
      });
    }),
  );
  return () => vi.unstubAllGlobals();
};

export const randomCVC = (): string => {
  return randomString(3, 3, '0123456789');
};

export const randomDate = (): Temporal.PlainDate => {
  return new Temporal.PlainDate(randomNumber(2000, 2099), randomMonth(), randomNumber(1, 28));
};

export const randomExpYear = (): number => {
  const date = new Date();
  const min = date.getFullYear() + 1;
  return randomNumber(min, 2099);
};

export const randomMonth = (): number => {
  return randomNumber(1, 12);
};

export const randomNumber = (min: number, max?: number): number => {
  if (!max) {
    max = min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomPastDate = (): Temporal.PlainDate => {
  const date = new Date();
  const max = date.getFullYear() - 1;
  const pastYear = randomNumber(1900, max);
  return new Temporal.PlainDate(pastYear, randomMonth(), randomNumber(1, 28));
};

export const randomString = (
  min: number,
  max?: number,
  allowedString = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
): string => {
  const stringLength = randomNumber(min, max);
  let string = '';
  for (let i = 0; i < stringLength; i++) {
    string = string.concat(allowedString.charAt(randomNumber(0, allowedString.length - 1)));
  }
  return string;
};

export const SetterGetter = (
  callable: CallableFunction,
  getter: CallableFunction,
  entryValue: unknown,
  exitValue?: unknown,
) => {
  expect(getter()).toBeNullable();
  callable(entryValue);
  expect(getter()).toStrictEqual(exitValue ?? entryValue);
};

export const SetterGetterId = (Instanciation: CallableFunction, value: unknown = undefined) => {
  const object = Instanciation(value);
  expect(object.id).toStrictEqual(value);
};
