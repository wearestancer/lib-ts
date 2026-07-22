import { describe, expect, it, vi } from 'vitest';

import { IdValue } from '#core/common/branded-type.js';
import { trackObjectMutations } from '#core/common/mutation-tracked-object.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
import { stubDeserialized, stubSerialized } from '#test/fixtures/endpoint.stub.js';
import { StubEndpoint } from '#test/stub/stub-endpoint.js';
import { randomString } from '#test/test-helper.js';

vi.mock('#api/http/http.js', async (importHTTP) => {
  const original: Record<string, Promise<unknown>> = await importHTTP();
  return {
    ...original,
    transformResponseToData: vi.fn((value) => value.json()),
  };
});

vi.mock('#api/http/fetch-http-client.js', () => {
  return {
    httpClient: {
      makeRequest: vi.fn(() => {
        return Promise.resolve({
          status: 200,
          json: () => {
            return {
              ...stubSerialized,
            };
          },
        });
      }),
    },
  };
});

describe('endpoint object', () => {
  describe('handle resources', () => {
    const endpoint = new StubEndpoint();

    describe('deserialize resource', async () => {
      const deserializedResources = await endpoint.deserializeResource(stubSerialized);

      it('id', () => {
        expect(deserializedResources.id).toEqual(stubDeserialized.id);
      });

      it('default', () => {
        expect(deserializedResources.default).toEqual(stubDeserialized.default);
      });

      it('defaultNumber', () => {
        expect(deserializedResources.defaultNumber).toEqual(stubDeserialized.defaultNumber);
      });

      it('untouchable', () => {
        expect(Object.hasOwn(deserializedResources, 'untouchable')).toBeFalsy();
      });

      it('allAuthorized', () => {
        expect(Object.hasOwn(deserializedResources, 'allAuthorized')).toBeTruthy();
        expect(deserializedResources.allAuthorized).toBeTruthy();
      });

      it('ungettable', () => {
        expect(Object.hasOwn(deserializedResources, 'ungettable')).toBeFalsy();
      });

      it('unmodifiable', () => {
        expect(Object.hasOwn(deserializedResources, 'unmodifiable')).toBeTruthy();
        expect(deserializedResources.unmodifiable).toBeFalsy();
      });

      const getResourceviaConfig = await endpoint.config.deserializeResource(stubSerialized);
      expect(getResourceviaConfig).toStrictEqual(stubDeserialized);
    });

    describe('serialize for post', () => {
      const endpoint = new StubEndpoint();
      const postContent = { ...stubDeserialized, ungettable: true };
      const postedResource = endpoint.postObjectSerializer(postContent);

      it('id', () => {
        expect(postedResource.id).toBeUndefined();
      });

      it('default', () => {
        expect(postedResource.default).toEqual(stubSerialized.default);
      });

      it('defaultNumber', () => {
        expect(postedResource.default_number).toEqual(stubDeserialized.defaultNumber);
      });

      it('untouchable', () => {
        expect(Object.hasOwn(postedResource, 'untouchable')).toBeFalsy();
      });

      it('allAuthorized', () => {
        expect(Object.hasOwn(postedResource, 'all_authorized')).toBeTruthy();
        expect(postedResource.all_authorized).toBeTruthy();
      });

      it('ungettable', () => {
        expect(Object.hasOwn(postedResource, 'ungettable')).toBeTruthy();
        expect(postedResource.ungettable).toBeTruthy();
      });

      it('unmodifiable', () => {
        expect(Object.hasOwn(postedResource, 'unmodifiable')).toBeFalsy();
      });
      const postedResourceviaConfig = endpoint.config.postObjectSerializer(postContent);
      expect(postedResourceviaConfig).toStrictEqual(postedResource);
    });

    describe('serialize for patch', () => {
      const postedResource = endpoint.patchObjectSerializer({ ...stubDeserialized, ungettable: true });

      it('does not patch id', () => {
        expect(postedResource.id).toBeUndefined();
      });

      it('default', () => {
        expect(postedResource.default).toEqual(stubSerialized.default);
      });

      it('defaultNumber', () => {
        expect(postedResource.defaultNumber).toEqual(stubSerialized.defaultNumber);
      });

      it('untouchable', () => {
        expect(Object.hasOwn(postedResource, 'untouchable')).toBeFalsy();
      });

      it('allAuthorized', () => {
        expect(Object.hasOwn(postedResource, 'all_authorized')).toBeTruthy();
        expect(postedResource.all_authorized).toBeTruthy();
      });

      it('ungettable', () => {
        expect(Object.hasOwn(postedResource, 'ungettable')).toBeTruthy();
        expect(postedResource.ungettable).toBeTruthy();
      });

      it('unmodifiable', () => {
        expect(Object.hasOwn(postedResource, 'unmodifiable')).toBeFalsy();
      });

      const postedResourceviaConfig = endpoint.config.patchObjectSerializer({ ...stubDeserialized, ungettable: true }); // we don't really care for the type
      expect(postedResourceviaConfig).toStrictEqual(postedResource);
    });
  });

  it('have an endpoint url', () => {
    const endpoint = new StubEndpoint();
    const id = IdValue('stub_' + randomString(24, 24));
    expect(endpoint.endpointUrl(id)).toStrictEqual(`https://api.stancer.com/v2/stubs/${id}`);
    expect(endpoint.endpointUrl()).toStrictEqual('https://api.stancer.com/v2/stubs/');
  });

  describe('Action verbs', async () => {
    it('get', async () => {
      const endpoint = new StubEndpoint();
      const responseWithId = await endpoint.get(IdValue('stub_' + randomString(24)));
      expect(responseWithId).toStrictEqual({
        allAuthorized: true,
        default: stubDeserialized.default,
        defaultNumber: stubDeserialized.defaultNumber,
        id: stubDeserialized.id,
        unmodifiable: stubDeserialized.unmodifiable,
      });
    });

    it('post', async () => {
      const postableEndpoint = new StubEndpoint();
      const response = await postableEndpoint.post(stubSerialized);
      expect(response).toStrictEqual(stubDeserialized);
      const unpostableEndpoint = new StubEndpoint({ postable: false });
      expect(() => unpostableEndpoint.post(stubSerialized)).toThrow('POST is not allowed for stubs resource');
    });

    it('patch', async () => {
      const patchableEndpoint = new StubEndpoint();
      const response = await patchableEndpoint.patch(stubSerialized.id, stubSerialized);
      expect(response).toStrictEqual(stubDeserialized);
      const unpatchableEndpoint = new StubEndpoint({ patchable: false });
      expect(() => unpatchableEndpoint.patch(stubSerialized.id, stubSerialized)).toThrow(
        'PATCH is not allowed for stubs resource',
      );
    });

    it('delete', async () => {
      const endpoint = new StubEndpoint();
      const responseWithId = await endpoint.delete(stubSerialized.id);
      expect(responseWithId).toStrictEqual({
        allAuthorized: true,
        default: stubSerialized.default,
        defaultNumber: stubDeserialized.defaultNumber,
        id: stubSerialized.id,
        unmodifiable: stubSerialized.unmodifiable,
      });
      const undeletableEndpoint = new StubEndpoint({ deletable: false });
      expect(() => undeletableEndpoint.delete(stubSerialized.id)).toThrow('DELETE is not allowed for stubs resource');
    });

    describe('send', () => {
      it("cannot send if it has no id and it isn't postable", async () => {
        const endpoint = new StubEndpoint({ postable: false });
        const mutationsData = trackObjectMutations({}, () => true);
        mutationsData['default'] = 'stub_' + randomString(24);
        expect(() => endpoint.send(undefined, mutationsData)).toThrow(StancerRouteInaccessibleError);
      });

      it('can patch if id', () => {
        const endpoint = new StubEndpoint();
        const spyonPatch = vi.spyOn(endpoint, 'patch');
        const spyonPost = vi.spyOn(endpoint, 'post');
        const mutationsData = trackObjectMutations({}, () => true);
        mutationsData['id'] = 'stub_' + randomString(24);
        mutationsData['defaultNumber'] = 12;
        endpoint.send(mutationsData['id'], mutationsData.getMutations());
        expect(spyonPatch).toHaveBeenCalledOnce();
        expect(spyonPost).toHaveBeenCalledTimes(0);
      });

      it('can post if no id', () => {
        const endpoint = new StubEndpoint();
        const spyonPatch = vi.spyOn(endpoint, 'patch');
        const spyonPost = vi.spyOn(endpoint, 'post');
        const mutationsData = trackObjectMutations({}, () => true);
        mutationsData['default'] = randomString(24);
        endpoint.send(undefined, mutationsData);
        expect(spyonPatch).toHaveBeenCalledTimes(0);
        expect(spyonPost).toHaveBeenCalledTimes(1);
      });
    });
  });
});
