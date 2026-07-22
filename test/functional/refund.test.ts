import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';

import { Configuration } from '#api/configuration.js';
import { idCard } from '#card/model.js';
import { PaymentRepository } from '#payment/repository.js';
import { RefundModel, idRefund, refundAmount } from '#refund/model.js';
import { RefundRepository } from '#refund/repository.js';
import { randomNumber, randomString } from '#test/test-helper.js';

const config = Configuration;
const amount = refundAmount(randomNumber(1, 50));
const paymentRepository = new PaymentRepository();

describe('refund functional', async () => {
  config.setKey({
    privateLiveKey: null,
    privateTestKey: process.env['API_KEY'] ?? null,
  });
  config._host = process.env['API_HOST'] ?? 'api.stancer.com';

  const repository = new RefundRepository();
  describe('refund post', async () => {
    const payment = await paymentRepository.create();
    payment.setCard(idCard('card_Y2QKuArL3x7A18OjLZdSizoI'));
    payment.setAmount(1000);
    payment.setCurrency('eur');
    await paymentRepository.send(payment);
    it('create a refund with id', { concurrent: false }, async () => {
      const refund = await repository.create({ amount, payment: payment.id });
      await repository.send(refund);
      expect(refund.id).toBeDefined();
      expect(refund.id).toContain('refd_');
      expect(refund.amount).toBe(amount);
      expect(refund.currency).toBeDefined();
      expect(refund.status).toBeDefined();
      await paymentRepository.populateRefunds(payment);
      expect(payment.refundedAmount).toBe(refund.amount);
    });
    it('create a refund with paymentModel', { concurrent: false }, async () => {
      const refund = await repository.create({ amount, payment: payment.id });
      await repository.send(refund);
      expect(refund.id).toBeDefined();
      expect(refund.id).toContain('refd_');
      expect(refund.amount).toBe(amount);
      expect(refund.currency).toBeDefined();
      expect(refund.status).toBeDefined();
      await paymentRepository.populateRefunds(payment);
      expect(payment.refundedAmount).toBe(amount * 2);
    });
    it('need a payment', async () => {
      const amount = refundAmount(randomNumber(1, 50));
      const refund = await repository.create({ amount });
      await expect(() => repository.send(refund)).rejects.toThrow();
    });
    it('need an amount', async () => {
      const refund = await repository.create({ payment: payment.id });
      await expect(() => repository.send(refund)).rejects.toThrow();
    });
  });
  describe('refund other verbs', async () => {
    const payment = await paymentRepository.create();
    payment.setCard(idCard('card_Y2QKuArL3x7A18OjLZdSizoI'));
    payment.setAmount(1000);
    payment.setCurrency('eur');
    await paymentRepository.send(payment);
    const repository = new RefundRepository();
    it('cannot patch', async () => {
      const amount = refundAmount(randomNumber(1, 50));
      const refund = await repository.create({ amount, payment: payment.id });
      await repository.send(refund);
      refund.setAmount(refundAmount(200));

      await expect(async () => await repository.send(refund)).rejects.toThrow();
    });
    it('cannot delete', async () => {
      const amount = refundAmount(randomNumber(1, 50));
      const refund = await repository.create({ amount, payment: payment.id });
      await repository.send(refund);
      await expect(async () => await repository.delete(refund)).rejects.toThrow();
    });
    it('list', async () => {
      const expectedCount = 3;
      const refunds = repository.list({ limit: expectedCount });
      let length = 0;
      for await (const item of refunds) {
        expect(item).toBeInstanceOf(RefundModel);
        expect(item.amount).toBeDefined();
        expect(item.currency).toEqual('eur');
        length++;
        if (length > expectedCount) {
          return;
        }
      }
      expect(length).toBe(expectedCount);
    });
    it('get', async () => {
      const id = idRefund('refd_07vi5SIqsierzO8nuaOFBX7v');
      const refund = await repository.create(id);
      expect(refund.id).toBe(id);
      expect(refund.amount).toBe(44);
      expect(refund.currency).toBe('eur');
      expect(refund.createdAt).toStrictEqual(Temporal.Instant.fromEpochMilliseconds(1788350401 * 1000));
      expect(refund.payment).toBe('paym_tGY2hPlbr33GDEnfC0ZyQA92');
      expect(refund.status).toBe('to_refund');
    });
    it('get a 404', async () => {
      const id = `refd_${randomString(24)}`;
      await expect(() => repository.create(id)).rejects.toThrow();
    });
  });
});
