import { describe, expect, it } from 'vitest';

import { StancerValidationError } from '#error/validation-error.js';
import { IdStub, StubData, StubModel, StubValidator } from '#test/stub/stub-model.js';
import { randomNumber, randomString } from '#test/test-helper.js';

describe('stub model', () => {
  describe('constructor', () => {
    it('should be created without anything', () => {
      const stub = new StubModel(StubValidator);
      expect(stub.id).toBeUndefined();
      expect(stub._data).toEqual({});
    });

    it('should be created with good ID', () => {
      const id = 'stub_' + randomString(24, 24);
      const stub = new StubModel(StubValidator, id);
      expect(stub.id).toEqual(id);
      expect(stub._data).toEqual({ id: id });
      expect(stub._data.getMutations()).toStrictEqual({ id });
    });

    it("shouldn't be created with bad ID", () => {
      const id = randomString(22, 24);
      expect(() => new StubModel(StubValidator, id)).toThrow();
    });

    it("shouldn't accept custom bad data", () => {
      const data: Partial<StubData> = {
        id: randomString(24, 25) as IdStub,
        default: randomString(12, 25),
      };
      expect(() => new StubModel(StubValidator, data)).toThrow();
    });

    it('should accept custom good data', () => {
      const id = ('stub_' + randomString(24)) as IdStub;
      const defaultValue = randomString(28, 32);
      const data: Partial<StubData> = {
        id,
        default: defaultValue,
      };
      const stub = new StubModel(StubValidator, data);
      expect(stub._data).toEqual(data);
    });
  });

  describe('Id setter', () => {
    it('should accept good Id', () => {
      const id = 'stub_' + randomString(24, 24);
      const stub = new StubModel(StubValidator, id);
      expect(stub._data.id).toStrictEqual(id);
      expect(stub.id).toStrictEqual(id);
    });

    it('should refuse bad ID', () => {
      const falseId = randomString(12, 24);
      expect(() => new StubModel(StubValidator, falseId)).toThrow(StancerValidationError);
    });
  });

  describe('default setter', () => {
    it('should accept good string length', () => {
      const stub = new StubModel(StubValidator);
      const defaultValue = randomString(1, 63);
      stub.setDefault(defaultValue);
      expect(stub.default).toBe(defaultValue);
    });

    it("shouldn't accept bad value", () => {
      const stub = new StubModel(StubValidator);
      //We want to hard prevent bad typing
      expect(() => stub.setDefault(12)).toThrow();
      expect(() => stub.setDefault(randomString(65, 100))).toThrow();
    });
  });

  describe('DefaultNumber setter', () => {
    it('should accept good number', () => {
      const stub = new StubModel(StubValidator);
      const defaultNumber = randomNumber(1, 263);
      stub.setDefaultNumber(defaultNumber);
      expect(stub.defaultNumber).toBe(defaultNumber);
    });

    it("shouldn't accept bad value", () => {
      const stub = new StubModel(StubValidator);
      const defaultNumber = randomNumber(265, 30000);
      expect(() => stub.setDefaultNumber(defaultNumber)).toThrow();
      expect(() => stub.setDefaultNumber('string')).toThrow();
    });
  });

  describe('boolean property', () => {
    it('should accept boolean', () => {
      const stub = new StubModel(StubValidator);
      const boolValue = true;
      stub.setUngettable(boolValue);
      expect(stub._data.ungettable).toBe(boolValue);
      stub.setAllAuthorized(boolValue);
      expect(stub.allAuthorized).toBe(boolValue);
    });

    it('should have gettable property', () => {
      const stub = new StubModel(StubValidator);
      // direct accession to _data is not validated
      stub._data.unmodifiable = true;
      expect(stub.unmodifiable).toBe(true);
    });
  });
});
