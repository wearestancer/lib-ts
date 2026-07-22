import { Temporal } from 'temporal-polyfill';
import 'temporal-polyfill/global';
import { describe, expect, it } from 'vitest';

import { Configuration } from '#api/configuration.js';
import { PaymentApiEndpoint } from '#payment/api-endpoint.js';
import { CurrencyEnum } from '#payment/enum/currency.js';
import { IdPayment, PaymentAmount, PaymentModel, idPayment, paymentAmount } from '#payment/model.js';
import { PaymentRepository } from '#payment/repository.js';
import { RefundRepository } from '#refund/repository.ts';
import { randomNumber, randomString } from '#test/test-helper.js';

describe('payment functional', () => {
  Configuration.setKey({
    privateLiveKey: null,
    privateTestKey: process.env['API_KEY'] ?? null,
  });
  Configuration._host = process.env['API_HOST'] ?? 'api.stancer.com';
  const amount = randomNumber(50, 5000) as PaymentAmount;
  const currency = CurrencyEnum[randomNumber(0, CurrencyEnum.length - 1)];
  describe('payment creation', () => {
    it('create a payment with minimum information', async () => {
      const repository = new PaymentRepository();

      const payment = await repository.create({ amount, currency });
      await repository.send(payment);
      expect(payment.id).toBeTruthy();
      expect(payment.id).toContain('paym_');
      expect(payment.amount).toBe(amount);
      expect(payment.currency).toBe(currency);
    });

    it('create a complete flat payment', async () => {
      const repository = new PaymentRepository();
      const amount = paymentAmount(randomNumber(50, 4294967295));
      const capture = true; //false doesn't work we need a proper test just for capture
      const currency = CurrencyEnum[randomNumber(0, CurrencyEnum.length - 1)];
      const description = randomString(3, 64);
      const methodsAllowed = ['card']; //because we send all the possible currency
      const orderId = randomString(1, 36);
      const returnUrl = randomString(1, 66);
      const uniqueId = randomString(1, 36);
      const paymentData = {
        amount,
        capture,
        currency,
        description,
        methodsAllowed,
        orderId,
        uniqueId,
        returnUrl: `https://${returnUrl}`,
      };
      const payment = await repository.create(paymentData);

      await repository.send(payment);

      expect(payment.id).toBeTruthy();

      //Check that the value send are the value received
      expect(payment._data).toMatchObject(paymentData);

      // Check that the API Generated value are populated
      expect(payment._data.id).toBe(payment.id);
      expect(payment._data.id).toBeDefined();
      expect(payment._data.createdAt).toBeDefined();
      expect(payment._data.datePayment).toBeDefined();
      expect(payment._data.fee).toBeDefined();
      expect(payment._data.origin).toBeDefined();
    });

    it('need required amount', async () => {
      const repository = new PaymentRepository();

      const paymentWithoutRequiredValue = await repository.create({ currency });

      await expect(async () => await repository.send(paymentWithoutRequiredValue)).rejects.toThrow(
        'amount is required to send PaymentModel',
      );
    });
    it('need required currency', async () => {
      const repository = new PaymentRepository();

      const paymentWithoutRequiredValue = await repository.create({ amount });

      await expect(async () => await repository.send(paymentWithoutRequiredValue)).rejects.toThrow(
        'currency is required to send PaymentModel',
      );
    });
  });

  describe('patch', () => {
    it('is available on payment', async () => {
      const repository = new PaymentRepository();
      const payment = await repository.create({ amount, currency });

      await repository.send(payment);
      const id = payment.id;
      expect(id).toBeTruthy();
      expect(payment.amount).toBe(amount);
      expect(payment.currency).toBe(currency);

      const newAmount = randomNumber(51, 5000);
      payment.setAmount(newAmount);
      await repository.send(payment);
      expect(id).toBe(payment.id);
      expect(payment.amount).toBe(newAmount);
      expect(payment.currency).toBe(currency);
    });
  });
  describe('delete', () => {
    it('cannot delete payment', async () => {
      const repository = new PaymentRepository();
      const payment = await repository.create({ amount, currency });
      await repository.send(payment);
      expect(payment.id).toBeTruthy();
      await expect(async () => await repository.delete(payment)).rejects.toThrow();
    });
  });
  describe('list', async () => {
    it('should return all payment with same orderId', async () => {
      const orderId = `${Date.now()}-${randomString(8)}`;
      const expectedAmount = paymentAmount(50);
      const expectedCurrency = 'eur';
      const expectedCount = 3;
      const repository = new PaymentRepository();
      const payments = await Promise.all(
        Array.from({ length: expectedCount }, () =>
          repository
            .create()
            .then((payment) =>
              repository
                .send(payment.setAmount(expectedAmount).setCurrency(expectedCurrency).setOrderId(orderId))
                .then((payment) => expect(payment).toHaveProperty('id')),
            ),
        ),
      );
      expect(payments).toHaveLength(expectedCount);

      const items = repository.list({ limit: expectedCount, filters: { order_id: orderId } });
      let length = 0;
      for await (const item of items) {
        expect(item).toBeInstanceOf(PaymentModel);
        expect(item.amount).toEqual(expectedAmount);
        expect(item.currency).toEqual(expectedCurrency);
        expect(item.orderId).toEqual(orderId);
        length++;
      }
      expect(length).toBe(expectedCount);
    });

    it('should return empty list if no payment match orderId', async () => {
      const repository = new PaymentRepository();

      const orderId = `no_matching_order_id`;
      const items = await repository.list({ limit: 10, filters: { order_id: orderId } });
      const item = await items.next();
      expect(item.done).toBeTruthy();
    });
  });
  describe('get', () => {
    it('get the correct object', async () => {
      const repository = new PaymentRepository();
      const id = 'paym_36bmekUuW4IMdJrMC0MCeyDt' as IdPayment;
      const payment = await repository.create(id);
      const returnData = {
        id,
        amount: 500,
        card: 'card_uqY2HrovY2sPm0Ac2xhnBkfU',
        capture: true,
        created: Temporal.Instant.fromEpochMilliseconds(1787844165 * 1000),
        currency: 'eur',
        datePayment: Temporal.Instant.fromEpochMilliseconds(1787844165 * 1000),
        description: 'Automatic test, 5.00 eur',
        method: 'card',
        fee: 18,
        origin: 'api',
        response: '00',
        status: 'to_capture',
      };
      const methodsAllowed = ['sepa', 'card'];
      expect(payment.methodsAllowed).toStrictEqual(methodsAllowed);
      expect(payment).toMatchObject(returnData);
    });
    it('get a 404 exception if unknown', async () => {
      const id = 'paym_' + randomString(24);
      const repository = new PaymentRepository();
      await expect(() => repository.create(id)).rejects.toThrow();
    });
  });
  describe('refunds', () => {
    it('get refunds', async () => {
      const refundRepository = new RefundRepository();
      const repository = new PaymentRepository(new PaymentApiEndpoint(), refundRepository);
      const id = idPayment('paym_NoUQRyZNLEv6q7H2ZBmffR7h');
      const payment = await repository.create(id);
      expect(payment.id).toBe(id);
      expect(payment.amount).toBe(5521);
      await repository.populateRefunds(payment);
      expect(payment.refunds).toHaveLength(3);
      expect(payment.refundableAmount).toBe(0);
      expect(payment.refundedAmount).toBe(5521);
      expect(payment.amount).toBe(payment.refundedAmount - payment.refundableAmount);
      expect(payment.isRefundPopulated()).toBe(true);
    });
  });
});
