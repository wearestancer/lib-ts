import { describe, expect, it, vi } from 'vitest';

import { AbstractRepository } from '#core/abstract-repository.js';
import { StancerError } from '#error/base-error.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import { PaymentIntentApiEndpoint } from '#payment-intent/api-endpoint.js';
import { IdPaymentIntent, PaymentIntentModel, idPaymentIntent } from '#payment-intent/model.js';
import { PaymentIntentRepository } from '#payment-intent/repository.js';
import { PaymentIntentValidator } from '#payment-intent/validator.js';
import { paymentAmount } from '#payment/model.js';
import { RefundModel, refundAmount } from '#refund/model.js';
import { randomNumber, randomString } from '#test/test-helper.js';

import { listResource as listRefund, endpointResourceDeserialized as refundDeserialized } from '../refund/fixtures.js';
import { creationResource, endpointResource, listResource } from './fixtures.js';

const idPrefix = 'pi';
const id = idPaymentIntent(`${idPrefix}_${randomString(24)}`);
const stancerErrorID = idPaymentIntent(`${idPrefix}_unidentifiedError${randomString(7)}`);
const stancerRouteInaccessibleId = idPaymentIntent(`${idPrefix}_StancerRouteInnacessible`);
const dataHasBeenSentId = idPaymentIntent(`${idPrefix}_DataHasBeenSent${randomString(9)}`);
const dataUnmodified = idPaymentIntent(`${idPrefix}_unmodifiedData${randomString(10)}`);
const emptyRefund = idPaymentIntent(`${idPrefix}_emptyRefund${randomString(13)}`);
const refundId = idPaymentIntent(`${idPrefix}_refundedPaymentIntent${randomString(3)}`);

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

  refunds(id: IdPaymentIntent) {
    if (id === emptyRefund) {
      return [];
    }
    if (id === refundId) {
      listRefund.push({ ...refundDeserialized, amount: refundingAmount });
    }
    return listRefund.map((value) => new RefundModel({}, value));
  }

  refund() {
    return { ...creationResource, id: id };
  }
}

it('can be instanciated', () => {
  const instance = new PaymentIntentRepository();
  expect(instance).toBeInstanceOf(PaymentIntentRepository);
  expect(instance).toBeInstanceOf(AbstractRepository);
  //accessing private method & property
  expect(instance.endpoint).toBeInstanceOf(PaymentIntentApiEndpoint);
  expect(instance.validator).toBe(PaymentIntentValidator);
  expect(instance.staticModel).toBe(PaymentIntentModel);
});

