import { describe, expect, it, vi } from 'vitest';

import { AbstractRepository } from '#core/abstract-repository.js';
import { StancerError } from '#error/base-error.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import { PaymentApiEndpoint } from '#payment/api-endpoint.js';
import { IdPayment, PaymentModel, idPayment, paymentAmount } from '#payment/model.js';
import { PaymentRepository } from '#payment/repository.js';
import { paymentValidator } from '#payment/validator.js';
import { RefundModel, refundAmount } from '#refund/model.js';
import { RefundRepository } from '#refund/repository.js';
import { randomNumber, randomString } from '#test/test-helper.js';

import { listResource as listRefund, endpointResourceDeserialized as refundDeserialized } from '../refund/fixtures.js';
import { creationResource, endpointResource, listResource } from './fixtures.js';

const idPrefix = 'paym';
const id = idPayment(`${idPrefix}_${randomString(24)}`);
const stancerErrorID = idPayment(`${idPrefix}_unidentifiedError${randomString(7)}`);
const stancerRouteInaccessibleId = idPayment(`${idPrefix}_StancerRouteInnacessible`);
const dataHasBeenSentId = idPayment(`${idPrefix}_DataHasBeenSent${randomString(9)}`);
const dataUnmodified = idPayment(`${idPrefix}_unmodifiedData${randomString(10)}`);
const emptyRefund = idPayment(`${idPrefix}_emptyRefund${randomString(13)}`);
const refundId = idPayment(`${idPrefix}_refundedPayment${randomString(9)}`);
let refundingAmount = refundAmount(0);

class MockApiEndpoint {
  constructor() {}

  list() {
    async function* listGenerator() {
      yield* listResource;
    }
    return listGenerator();
  }

  delete() {
    return creationResource;
  }

  send(id: string, data: Record<string, unknown>) {
    if (id) {
      if (id === stancerErrorID) {
        throw new StancerError();
      }
      if (id === stancerRouteInaccessibleId) {
        throw new StancerRouteInaccessibleError('PATCH', 'stub');
      }
      if (id === dataUnmodified) {
        return;
      }
    }
    return { ...data, id: dataHasBeenSentId };
  }

  get() {
    return { ...creationResource, id: id };
  }

  refunds(id: IdPayment) {
    if (id === emptyRefund) {
      return [];
    }
    if (id === refundId) {
      listRefund.push({ ...refundDeserialized, amount: refundingAmount });
    }
    return listRefund.map((value) => new RefundModel({}, value));
  }
}

it('can be instanciated', () => {
  const instance = new PaymentRepository();
  expect(instance).toBeInstanceOf(PaymentRepository);
  expect(instance).toBeInstanceOf(AbstractRepository);
  //accessing private method & property
  expect(instance.endpoint).toBeInstanceOf(PaymentApiEndpoint);
  expect(instance.validator).toBe(paymentValidator);
  expect(instance.staticModel).toBe(PaymentModel);
});

