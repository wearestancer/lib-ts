import { Temporal } from 'temporal-polyfill';
import 'temporal-polyfill/global';
import { describe, expect, it } from 'vitest';

import { Configuration } from '#api/configuration.js';
import { PaymentIntentModel, idPaymentIntent } from '#payment-intent/model.js';
import { PaymentIntentRepository } from '#payment-intent/repository.js';
import { CurrencyEnum } from '#payment/enum/currency.js';
import { PaymentAmount, paymentAmount } from '#payment/model.js';
import { RefundModel } from '#refund/model.js';
import { randomNumber, randomString } from '#test/test-helper.js';

const config = Configuration;
describe('paymentIntent functional', () => {
  config.setKey({
    privateLiveKey: null,
    privateTestKey: process.env['API_KEY'] ?? null,
  });
  config._host = process.env['API_HOST'] ?? 'api.stancer.com';
  const amount = randomNumber(50, 5000) as PaymentAmount;
  const currency = CurrencyEnum[randomNumber(0, CurrencyEnum.length - 1)];
  describe('paymentIntent creation', () => {
    it('create a paymentIntent with minimum information', async () => {
      const repository = new PaymentIntentRepository();

      const paymentIntent = await repository.create({ amount, currency });
      await repository.send(paymentIntent);
      expect(paymentIntent.id).toBeTruthy();
      expect(paymentIntent.id).toContain('pi_');
      expect(paymentIntent.amount).toBe(amount);
      expect(paymentIntent.currency).toBe(currency);
    });

    it('create a complete flat paymentIntent', async () => {
      const repository = new PaymentIntentRepository();
      const amount = paymentAmount(randomNumber(50, 4294967295));
      const capture = true; //false doesn't work we need a proper test just for capture
      const currency = CurrencyEnum[randomNumber(0, CurrencyEnum.length - 1)];
      const description = randomString(3, 64);
      const methodsAllowed = ['card']; //because we send all the possible currency
      const orderId = randomString(1, 36);
      const returnUrl = randomString(1, 66);
      const uniqueId = randomString(1, 36);
      const paymentIntentData = {
        amount,
        capture,
        currency,
        description,
        methodsAllowed,
        orderId,
        uniqueId,
        returnUrl: `https://${returnUrl}`,
      };

      const paymentIntent = await repository.create(paymentIntentData);

      await repository.send(paymentIntent);

      expect(paymentIntent.id).toBeTruthy();
      expect(paymentIntent.uniqueId);

      expect(paymentIntent._data.id).not.toBeUndefined();
      expect(paymentIntent._data.id).not.toBeNull();

      expect(paymentIntent._data).toMatchObject(paymentIntentData);
    });

    it('need required amount', async () => {
      const repository = new PaymentIntentRepository();

      const paymentintentWithoutRequiredValue = await repository.create({ currency });

      await expect(async () => await repository.send(paymentintentWithoutRequiredValue)).rejects.toThrow(
        'amount is required to send PaymentIntentModel',
      );
    });
    it('need required currency', async () => {
      const repository = new PaymentIntentRepository();

      const paymentintentWithoutRequiredValue = await repository.create({ amount });

      await expect(async () => await repository.send(paymentintentWithoutRequiredValue)).rejects.toThrow(
        'currency is required to send PaymentIntentModel',
      );
    });
  });

  describe('patch', () => {
    it('is available on paymentIntent', async () => {
      const repository = new PaymentIntentRepository();
      const paymentIntent = await repository.create({ amount, currency });

      await repository.send(paymentIntent);
      const id = paymentIntent.id;
      expect(id).toBeTruthy();
      expect(paymentIntent.amount).toBe(amount);
      expect(paymentIntent.currency).toBe(currency);

      const newAmount = randomNumber(51, 5000);
      paymentIntent.setAmount(newAmount);
      await repository.send(paymentIntent);
      expect(id).toBe(paymentIntent.id);
      expect(paymentIntent.amount).toBe(newAmount);
      expect(paymentIntent.currency).toBe(currency);
    });
  });
  describe('delete', () => {
    it('cannot delete payed paymentIntent', async () => {
      const repository = new PaymentIntentRepository();
      const paymentIntent = await repository.create('pi_iZwj3voYRVsJdfA0IYo1wLJx');
      expect(paymentIntent.id).toBeTruthy();
      await expect(async () => await repository.delete(paymentIntent)).rejects.toThrow();
    });
    it('can delete non processed paymentIntent (cancelling it)', async () => {
      const repository = new PaymentIntentRepository();
      const paymentIntent = await repository.create({ amount, currency });
      await repository.send(paymentIntent);
      expect(paymentIntent.id).toBeTruthy();
      expect(paymentIntent.status).toBe('require_payment_method');
      await repository.delete(paymentIntent);
      expect(paymentIntent.status).toBe('canceled');
    });
  });
  describe('list', async () => {
    it('should return all paymentIntent with same orderId', async () => {
      const orderId = `${Date.now()}-${randomString(8)}`;
      const expectedAmount = paymentAmount(50);
      const expectedCurrency = 'eur';
      const expectedCount = 3;
      const repository = new PaymentIntentRepository();
      const paymentintents = await Promise.all(
        Array.from({ length: expectedCount }, () =>
          repository
            .create()
            .then((paymentIntent) =>
              repository
                .send(paymentIntent.setAmount(expectedAmount).setCurrency(expectedCurrency).setOrderId(orderId))
                .then((paymentIntent) => expect(paymentIntent).toHaveProperty('id')),
            ),
        ),
      );
      expect(paymentintents).toHaveLength(expectedCount);

      const items = repository.list({ limit: expectedCount, filters: { order_id: orderId } });
      let length = 0;
      for await (const item of items) {
        expect(item).toBeInstanceOf(PaymentIntentModel);
        expect(item.amount).toEqual(expectedAmount);
        expect(item.currency).toEqual(expectedCurrency);
        expect(item.orderId).toEqual(orderId);
        length++;
      }
      expect(length).toBe(expectedCount);
    });
    it('should return empty list if no paymentIntent match orderId', async () => {
      const repository = new PaymentIntentRepository();

      const orderId = `no_matching_order_id`;
      const items = await repository.list({ limit: 10, filters: { order_id: orderId } });
      const item = await items.next();
      expect(item.done).toBeTruthy();
    });
  });
  describe('get', () => {
    it('get the correct object', async () => {
      const repository = new PaymentIntentRepository();
      const id = idPaymentIntent('pi_iZwj3voYRVsJdfA0IYo1wLJx');
      const paymentIntent = await repository.create(id);
      expect(paymentIntent._data.id).toBe(id);
      expect(paymentIntent._data.amount).toBe(50);
      expect(paymentIntent._data.billingAddress).toBeUndefined();
      expect(paymentIntent._data.capture).toBe(true);
      expect(paymentIntent._data.card).toBeUndefined();
      expect(paymentIntent._data.createdAt).toStrictEqual(Temporal.Instant.fromEpochMilliseconds(1789138080 * 1000));
      expect(paymentIntent._data.currency).toBe('eur');
      expect(paymentIntent._data.customer).toBeUndefined();
      expect(paymentIntent._data.dateSettlement).toBeUndefined();
      expect(paymentIntent._data.description).toBeUndefined();
      expect(paymentIntent._data.methodsAllowed).toContain('card');
      expect(paymentIntent._data.methodsAllowed).toContain('sepa');
      expect(paymentIntent._data.orderId).toBe('1789138080518-QR1vpifg');
      expect(paymentIntent._data.origin).toBe('api');
      expect(paymentIntent._data.payment).toBeUndefined();
      expect(paymentIntent._data.returnUrl).toBeUndefined();
      expect(paymentIntent._data.sepa).toBeUndefined();
      expect(paymentIntent._data.shippingAddress).toBeUndefined();
      expect(paymentIntent._data.status).toBe('canceled');
      expect(paymentIntent._data.threeds).toBe('required');
      expect(paymentIntent._data.url).toBe('https://payment.dev.iliad78.net/test_pi_iZwj3voYRVsJdfA0IYo1wLJx');
    });
    it('get a 404 exception if unknown', async () => {
      const id = 'pi_' + randomString(24);
      const repository = new PaymentIntentRepository();
      await expect(() => repository.create(id)).rejects.toThrow();
    });
  });

  describe('refunds', () => {
    it('get refunds', async () => {
      const repository = new PaymentIntentRepository();
      const id = idPaymentIntent('pi_ulnYUmuUFoqp2yWBy1sgvuA3');
      const paymentIntent = await repository.create(id);
      expect(paymentIntent.id).toBe(id);
      expect(paymentIntent.amount).toBe(612);
      await repository.getRefunds(paymentIntent);
      expect(paymentIntent.refunds).toHaveLength(2);
      expect(paymentIntent.refunds[0]).toBeInstanceOf(RefundModel);

      expect(paymentIntent.refundableAmount).toBe(612);
      expect(paymentIntent.refundedAmount).toBe(0);
      expect(paymentIntent.amount).toBe(paymentIntent.refundableAmount + paymentIntent.refundedAmount);
      expect(paymentIntent.isRefundPopulated()).toBe(true);
    });
  });
});
