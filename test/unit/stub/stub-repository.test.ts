import { describe, expect, it, vi } from 'vitest';

import { AbstractRepository } from '#core/abstract-repository.js';
import { IdValue } from '#core/common/branded-type.js';
import { StancerError } from '#error/base-error.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import ListModelFixtures from '#test/fixtures/list-model.stub.js';
import ModelFixtures from '#test/fixtures/model.stub.js';
import { StubEndpoint } from '#test/stub/stub-endpoint.js';
import { IdStub, StubModel, StubValidator } from '#test/stub/stub-model.js';
import { StubRepository } from '#test/stub/stub-repository.js';
import { randomNumber, randomString } from '#test/test-helper.js';

const stancerErrorID = 'stub_unidentifiedError' + randomString(7);
const stancerRouteInaccessibleId = 'stub_StancerRouteInnacessible';
const dataHasBeenSentId = 'stub_DataHasBeenSent' + randomString(9);
const dataUnmodified = 'stub_unmodifiedData' + randomString(10);
class MockApiEndpoint {
  constructor() {}
  list() {
    async function* listGenerator() {
      yield* ListModelFixtures;
    }
    return listGenerator();
  }
  delete() {
    return ModelFixtures;
  }
  send(id: IdValue, data: Record<string, unknown>) {
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
    return ModelFixtures;
  }
}
it('can be instanciated', () => {
  const instance = new StubRepository();
  expect(instance).toBeInstanceOf(StubRepository);
  expect(instance).toBeInstanceOf(AbstractRepository);
  expect(instance.endpoint).toBeInstanceOf(StubEndpoint);
  expect(instance.validator).toBe(StubValidator);
  expect(instance.staticModel).toBe(StubModel);
});

describe('repository', () => {
  const mockRepo = new MockApiEndpoint() as unknown as StubEndpoint; // I lie, for convenience sake
  const repository = new StubRepository(mockRepo);

  describe('create', () => {
    it("doesn't accept bad data", async () => {
      const badID = randomString(30, 56);
      await expect(async () => await repository.create(badID)).rejects.toThrow();
      const badID2 = randomNumber(1, 12);
      await expect(async () => await repository.create(badID2)).rejects.toThrow();
      const badData = { default: randomNumber(1, 12) };
      await expect(async () => await repository.create(badData)).rejects.toThrow();
    });

    it('accept good data', async () => {
      const id = 'stub_' + randomString(24);
      const model = await repository.create(id);
      expect(model).toBeInstanceOf(StubModel);
    });
  });

  it('delete', async () => {
    const modelWithoutId = await repository.create(ModelFixtures);
    await expect(() => repository.delete(modelWithoutId)).rejects.toThrow();

    const model = await repository.create({ ...ModelFixtures, id: ('stub_' + randomString(24)) as IdStub });
    await expect((await repository.delete(model))._data).toStrictEqual(ModelFixtures);
  });

  describe('send', () => {
    it('should return model', async () => {
      const model = await repository.create(ModelFixtures);
      const sentModel = await repository.send(model);
      expect(sentModel).toStrictEqual(model);
      expect(sentModel._data.id).toEqual(dataHasBeenSentId);
    });

    it('should throw on inprecise error', async () => {
      const model = await repository.create({ ...ModelFixtures, id: stancerErrorID as IdStub });
      await expect(() => repository.send(model)).rejects.toThrow(StancerError);
    });

    it('should return error on StancerRouteInacessibleError', async () => {
      const model = await repository.create({ ...ModelFixtures, id: stancerRouteInaccessibleId as IdStub });
      await expect(async () => await repository.send(model)).rejects.toThrow(StancerRouteInaccessibleError);
    });

    it('should return unmodified model when no new Data', async () => {
      const model = await repository.create({ ...ModelFixtures, id: dataUnmodified as IdStub });
      const sentModel = await repository.send(model);
      expect(model).toStrictEqual(sentModel);
      expect(sentModel._data.id).toEqual(dataUnmodified);
    });
  });

  describe('populate', () => {
    it('should not modify model if no Id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(ModelFixtures);
      expect(model).toBeInstanceOf(StubModel);
      expect(getEndpoint).toHaveBeenCalledTimes(0);
    });

    it('should get model if only id', async () => {
      const getEndpoint = vi.spyOn(mockRepo, 'get');
      const model = await repository.create(('stub_' + randomString(24)) as IdStub);
      expect(model).toBeInstanceOf(StubModel);
      expect(getEndpoint).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', async () => {
    it('return correct model one by one', async () => {
      const listStub = repository.list();
      const item1 = await listStub.next();
      expect(item1.done).toBeFalsy();
      expect(item1.value).toHaveProperty('id');
      expect(item1.value).toBeInstanceOf(StubModel);

      const item2 = await listStub.next();
      expect(item2.done).toBeFalsy();
      expect(item2.value).toHaveProperty('id');
      expect(item2.value).toBeInstanceOf(StubModel);

      const item3 = await listStub.next();
      expect(item3.done).toBeTruthy();
    });
  });
});
