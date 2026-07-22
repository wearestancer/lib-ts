import { Temporal } from 'temporal-polyfill';
import 'temporal-polyfill/global';
import { describe, expect, it } from 'vitest';

import { Configuration } from '#api/configuration.js';
import { PreferredNetworkCardEnum } from '#card/enum/network.js';
import { IdCard } from '#card/model.js';
import { CardRepository } from '#card/repository.js';
import { idCustomer } from '#customer/model.ts';
import { randomCVC, randomExpYear, randomMonth, randomNumber, randomString } from '#test/test-helper.js';
import { getValidCardNumber } from '#test/unit/card/card-helper.js';

const config = Configuration;

config.setKey({
  privateLiveKey: null,
  privateTestKey: process.env['API_KEY'] ?? null,
});

config._host = process.env['API_HOST'] ?? 'api.stancer.com';

describe('card functional', () => {
  describe('card creation', () => {
    const expMonth = randomMonth();
    const expYear = randomExpYear();
    const number = getValidCardNumber();

    it('create an card with minimum information', async () => {
      const repository = new CardRepository();

      const card = await repository.create({ expMonth, expYear, number });
      await repository.send(card);
      expect(card.id).toBeTruthy();
      expect(card.id).toContain('card_');
      expect(card.last4).toBe(number.slice(number.length - 4));
    });

    it('create a complete flat card', async () => {
      const repository = new CardRepository();
      const cvc = randomCVC();
      const expMonth = randomMonth();
      const expYear = randomExpYear();
      const externalId = randomString(1, 36);
      const number = getValidCardNumber();
      const last4 = number.slice(number.length - 4);
      const name = randomString(3, 64);
      const preferredNetwork = PreferredNetworkCardEnum[randomNumber(0, PreferredNetworkCardEnum.length - 1)];
      const zipCode = randomString(2, 8);

      const card = await repository.create({
        cvc,
        expMonth,
        expYear,
        externalId,
        number,
        last4,
        name,
        preferredNetwork,
        zipCode,
      });

      await repository.send(card);

      expect(card.id).toBeTruthy();
      expect(card).toMatchObject({ expMonth, expYear, last4 });
    });
    it('create a complete card with customer', async () => {
      const repository = new CardRepository();
      const customer = idCustomer(`cust_SsySBRtGUq3pG9zbSOhJSKCa`);

      const expMonth = randomMonth();
      const expYear = randomExpYear();
      const number = getValidCardNumber();

      const card = await repository.create({ customer, expMonth, expYear, number });

      await repository.send(card);

      expect(card.id).toBeTruthy();
      expect(card.expMonth).toBe(expMonth);
      expect(card.expYear).toBe(expYear);
      expect(card.last4).toBe(number.slice(number.length - 4));
      const now = Temporal.Now.plainDateISO();
      // We check that the date had been created today.
      // If not we cannot ensure the card has the customer we sent.
      if (
        card.createdAt?.toZonedDateTimeISO('UTC').year === now.year &&
        card.createdAt?.toZonedDateTimeISO('UTC').month === now.month &&
        card.createdAt?.toZonedDateTimeISO('UTC').day === now.day
      ) {
        expect(card.customer).toBe(customer);
      }
    });

    it('need required expMonth', async () => {
      const expYear = randomExpYear();
      const number = getValidCardNumber();

      const repository = new CardRepository();

      const cardWithoutRequiredValue = await repository.create({ expYear, number });

      await expect(async () => await repository.send(cardWithoutRequiredValue)).rejects.toThrow(
        'expMonth is required to send CardModel',
      );
    });
    it('need required expYear', async () => {
      const repository = new CardRepository();

      const cardWithoutRequiredValue = await repository.create({ expMonth, number });

      await expect(async () => await repository.send(cardWithoutRequiredValue)).rejects.toThrow(
        'expYear is required to send CardModel',
      );
    });
    it('need required number', async () => {
      const repository = new CardRepository();

      const cardWithoutRequiredValue = await repository.create({ expMonth, expYear });

      await expect(async () => await repository.send(cardWithoutRequiredValue)).rejects.toThrow(
        'number is required to send CardModel',
      );
    });
  });

  describe('patch', () => {
    it('is available on card', async () => {
      const repository = new CardRepository();

      const expMonth = randomMonth();
      const expYear = randomExpYear();
      const number = getValidCardNumber();
      const card = await repository.create({ expMonth, expYear, number });

      await repository.send(card);
      const id = card.id;
      expect(id).toBeTruthy();
      expect(card.expMonth).toBe(expMonth);
      expect(card.expYear).toBe(expYear);

      const newExpYear = randomExpYear() + 1;
      card.setExpYear(newExpYear);
      await repository.send(card);
      expect(id).toBe(card.id);
      expect(card.expYear).toBe(newExpYear);
      expect(card.expMonth).toBe(expMonth);
    });
  });

  describe('get', () => {
    it('get the correct object', async () => {
      const repository = new CardRepository();
      const id = 'card_uqY2HrovY2sPm0Ac2xhnBkfU' as IdCard;
      const card = await repository.create(id);
      expect(card.id).toBe(id);
      expect(card.brand).toBe('visa');
      expect(card.country).toBe('US');
      expect(card.funding).toBe('credit');
      expect(card.last4).toBe('3055');
      expect(card.nature).toBe('personal');
      expect(card.network).toBe('visa');
      expect(card.zipCode).toBe('75001');
      expect(card.createdAt.epochMilliseconds).toBe(1758551022000);
      expect(card.deleted).toBe(false);
      expect(card.expMonth).toBe(12);
      expect(card.expYear).toBe(2099);
    });
    it('get a 404 exception if unknown', async () => {
      const id = 'card_' + randomString(24);
      const repository = new CardRepository();
      await expect(() => repository.create(id)).rejects.toThrow();
    });
  });
});
