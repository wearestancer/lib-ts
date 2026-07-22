import { Temporal } from 'temporal-polyfill';
import 'temporal-polyfill/global';
import { describe, expect, it } from 'vitest';

import { idAddress } from '#address/model.js';
import { AddressRepository } from '#address/repository.js';
import { Configuration } from '#api/configuration.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import { randomString } from '#test/test-helper.js';

const config = Configuration;
config.setKey({
  privateLiveKey: null,
  privateTestKey: process.env['API_KEY'] ?? null,
});
config._host = process.env['API_HOST'] ?? 'api.stancer.com';

describe('address functional', () => {
  describe('address creation', () => {
    const city = randomString(1, 50);
    const country = randomString(2);
    const zipCode = randomString(2, 16);

    it('create an address with aliased value', async () => {
      const repository = new AddressRepository();
      const address = await repository.create({ zipCode, city, country });
      await repository.send(address);
      expect(address.id).toBeTruthy();
      expect(address.id).toContain('addr_');
      expect(address.zipCode).toBe(zipCode);
      expect(address.city).toBe(city);
      expect(address.country).toBe(country);
    });

    it('create an address', async () => {
      const repository = new AddressRepository();
      const address = await repository.create({ zipCode, city, country });
      const newAddress = await repository.send(address);
      expect(address._data).toStrictEqual(newAddress._data);
      expect(newAddress.id).toBeTruthy();
      expect(newAddress.zipCode).toBe(zipCode);
      expect(newAddress._data.zipCode).toBe(newAddress.zipCode);
      expect(newAddress.city).toBe(city);
      expect(newAddress.country).toBe(country);
    });
    it('create a complete address', async () => {
      const repository = new AddressRepository();

      const zipCode = randomString(2, 16);
      const city = randomString(1, 50);
      const country = randomString(2);

      const line1 = randomString(1, 50);
      const line2 = randomString(1, 50);
      const line3 = randomString(1, 50);
      const state = randomString(1, 3);

      const address = await repository.create({ zipCode, city, line1, line2, line3, state, country });
      await repository.send(address);
      expect(address.id).toBeTruthy();
      expect(address.zipCode).toBe(zipCode);
      expect(address._data.zipCode).toBe(address.zipCode);
      expect(address.city).toBe(city);
      expect(address.country).toBe(country);
      expect(address.line1).toBe(line1);
      expect(address.line2).toBe(line2);
      expect(address.line3).toBe(line3);
      expect(address.state).toBe(state);
    });

    it('need required values', async () => {
      const repository = new AddressRepository();
      const addressWithoutZipCode = await repository.create({ city: randomString(1, 50), country: randomString(2) });
      await expect(async () => await repository.send(addressWithoutZipCode)).rejects.toThrow(
        'zipCode is required to send AddressModel',
      );

      const addressWithoutCity = await repository.create({ zipCode: 'Bloop', country: 'FR' });
      await expect(async () => await repository.send(addressWithoutCity)).rejects.toThrow(
        'city is required to send AddressModel',
      );

      const addressWithoutCountry = await repository.create({ zipCode: 'Bloop', city: randomString(12) });
      await expect(async () => await repository.send(addressWithoutCountry)).rejects.toThrow(
        'country is required to send AddressModel',
      );
    });
  });
  describe('patch', () => {
    it('is not available on address', async () => {
      const repository = new AddressRepository();

      const zipCode = randomString(2, 16);
      const city = randomString(1, 50);
      const country = randomString(2);

      const address = await repository.create({ zipCode, city, country });
      await repository.send(address);
      address.setLine1(randomString(1, 25));
      await expect(() => repository.send(address)).rejects.toThrow(StancerRouteInaccessibleError);
    });
  });
  describe('get', () => {
    it('get the correct object', async () => {
      const repository = new AddressRepository();
      const id = idAddress('addr_YHvhVplBRGET3V7Ns4B6pzD2');
      const address = await repository.create(id);
      expect(address.id).toBe(id);
      expect(address.zipCode).toBe('75008');
      expect(address.zipCode).toBe(address._data.zipCode);
      expect(address.city).toBe('Paris');
      expect(address.country).toBe('FR');
      expect(address.line1).toBe('10 rue');
      expect(address.line2).toBe('de la ville');
      expect(address.line3).toBe('leveque');
      expect(address.state).toBe('IDF');
      expect(address.createdAt).toBeInstanceOf(Temporal.Instant);
      // we are not checking the exact hour for Timecode reason (not the same in our pipeline and locally)
      expect(address.createdAt?.toLocaleString()).toContain('8/13/2026, ');
      expect(address.createdAt?.toLocaleString()).toContain(':36:22 PM');

      expect(address._data.createdAt).toStrictEqual(address.createdAt);
      expect(address.deleted).toBe(false);
    });
  });
});
