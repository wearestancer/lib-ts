import { describe, expect, it, vi } from 'vitest';

import { AddressApiEndpoint } from '#address/api-endpoint.js';
import { IdAddress, idAddress } from '#address/model.js';
import { StancerRouteInaccessibleError } from '#error/endpoint/route-inaccessible-error.js';
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

describe('address api endpoint', () => {
  describe('Serialize/Deserialize Resources', () => {
    const endpoint = new AddressApiEndpoint();

    it('test deserialize Resource', () => {
      const deserializedResources = endpoint.deserializeResource(endpointResource);
      expect(deserializedResources).toMatchObject(endpointResourceDeserialized);
      expect(endpointResourceDeserialized).toMatchObject(deserializedResources);
    });

    it('test post serialize Resource', () => {
      const serializedResources = endpoint.postObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      // We extract the API generated Data and the non postable data from our endpoint resources.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deleted, created_at, id, ...postObject } = endpointResource;
      expect(serializedResources).toMatchObject(postObject);
      expect(postObject).toMatchObject(serializedResources);
    });

    it('test patch serialize Resource', () => {
      const serializedResources = endpoint.patchObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      // We extract the API generated Data and the non patchable data from our endpoint resources.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deleted, created_at, id, ...patchObject } = endpointResource;
      expect(serializedResources).toMatchObject(patchObject);
      expect(patchObject).toMatchObject(serializedResources);
    });
  });

  describe('endpoint path', () => {
    it('endpoint url', () => {
      const endpoint = new AddressApiEndpoint();
      const id = ('addr_' + randomString(24)) as IdAddress;
      expect(endpoint.endpointUrl(id)).toStrictEqual(`https://api.stancer.com/v2/addresses/${id}`);
      expect(endpoint.endpointUrl()).toStrictEqual('https://api.stancer.com/v2/addresses/');
    });
  });

  describe('verbs', () => {
    const addressEndpoint = new AddressApiEndpoint();

    it('get', async () => {
      const responseWithId = await addressEndpoint.get(('addr_' + randomString(24)) as IdAddress);
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    describe('post', () => {
      it('has all required field', async () => {
        const responseWithId = await addressEndpoint.post({
          zipCode: randomString(2, 16),
          country: randomString(2),
          city: randomString(1, 64),
        });
        expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
      });
    });

    it('patch', async () => {
      expect(() => addressEndpoint.patch(('addr_' + randomString(24), {}) as IdAddress, endpointResource)).toThrow(
        'PATCH is not allowed for addresses',
      );
    });

    it('delete', async () => {
      expect(await addressEndpoint.delete(('addr_' + randomString(24)) as IdAddress)).toStrictEqual(
        endpointResourceDeserialized,
      );
    });
  });

  describe('send', () => {
    const { city, country, zipCode } = endpointResourceDeserialized;

    it('send with required data', async () => {
      const endpoint = new AddressApiEndpoint();
      await expect(endpoint.send(undefined, { city, country, zipCode })).resolves.toStrictEqual(
        endpointResourceDeserialized,
      );
    });

    it('no patch if id', async () => {
      const endpoint = new AddressApiEndpoint();
      const id = idAddress('addr_' + randomString(24));
      expect(() => endpoint.send(id, { id, city, country, zipCode })).toThrow(StancerRouteInaccessibleError);
    });

    it('post if no id', () => {
      const endpoint = new AddressApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      endpoint.send(undefined, { city, country, zipCode });
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
});
