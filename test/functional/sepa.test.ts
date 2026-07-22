import { Temporal } from 'temporal-polyfill';
import 'temporal-polyfill/global';
import { describe, expect, it } from 'vitest';

import { Configuration } from '#api/configuration.js';
import { IdSepa } from '#sepa/model.js';
import { SepaRepository } from '#sepa/repository.js';
import { randomMonth, randomNumber, randomString } from '#test/test-helper.js';
import { bicDataProvider, validIbanDataProvider } from '#test/unit/sepa/sepa-helper.js';

import { idCustomer } from '../../src/customer/model';

const config = Configuration;

config.setKey({
  privateLiveKey: null,
  privateTestKey: process.env['API_KEY'] ?? null,
});

config._host = process.env['API_HOST'] ?? 'api.stancer.com';

describe('sepa functional', () => {
  describe('sepa creation', () => {
    const iban = validIbanDataProvider(true);
    const name = randomString(3, 64);

    it('create an sepa with minimum information', async () => {
      const repository = new SepaRepository();

      const sepa = await repository.create({ iban, name });
      await repository.send(sepa);
      expect(sepa.id).toBeTruthy();
      expect(sepa.id).toContain('sepa_');
      expect(sepa.name).toBe(name);
      expect(sepa.last4).toBe(iban.slice(iban.length - 4));
    });

    it('create a complete flat sepa', async () => {
      const repository = new SepaRepository();
      const mandate = randomString(1, 35);
      const name = randomString(3, 64);
      const dateMandate = Temporal.PlainDate.from(
        `${String(randomNumber(1971, 2020))}-${String(randomMonth()).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`,
      );
      const iban = validIbanDataProvider(true) as string;
      const bic = bicDataProvider(true) as string;
      const customer = idCustomer('cust_SsySBRtGUq3pG9zbSOhJSKCa');
      const last4 = iban.slice(iban.length - 4);

      const sepa = await repository.create({
        mandate,
        name,
        dateMandate,
        iban,
        bic,
        customer,
      });

      await repository.send(sepa);

      expect(sepa.id).toBeTruthy();

      expect(sepa._data.mandate).toBe(sepa.mandate);
      expect(sepa._data.dateMandate).toBe(sepa.dateMandate);
      expect(sepa._data.last4).toBe(last4);
      expect(sepa._data.name).toBe(sepa.name);
      expect(sepa._data.bic).toBe(sepa.bic);
    });
    it('need required name', async () => {
      const iban = validIbanDataProvider(true) as string;

      const repository = new SepaRepository();

      const sepaWithoutRequiredValue = await repository.create({ iban });

      await expect(async () => await repository.send(sepaWithoutRequiredValue)).rejects.toThrow(
        'name is required to send SepaModel',
      );
    });
    it('need required iban', async () => {
      const name = randomString(3, 64);

      const repository = new SepaRepository();

      const sepaWithoutRequiredValue = await repository.create({ name });

      await expect(async () => await repository.send(sepaWithoutRequiredValue)).rejects.toThrow(
        'iban is required to send SepaModel',
      );
    });

    describe('patch', () => {
      it('is available on sepa', async () => {
        const repository = new SepaRepository();
        const name = randomString(3, 64);
        const iban = validIbanDataProvider(true) as string;

        const sepa = await repository.create({ name, iban });

        await repository.send(sepa);
        const id = sepa.id;
        expect(id).toBeTruthy();
        expect(sepa.last4).toBe(iban.slice(iban.length - 4));
        expect(sepa.name).toBe(name);

        const newName = randomString(3, 64);
        sepa.setName(newName);
        await repository.send(sepa);
        expect(id).toBe(sepa.id);
        expect(sepa.name).toBe(newName);
        expect(sepa.last4).toBe(iban.slice(iban.length - 4));
      });
    });

    describe('get', () => {
      it('get the correct object', async () => {
        const repository = new SepaRepository();
        const id = 'sepa_XbEkAt8hAKTbh6Yel7xjEk7O' as IdSepa;
        const sepa = await repository.create(id);
        expect(sepa.id).toBe(id);
        expect(sepa.bic).toBe('TESTFRPP');
        expect(sepa.last4).toBe('2606');
        expect(sepa.dateMandate).toEqual(Temporal.PlainDate.from('2024-12-25'));
        expect(sepa.mandate).toBe('libraries_mandate_id');
        expect(sepa.name).toBe('Patrice Dinde');
        expect(sepa.createdAt.epochMilliseconds).toBe(1758551637000);
        expect(sepa.deleted).toBe(false);
      });
      it('get a 404 exception if unknown', async () => {
        const id = 'sepa_' + randomString(24);
        const repository = new SepaRepository();
        await expect(() => repository.create(id)).rejects.toThrow();
      });
    });
  });
});
