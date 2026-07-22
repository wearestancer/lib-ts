import { describe, expect, it, vi } from 'vitest';

import { StancerError } from '#core/error/base-error.js';
import { stubSerialized } from '#test/fixtures/endpoint.stub.js';
import { StubEndpoint } from '#test/stub/stub-endpoint.js';
import { StubRepository } from '#test/stub/stub-repository.js';
import { randomString } from '#test/test-helper.js';

vi.mock('#api/http/fetch-http-client.js', () => {
  return {
    httpClient: {
      makeRequest: vi.fn(() => {
        return Promise.resolve({
          status: 200,
          json: () => {
            return {
              ...stubSerialized,
            } as Record<string, unknown>;
          },
        });
      }),
    },
  };
});
describe('stub', () => {
  describe('send', () => {
    it("doesn't resend previously sent object construction", async () => {
      const endpoint = new StubEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      const defaultValue = randomString(12);
      const repository = new StubRepository(endpoint);
      const model = await repository.create({ default: defaultValue, allAuthorized: true });
      expect(model.mutations).toStrictEqual({ default: defaultValue, allAuthorized: true });

      await repository.send(model);
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);

      expect(model.mutations).toStrictEqual({});
      await expect(() => repository.send(model)).rejects.toThrow(StancerError);

      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
    it("doesn't resend previously sent object setting", async () => {
      const endpoint = new StubEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      const defaultValue = randomString(12);
      const repository = new StubRepository(endpoint);
      const model = await repository.create();
      model.setDefault(defaultValue);
      expect(model.mutations).toStrictEqual({ default: defaultValue });

      await repository.send(model);
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
      expect(model.mutations).toStrictEqual({});

      await expect(() => repository.send(model)).rejects.toThrow(StancerError);
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
  it("doesn't repatch", async () => {
    const endpoint = new StubEndpoint();
    const spyonPatch = vi.spyOn(endpoint, 'patch');
    const spyonPost = vi.spyOn(endpoint, 'post');
    const id = 'stub_' + randomString(24);
    const repository = new StubRepository(endpoint);
    const model = await repository.create(id);
    model.setAllAuthorized(true);
    expect(model.mutations).toStrictEqual({});

    model.setAllAuthorized(false);
    expect(model.mutations).toStrictEqual({ allAuthorized: false });

    await repository.send(model);
    expect(spyonPatch).toHaveBeenCalledOnce();
    expect(spyonPost).toHaveBeenCalledTimes(0);

    expect(model.mutations).toStrictEqual({});
    await expect(() => repository.send(model)).rejects.toThrow(StancerError);
    expect(spyonPatch).toHaveBeenCalledOnce();
    expect(spyonPost).toHaveBeenCalledTimes(0);
  });
});