describe('repository', () => {
  const mockRepo = new MockApiEndpoint() as unknown as PaymentApiEndpoint; // I lie, for convenience sake
  const repository = new PaymentRepository(mockRepo);

  describe('create', () => {
    it("doesn't accept bad data", async () => {
      const badID = randomString(30, 56);
      // using puposefuly bad ID
      await expect(async () => await repository.create(badID)).rejects.toThrow();
    });

    it('accept good data', async () => {
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(PaymentModel);
    });
  });

  it('delete', async () => {
    const modelWithoutId = await repository.create();
    await expect(() => repository.delete(modelWithoutId)).rejects.toThrow();

    const model = await repository.create({ ...creationResource, id: idPayment(endpointResource.id) });
    await expect((await repository.delete(model))._data).toStrictEqual(creationResource);
  });

  describe('send', () => {
    it('should return model', async () => {
      const model = await repository.create(creationResource);
      const sentModel = await repository.send(model);
      expect(sentModel).toStrictEqual(model);
      expect(sentModel._data.id).toEqual(dataHasBeenSentId);
    });

    it('should throw on inprecise error', async () => {
      const model = await repository.create({ ...creationResource, id: stancerErrorID as IdPayment });
      await expect(() => repository.send(model)).rejects.toThrow(StancerError);
    });

    it('should return error on StancerRouteInacessibleError', async () => {
      const model = await repository.create({ ...creationResource, id: stancerRouteInaccessibleId as IdPayment });
      await expect(async () => await repository.send(model)).rejects.toThrow(StancerRouteInaccessibleError);
    });

    it('should return unmodified model when no new Data', async () => {
      const model = await repository.create({ ...creationResource, id: dataUnmodified as IdPayment });
      const sentModel = await repository.send(model);
      expect(model).toStrictEqual(sentModel);
      expect(sentModel._data.id).toEqual(dataUnmodified);
    });
  });

  describe('populate', () => {
    it('should not modify model if no Id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(creationResource);
      expect(model).toBeInstanceOf(PaymentModel);
      expect(getEndpoint).toHaveBeenCalledTimes(0);
    });

    it('should get model if only id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(PaymentModel);
      expect(getEndpoint).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', () => {
    it('return correct model one by one', async () => {
      const listStub = repository.list();

      const item1 = await listStub.next();
      expect(item1.done).toBeFalsy();
      expect(item1.value).toHaveProperty('id');
      expect(item1.value).toBeInstanceOf(PaymentModel);
      expect((item1.value as PaymentModel).uniqueId).toBe('firstResource');

      const item2 = await listStub.next();
      expect(item2.done).toBeFalsy();
      expect(item2.value).toHaveProperty('id');
      expect(item2.value).toBeInstanceOf(PaymentModel);
      expect((item2.value as PaymentModel).uniqueId).toBe('secondResource');

      const item3 = await listStub.next();
      expect(item3.done).toBeFalsy();
      expect(item3.value).toHaveProperty('id');
      expect(item3.value).toBeInstanceOf(PaymentModel);
      expect((item3.value as PaymentModel).uniqueId).toBe('thirdResource');

      const item4 = await listStub.next();
      expect(item4.done).toBeTruthy();
    });
  });

  describe('list payment refunds', () => {
    it('not populated payment cannot get refund', async () => {
      const payment = await repository.create({ amount: paymentAmount(100), currency: 'eur' });
      await expect(() => repository.populateRefunds(payment)).rejects.toThrow(
        'Payment must be populated before calling populateRefund method',
      );
    });

    it('populate empty array when no refund', async () => {
      const payment = await repository.create(emptyRefund);
      payment._id = emptyRefund;
      await expect(repository.populateRefunds(payment)).resolves.toStrictEqual(payment);
      expect(payment.refunds).toEqual([]);
      expect(payment.isRefundPopulated()).toEqual(true);
      expect(payment.refundedAmount).toEqual(0);
    });

    it('populate refund array', async () => {
      const payment = await repository.create(id);
      await expect(repository.populateRefunds(payment)).resolves.toStrictEqual(payment);
      expect(payment.refunds).toHaveLength(3);
      expect(payment.isRefundPopulated()).toEqual(true);
      expect(payment.refundedAmount).toEqual(150);
    });
  });

  describe('refund the payment', () => {
    it('cannot refund if not populated', async () => {
      const payment = await repository.create({ amount: paymentAmount(100), currency: 'eur' });
      await expect(() => repository.refund(payment, refundAmount(50))).rejects.toThrow(
        'Payment must be populated before calling refund method',
      );
    });

    it('cannot do partial refund if not captured', async () => {
      const payment = await repository.create(id);
      payment._data.status = 'to_capture';
      await expect(() => repository.refund(payment, refundAmount(50))).rejects.toThrow(
        `Partial refund is not allowed when payment is not captured.`,
      );
    });

    it('cannot refund more than paid', async () => {
      const payment = await repository.create(id);
      expect(payment.amount).toBeDefined();
      expect(payment.id).toBeDefined();
      payment._data.status = 'captured';
      await repository.populateRefunds(payment);
      expect(payment.amount).toBeDefined();
      if (payment.amount === undefined) {
        throw Error('unacessible error');
      }
      const refundingAmount = payment.amount + randomNumber(1, 100);
      await expect(() => repository.refund(payment, refundAmount(refundingAmount))).rejects.toThrow(
        `You are trying to refund ${refundingAmount}, which is ${refundingAmount - payment.refundableAmount} more than the refundable amount of ${payment.refundableAmount}.`,
      );
    });

    it('cannot refund more than paid minus already refunded', async () => {
      const payment = await repository.create(id);
      payment._data.status = 'captured';
      expect(payment.amount).toBeDefined();
      expect(payment.id).toBeDefined();
      expect(await repository.populateRefunds(payment)).toStrictEqual(payment);
      const refundingAmount = payment.refundableAmount + randomNumber(1, 100);
      await expect(() => repository.refund(payment, refundAmount(refundingAmount))).rejects.toThrow(
        `You are trying to refund ${refundingAmount}, which is ${refundingAmount - payment.refundableAmount} more than the refundable amount of ${payment.refundableAmount}.`,
      );
    });

    it('refund when number is correct', async () => {
      class MockApiRefundEndpoint {
        constructor() {}
        send(id: string, data: Record<string, unknown>) {
          return { ...data, id: `refd_${randomString(24)}` };
        }
      }

      const mockRefundRepository = new RefundRepository(new MockApiRefundEndpoint());
      const paymentRepository = new PaymentRepository(new MockApiEndpoint(), mockRefundRepository);
      const payment = await paymentRepository.create(id);
      expect(payment.amount).toBeDefined();
      expect(payment.id).toBeDefined();
      expect(await paymentRepository.populateRefunds(payment)).toStrictEqual(payment);
      payment._id = idPayment(refundId);
      payment._data.status = 'captured';

      const refundableAmount = payment.refundableAmount;
      const refundedAmount = payment.refundedAmount;
      refundingAmount = refundAmount(randomNumber(1, refundableAmount));
      await expect(paymentRepository.refund(payment, refundAmount(refundingAmount))).resolves.toStrictEqual(payment);
      expect(refundedAmount).toBe(payment.refundedAmount - refundingAmount);
      expect(refundableAmount).toBe(payment.refundableAmount + refundingAmount);
    });
  });
});
