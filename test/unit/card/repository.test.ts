import { describe, expect, it, vi } from 'vitest';

import { CardApiEndpoint } from '#card/api-endpoint.js';
import { CardModel, IdCard } from '#card/model.js';
import { CardRepository } from '#card/repository.js';
import { cardValidator } from '#card/validator.js';
import { AbstractRepository } from '#core/abstract-repository.js';
import { StancerError } from '#error/base-error.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import { randomString } from '#test/test-helper.js';

import { creationResource, endpointResource, listResource } from './fixtures.js';

const idPrefix = 'card';
const id = `${idPrefix}_${randomString(24)}` as IdCard;
const stancerErrorID = `${idPrefix}_unidentifiedError${randomString(7)}`;
const stancerRouteInaccessibleId = `${idPrefix}_StancerRouteInnacessible`;
const dataHasBeenSentId = `${idPrefix}_DataHasBeenSent${randomString(9)}`;
const dataUnmodified = `${idPrefix}_unmodifiedData${randomString(10)}`;
class MockApiEndpoint {
  constructor() {}
  list() {
    async function* listGenerator() {
      yield* listResource;
    }
    return listGenerator();
  }
  delete() {
    return endpointResource;
  }
  send(id, data: Record<string, unknown>) {
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
    return endpointResource;
  }
}

it('can be instanciated', () => {
  const instance = new CardRepository();
  expect(instance).toBeInstanceOf(CardRepository);
  expect(instance).toBeInstanceOf(AbstractRepository);
  //accessing private method & property
  expect(instance.endpoint).toBeInstanceOf(CardApiEndpoint);
  expect(instance.validator).toBe(cardValidator);
  expect(instance.staticModel).toBe(CardModel);
});

describe('repository', () => {
  const mockRepo = new MockApiEndpoint() as unknown as CardApiEndpoint; // I lie, for convenience sake
  const repository = new CardRepository(mockRepo);

  describe('create', () => {
    it("doesn't accept bad data", async () => {
      const badID = randomString(30, 56);
      // using puposefuly bad ID
      await expect(async () => await repository.create(badID)).rejects.toThrow();
    });

    it('accept good data', async () => {
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(CardModel);
    });
  });

  it('delete', async () => {
    const modelWithoutId = await repository.create();
    await expect(() => repository.delete(modelWithoutId)).rejects.toThrow();

    const model = await repository.create({ id: endpointResource.id, ...creationResource });
    await expect((await repository.delete(model))._data).toStrictEqual(endpointResource);
  });

  describe('send', () => {
    it('should return model', async () => {
      const model = await repository.create(creationResource);
      const sentModel = await repository.send(model);
      expect(sentModel).toStrictEqual(model);
      expect(sentModel._data.id).toEqual(dataHasBeenSentId);
    });

    it('should throw on inprecise error', async () => {
      const model = await repository.create({ ...creationResource, id: stancerErrorID as IdCard });
      await expect(() => repository.send(model)).rejects.toThrow(StancerError);
    });

    it('should return error on StancerRouteInacessibleError', async () => {
      const model = await repository.create({ ...creationResource, id: stancerRouteInaccessibleId as IdCard });
      await expect(async () => await repository.send(model)).rejects.toThrow(StancerRouteInaccessibleError);
    });

    it('should return unmodified model when no new Data', async () => {
      const model = await repository.create({ ...creationResource, id: dataUnmodified as IdCard });
      const sentModel = await repository.send(model);
      expect(model).toStrictEqual(sentModel);
      expect(sentModel._data.id).toEqual(dataUnmodified);
    });
  });

  describe('populate', () => {
    it('should not modify model if no Id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(creationResource);
      expect(model).toBeInstanceOf(CardModel);
      expect(getEndpoint).toHaveBeenCalledTimes(0);
    });

    it('should get model if only id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(CardModel);
      expect(getEndpoint).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', async () => {
    it('return correct model one by one', async () => {
      const listStub = repository.list();
      const item1 = await listStub.next();
      expect(item1.done).toBeFalsy();
      expect(item1.value).toHaveProperty('id');
      expect(item1.value).toBeInstanceOf(CardModel);
      expect(item1.value.name).toBe('item1');

      const item2 = await listStub.next();
      expect(item2.done).toBeFalsy();
      expect(item2.value).toHaveProperty('id');
      expect(item2.value).toBeInstanceOf(CardModel);
      expect(item2.value.name).toBe('item2');

      const item3 = await listStub.next();
      expect(item3.done).toBeTruthy();
    });
  });
});
