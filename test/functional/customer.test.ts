import { getExampleNumber } from 'libphonenumber-js';
import mobileExamples from 'libphonenumber-js/mobile/examples';
import { Temporal } from 'temporal-polyfill';
import 'temporal-polyfill/global';
import { describe, expect, it } from 'vitest';

import { idAddress } from '#address/model.ts';
import { Configuration } from '#api/configuration.js';
import { IdCustomer } from '#customer/model.js';
import { CustomerRepository } from '#customer/repository.js';
import { randomMonth, randomNumber, randomString } from '#test/test-helper.js';

const config = Configuration;

config.setKey({
  privateLiveKey: null,
  privateTestKey: process.env['API_KEY'] ?? null,
});

config._host = process.env['API_HOST'] ?? 'api.stancer.com';

describe('customer functional', () => {
  describe('customer creation', () => {
    const email = `stancertstest+${randomString(1, 5)}@example.com`;
    const mobile = getExampleNumber('FR', mobileExamples)?.formatInternational().replaceAll(' ', '');

    it('create an customer with email ', async () => {
      const repository = new CustomerRepository();
      const customer = await repository.create({ email });
      await repository.send(customer);
      expect(customer.id).toBeTruthy();
      expect(customer.id).toContain('cust_');
      expect(customer.email).toBe(email);
    });

    it('create an customer with mobile ', async () => {
      const repository = new CustomerRepository();
      const customer = await repository.create({ mobile });
      await repository.send(customer);
      expect(customer.id).toBeTruthy();
      expect(customer.id).toContain('cust_');
      expect(customer.mobile).toBe(mobile);
    });

    it('create an customer with both ', async () => {
      const repository = new CustomerRepository();
      const customer = await repository.create({ email, mobile });
      await repository.send(customer);
      expect(customer.id).toBeTruthy();
      expect(customer.id).toContain('cust_');
      expect(customer.email).toBe(email);
      expect(customer.mobile).toBe(mobile);
    });

    it('create a complete flat customer', async () => {
      const repository = new CustomerRepository();
      const mobile = getExampleNumber('FR', mobileExamples)?.formatInternational().replaceAll(' ', '');
      const dateBirth = Temporal.PlainDate.from(
        `${randomNumber(1000, 2025)}-${String(randomMonth()).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`,
      );
      const externalId = randomString(1, 36);
      const legalId = randomString(1, 16);
      const name = randomString(3, 64);
      const country = randomString(2);

      const customer = await repository.create({ mobile, country, dateBirth, email, externalId, legalId, name });

      await repository.send(customer);

      expect(customer.id).toBeTruthy();

      expect(customer.mobile).toBe(mobile);

      expect(customer._data.mobile).toBe(customer.mobile);
      expect(customer._data.dateBirth).toBe(customer.dateBirth);
      expect(customer._data.externalId).toBe(customer.externalId);
      expect(customer._data.legalId).toBe(customer.legalId);
      expect(customer._data.name).toBe(customer.name);
      expect(customer._data.country).toBe(customer.country);
    });
    it('create a complete customer with addresses', async () => {
      const repository = new CustomerRepository();
      const mobile = getExampleNumber('FR', mobileExamples)?.formatInternational().replaceAll(' ', '');
      const dateBirth = Temporal.PlainDate.from(
        `${randomNumber(1000, 2025)}-${String(randomMonth()).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`,
      );
      const externalId = randomString(1, 36);
      const legalId = randomString(0, 16);
      const name = randomString(3, 64);
      const country = randomString(2);
      const billingAddress = idAddress('addr_YHvhVplBRGET3V7Ns4B6pzD2');
      const shippingAddress = idAddress('addr_YHvhVplBRGET3V7Ns4B6pzD2');

      const customer = await repository.create({
        mobile,
        country,
        dateBirth,
        email,
        externalId,
        legalId,
        name,
        billingAddress,
        shippingAddress,
      });

      await repository.send(customer);

      expect(customer.id).toBeTruthy();

      expect(customer.mobile).toBe(mobile);

      expect(customer._data.mobile).toBe(customer.mobile);
      expect(customer._data.dateBirth).toBe(customer.dateBirth);
      expect(customer._data.externalId).toBe(customer.externalId);
      expect(customer._data.legalId).toBe(customer.legalId);
      expect(customer._data.name).toBe(customer.name);
      expect(customer._data.country).toBe(customer.country);
      expect(customer._data.billingAddress).toBe(customer.billingAddress);
      expect(customer._data.shippingAddress).toBe(customer.shippingAddress);
    });

    it('need required values', async () => {
      const repository = new CustomerRepository();
      const name = randomString(3, 64);

      const customerWithoutRequiredValue = await repository.create({ name });

      await expect(async () => await repository.send(customerWithoutRequiredValue)).rejects.toThrow(
        'one of the partially required data ( email or mobile) is required to send CustomerModel',
      );
    });
  });

  describe('patch', () => {
    it('is available on customer', async () => {
      const repository = new CustomerRepository();

      const mobile = getExampleNumber('FR', mobileExamples)?.formatInternational().replaceAll(' ', '');

      const country = randomString(2);

      const customer = await repository.create({ mobile, country });

      await repository.send(customer);
      const id = customer.id;
      const legalId = randomString(1, 16);
      customer.setLegalId(legalId);

      await repository.send(customer);
      expect(id).toBe(customer.id);
      expect(mobile).toBe(customer.mobile);
      expect(country).toBe(customer.country);
      expect(legalId).toBe(customer.legalId);
    });
  });

  describe('get', () => {
    it('get the correct object', async () => {
      const repository = new CustomerRepository();
      const id = 'cust_SsySBRtGUq3pG9zbSOhJSKCa' as IdCustomer;
      const customer = await repository.create(id);
      expect(customer.id).toBe(id);
      expect(customer.mobile).toBe('+33612345678');
      expect(customer.country).toBe('FR');
      expect(customer.dateBirth).toBeInstanceOf(Temporal.PlainDate);
      expect(customer.dateBirth.toString()).toBe('2008-01-01');
      expect(customer.createdAt).toBeInstanceOf(Temporal.Instant);
      expect(customer.createdAt?.toLocaleString()).toContain('8/19/2026, ');
      expect(customer.createdAt?.toLocaleString()).toContain(':09:15 PM');
      expect(customer.createdAt.epochMilliseconds).toBe(1787141355 * 1000);
      expect(customer.deleted).toBe(false);
    });
  });
});
