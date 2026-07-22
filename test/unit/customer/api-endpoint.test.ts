import { describe, expect, it, vi } from 'vitest';

import { StancerError } from '#core/error/base-error.js';
import { CustomerApiEndpoint } from '#customer/api-endpoint.js';
import type { CustomerData, IdCustomer } from '#customer/model.js';
import { randomString } from '#test/test-helper.js';

import { endpointResource, endpointResourceDeserialized } from './fixtures.js';

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
              ...endpointResource,
            };
          },
        });
      }),
    },
  };
});

describe('customer api endpoint', () => {
  describe('Serialize/Deserialize resources', () => {
    const endpoint = new CustomerApiEndpoint();

    it('test deserialize resource', () => {
      const deserializedResources = endpoint.deserializeResource(endpointResource);
      //Double match to guaranty exact same shape
      expect(deserializedResources).toMatchObject(endpointResourceDeserialized);
      expect(endpointResourceDeserialized).toMatchObject(deserializedResources);
    });

    it('test post serialize resource', () => {
      const serializedResources = endpoint.postObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      // property not in postObject are API generated or not postable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deleted, created, id, ...postObject } = endpointResource;
      //Double match to guaranty exact same shape
      expect(serializedResources).toMatchObject(postObject);
      expect(postObject).toMatchObject(serializedResources);
    });

    it('test patch serialize resource (not available in repository)', () => {
      const serializedResources = endpoint.patchObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      // property not in patchObject are API generated or not patchable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deleted, created, id, ...patchObject } = endpointResource;
      //Double match to guaranty exact same shape
      expect(serializedResources).toMatchObject(patchObject);
      expect(patchObject).toMatchObject(serializedResources);
    });
  });

  describe('endpoint path', () => {
    it('endpoint url', () => {
      const endpoint = new CustomerApiEndpoint();
      const id = ('cust_' + randomString(24)) as IdCustomer;
      expect(endpoint._getResourceUri(id)).toStrictEqual(`https://api.stancer.com/v2/customers/${id}`);
      expect(endpoint._getResourceUri()).toStrictEqual('https://api.stancer.com/v2/customers/');
    });
  });

  describe('verbs', () => {
    const customerEndpoint = new CustomerApiEndpoint();

    it('get', async () => {
      const responseWithId = await customerEndpoint.get(('cust_' + randomString(24)) as IdCustomer);
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('post', async () => {
      const responseWithId = await customerEndpoint.post(endpointResource);
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('patch', async () => {
      const patchResponse = await customerEndpoint.patch(('cust_' + randomString(24)) as IdCustomer, endpointResource);
      expect(patchResponse).toStrictEqual(endpointResourceDeserialized);
    });

    it('delete', async () => {
      expect(await customerEndpoint.delete(('cust_' + randomString(24)) as IdCustomer)).toStrictEqual(
        endpointResourceDeserialized,
      );
    });
  });

  describe('send', () => {
    const { mobile, email, country } = endpointResourceDeserialized;

    it.each([
      ['mobile', mobile],
      ['email', email],
    ])('send with partial required data', async (valueName, requiredValue) => {
      const endpoint = new CustomerApiEndpoint();
      const mutationsData = {} as Partial<CustomerData>;
      mutationsData[valueName] = requiredValue;
      await expect(endpoint.send(undefined, mutationsData)).resolves.toStrictEqual(endpointResourceDeserialized);
    });

    it('does not post with missing partially required data', async () => {
      const endpoint = new CustomerApiEndpoint();
      expect(() => endpoint.send(undefined, { country })).toThrow(StancerError);
    });

    it('Patch if id', async () => {
      const endpoint = new CustomerApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      await expect(endpoint.send('cust_' + randomString(24), { mobile, country })).resolves.toStrictEqual(
        endpointResourceDeserialized,
      );
      expect(spyonPatch).toHaveBeenCalledTimes(1);
      expect(spyonPost).toHaveBeenCalledTimes(0);
    });

    it('post if no id', () => {
      const endpoint = new CustomerApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      endpoint.send(undefined, { email });
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
});