describe('repository', () => {
  const mockRepo = new MockApiEndpoint() as unknown as PaymentIntentApiEndpoint; // I lie, for convenience sake
  const repository = new PaymentIntentRepository(mockRepo);

  describe('create', () => {
    it("doesn't accept bad data", async () => {
      const badID = randomString(30, 56);
      // using puposefuly bad ID
      await expect(async () => await repository.create(badID)).rejects.toThrow();
    });

    it('accept good data', async () => {
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(PaymentIntentModel);
    });
  });

  it('delete', async () => {
    const modelWithoutId = await repository.create();
    await expect(() => repository.delete(modelWithoutId)).rejects.toThrow();
    const model = await repository.create({ ...creationResource, id: idPaymentIntent(endpointResource.id) });
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
      const model = await repository.create({ ...creationResource, id: stancerErrorID as IdPaymentIntent });
      await expect(() => repository.send(model)).rejects.toThrow(StancerError);
    });

    it('should return error on StancerRouteInacessibleError', async () => {
      const model = await repository.create({ ...creationResource, id: stancerRouteInaccessibleId as IdPaymentIntent });
      await expect(async () => await repository.send(model)).rejects.toThrow(StancerRouteInaccessibleError);
    });

    it('should return unmodified model when no new Data', async () => {
      const model = await repository.create({ ...creationResource, id: dataUnmodified as IdPaymentIntent });
      const sentModel = await repository.send(model);
      expect(model).toStrictEqual(sentModel);
      expect(sentModel._data.id).toEqual(dataUnmodified);
    });
  });

  describe('populate', () => {
    it('should not modify model if no Id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(creationResource);
      expect(model).toBeInstanceOf(PaymentIntentModel);
      expect(getEndpoint).toHaveBeenCalledTimes(0);
    });

    it('should get model if only id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(PaymentIntentModel);
      expect(getEndpoint).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', () => {
    it('return correct model one by one', async () => {
      const listStub = repository.list();
      const item1 = await listStub.next();
      expect(item1.done).toBeFalsy();
      expect(item1.value).toHaveProperty('id');
      expect(item1.value).toBeInstanceOf(PaymentIntentModel);
      expect((item1.value as PaymentIntentModel).orderId).toBe('firstResource');

      const item2 = await listStub.next();
      expect(item2.done).toBeFalsy();
      expect(item2.value).toHaveProperty('id');
      expect(item2.value).toBeInstanceOf(PaymentIntentModel);

      expect((item2.value as PaymentIntentModel).orderId).toBe('secondResource');

      const item3 = await listStub.next();
      expect(item3.done).toBeFalsy();
      expect(item3.value).toHaveProperty('id');
      expect(item3.value).toBeInstanceOf(PaymentIntentModel);
      expect((item3.value as PaymentIntentModel).orderId).toBe('thirdResource');

      const item4 = await listStub.next();
      expect(item4.done).toBeTruthy();
    });
  });

  describe('list paymentintent refunds', () => {
    it('not populated paymentintent cannot get refund', async () => {
      const paymentintent = await repository.create({ amount: paymentAmount(100), currency: 'eur' });
      await expect(() => repository.getRefunds(paymentintent)).rejects.toThrow(
        'PaymentIntent must be populated before calling getRefunds method',
      );
    });

    it('populate empty array when no refund', async () => {
      const paymentintent = await repository.create(emptyRefund);
      paymentintent._id = emptyRefund;

      await expect(repository.getRefunds(paymentintent)).resolves.toStrictEqual([]);
      expect(paymentintent.refunds).toEqual([]);
      expect(paymentintent.isRefundPopulated()).toEqual(true);
      expect(paymentintent.refundedAmount).toEqual(0);
    });

    it('populate refund array', async () => {
      const paymentintent = await repository.create(id);

      await expect(repository.getRefunds(paymentintent));
      expect(paymentintent.refunds).toHaveLength(3);
      expect(paymentintent.isRefundPopulated()).toEqual(true);
      expect(paymentintent.refundedAmount).toEqual(150);
    });
  });

  describe('refund the paymentintent', () => {
    it('cannot refund if not populated', async () => {
      const paymentintent = await repository.create({ amount: paymentAmount(100), currency: 'eur' });
      await expect(() => repository.refund(paymentintent, refundAmount(50))).rejects.toThrow(
        'PaymentIntent must be populated before calling refund method',
      );
    });

    it('cannot do partial refund if not captured', async () => {
      const paymentintent = await repository.create(id);
      paymentintent._data.status = 'processing';
      await expect(() => repository.refund(paymentintent, refundAmount(50))).rejects.toThrow(
        "You cannot partially refund a payment intent that isn't captured",
      );
    });

    it('cannot refund more than paid', async () => {
      const paymentintent = await repository.create(id);
      expect(paymentintent.amount).toBeDefined();
      expect(paymentintent.id).toBeDefined();
      paymentintent._data.status = 'captured';
      await repository.getRefunds(paymentintent);
      expect(paymentintent.amount).toBeDefined();
      if (paymentintent.amount === undefined) {
        throw Error('unacessible error');
      }
      const refundingAmount = paymentintent.amount + randomNumber(1, 100);
      await expect(() => repository.refund(paymentintent, refundAmount(refundingAmount))).rejects.toThrow(
        `You are trying to refund ${refundingAmount} it's ${refundingAmount - paymentintent.refundableAmount} more than possible ${paymentintent.refundableAmount}.`,
      );
    });

    it('cannot refund more than paid minus already refunded', async () => {
      const paymentintent = await repository.create(id);
      paymentintent._data.status = 'captured';
      expect(paymentintent.amount).toBeDefined();
      expect(paymentintent.id).toBeDefined();
      expect(await repository.getRefunds(paymentintent));
      const refundingAmount = paymentintent.refundableAmount + randomNumber(1, 100);
      await expect(() => repository.refund(paymentintent, refundAmount(refundingAmount))).rejects.toThrow(
        `You are trying to refund ${refundingAmount} it's ${refundingAmount - paymentintent.refundableAmount} more than possible ${paymentintent.refundableAmount}.`,
      );
    });

    //with the mocker it is really hard to add a new refund to the refund list
    it('refund when number is correct', async () => {
      const paymentintent = await repository.create(id);
      expect(paymentintent.amount).toBeDefined();
      expect(paymentintent.id).toBeDefined();
      expect(await repository.getRefunds(paymentintent));
      paymentintent._id = idPaymentIntent(refundId);
      paymentintent._data.status = 'captured';
      expect(paymentintent.amount).toBeGreaterThan(paymentintent.refundableAmount);
      const refundableAmount = paymentintent.refundableAmount;
      const refundingAmount = refundAmount(randomNumber(1, refundableAmount));
      await expect(repository.refund(paymentintent, refundAmount(refundingAmount))).resolves.toEqual(paymentintent);
    });
  });
});
