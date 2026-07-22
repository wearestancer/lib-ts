import { describe, expect, it, vi } from 'vitest';

import { AddressApiEndpoint } from '#address/api-endpoint.js';
import { AddressModel, IdAddress } from '#address/model.js';
import { AddressRepository } from '#address/repository.js';
import { addressValidator } from '#address/validator.js';
import { AbstractRepository } from '#core/abstract-repository.js';
import { StancerError } from '#error/base-error.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import { randomString } from '#test/test-helper.js';

import { creationResource, endpointResource, listResource } from './fixtures.js';

const idPrefix = 'addr';
const id = `${idPrefix}_${randomString(24)}` as IdAddress;
const stancerErrorID = `${idPrefix}_unidentifiedError${randomString(7)}`;
const stancerRouteInaccessibleId = `${idPrefix}_StancerRouteInnacessible` as string;
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

  send(id: IdAddress, data: Record<string, unknown>) {
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
  const instance = new AddressRepository();
  expect(instance).toBeInstanceOf(AddressRepository);
  expect(instance).toBeInstanceOf(AbstractRepository);
  //accessing private method & property
  expect(instance.endpoint).toBeInstanceOf(AddressApiEndpoint);
  expect(instance.validator).toBe(addressValidator);
  expect(instance.staticModel).toBe(AddressModel);
});

describe('repository', () => {
  const mockRepo = new MockApiEndpoint() as unknown as AddressApiEndpoint; // I lie, for convenience sake
  const repository = new AddressRepository(mockRepo);

  describe('create', () => {
    it("doesn't accept bad data", async () => {
      const badID = randomString(30, 56);
      // using puposefuly bad ID
      await expect(async () => await repository.create(badID)).rejects.toThrow();
    });

    it('accept good data', async () => {
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(AddressModel);
    });
  });

  it('delete', async () => {
    const modelWithoutId = await repository.create();
    await expect(() => repository.delete(modelWithoutId)).rejects.toThrow();
    const zip_code = endpointResource.zip_code;
    const model = await repository.create({ id: endpointResource.id, zip_code });
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
      const model = await repository.create({ ...creationResource, id: stancerErrorID as IdAddress });
      await expect(() => repository.send(model)).rejects.toThrow(StancerError);
    });

    it('should return error on StancerRouteInacessibleError', async () => {
      const model = await repository.create({ ...creationResource, id: stancerRouteInaccessibleId as IdAddress });
      expect(async () => await repository.send(model)).rejects.toThrow(StancerRouteInaccessibleError);
    });

    it('should return unmodified model when no new Data', async () => {
      const model = await repository.create({ ...creationResource, id: dataUnmodified as IdAddress });
      const sentModel = await repository.send(model);
      expect(model).toStrictEqual(sentModel);
      expect(sentModel._data.id).toEqual(dataUnmodified);
    });
  });

  describe('populate', () => {
    it('should not modify model if no Id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(creationResource);
      expect(model).toBeInstanceOf(AddressModel);
      expect(getEndpoint).toHaveBeenCalledTimes(0);
    });

    it('should get model if only id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(AddressModel);
      expect(getEndpoint).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', async () => {
    it('return correct model one by one', async () => {
      const listStub = repository.list();
      const item1 = await listStub.next();
      expect(item1.done).toBeFalsy();
      expect(item1.value).toHaveProperty('id');
      expect(item1.value).toBeInstanceOf(AddressModel);

      const item2 = await listStub.next();
      expect(item2.done).toBeFalsy();
      expect(item2.value).toHaveProperty('id');
      expect(item2.value).toBeInstanceOf(AddressModel);

      const item3 = await listStub.next();
      expect(item3.done).toBeTruthy();
    });
  });
});
