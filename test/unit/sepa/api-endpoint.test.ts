import { describe, expect, it, vi } from 'vitest';

import { trackObjectMutations } from '#core/common/mutation-tracked-object.js';
import { UnsendableError } from '#core/error/unsendable-error.js';
import { SepaApiEndpoint } from '#sepa/api-endpoint.js';
import type { IdSepa } from '#sepa/model.js';
import { randomString } from '#test/test-helper.js';

import { creationResource, endpointResource, endpointResourceDeserialized } from './fixture';
import { ibanDataProvider } from './sepa-helper';

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
const iban = creationResource.iban;

describe('sepa api endpoint', () => {
  describe('Serialize/Deserialize resources', () => {
    const endpoint = new SepaApiEndpoint();

    it('test deserialize resource', () => {
      const deserializedResources = endpoint.deserializeResource(endpointResource);
      expect(deserializedResources).toMatchObject(endpointResourceDeserialized);
    });

    it('test post serialize resource', () => {
      const serializedResources = endpoint.postObjectSerializer({
        ...endpointResourceDeserialized,
        iban,
      }) as typeof endpointResource;

      // We extract the API generated Data and the non postable data from our endpoint resources.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { created, deleted, id, last4, ...matchObject } = endpointResource;
      expect(serializedResources).toMatchObject(matchObject);
      //We check the non gettable properties
      expect(serializedResources.iban).toBe(iban);
      expect(serializedResources).not.toHaveProperty('created');
      expect(serializedResources).not.toHaveProperty('deleted');
      expect(serializedResources).not.toHaveProperty('id');
      expect(serializedResources).not.toHaveProperty('last4');
    });

    it('test patch serialize resource (not available in repository)', () => {
      const serializedResources = endpoint.patchObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;

      // We extract the API generated Data and the non patchable data from our endpoint resources.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deleted, created, last4, bic, customer, id, ...matchObject } = endpointResource;
      expect(serializedResources).toMatchObject(matchObject);
      expect(matchObject).toMatchObject(serializedResources);
      expect(serializedResources).not.toHaveProperty('created');
      expect(serializedResources).not.toHaveProperty('deleted');
      expect(serializedResources).not.toHaveProperty('id');
      expect(serializedResources).not.toHaveProperty('last4');
      expect(serializedResources).not.toHaveProperty('bic');
      expect(serializedResources).not.toHaveProperty('customer');
    });
  });

  describe('endpoint path', () => {
    it('endpoint url', () => {
      const endpoint = new SepaApiEndpoint();
      const id = ('sepa_' + randomString(24)) as IdSepa;
      expect(endpoint._getResourceUri(id)).toStrictEqual(`https://api.stancer.com/v2/sepa/${id}`);
      expect(endpoint._getResourceUri()).toStrictEqual('https://api.stancer.com/v2/sepa/');
    });
  });

  describe('verbs', () => {
    const sepaEndpoint = new SepaApiEndpoint();

    it('get', async () => {
      const responseWithId = await sepaEndpoint.get(('sepa_' + randomString(24)) as IdSepa);
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('post no deserialization', async () => {
      const responseWithId = await sepaEndpoint.post({ name: randomString(3, 64), iban: ibanDataProvider(true) });
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('patch', async () => {
      const patchResponse = await sepaEndpoint.patch(('sepa_' + randomString(24)) as IdSepa, endpointResource);
      expect(patchResponse).toStrictEqual(endpointResourceDeserialized);
    });

    it('delete', async () => {
      expect(await sepaEndpoint.delete(('sepa_' + randomString(24)) as IdSepa)).toStrictEqual(
        endpointResourceDeserialized,
      );
    });
  });

  describe('send', () => {
    const { name, mandate, dateMandate } = endpointResourceDeserialized;

    it('send with required data', async () => {
      const endpoint = new SepaApiEndpoint();

      expect(endpoint.send(undefined, { iban, name })).resolves.toStrictEqual(endpointResourceDeserialized);
    });

    it('does not post with missing iban', async () => {
      const endpoint = new SepaApiEndpoint();

      expect(() => endpoint.send(undefined, { name })).toThrow();
    });

    it('does not post with missing name', async () => {
      const endpoint = new SepaApiEndpoint();
      expect(() => endpoint.send(undefined, { iban })).toThrow(UnsendableError);
    });

    it('Patch if id', async () => {
      const endpoint = new SepaApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      const mutationsData = trackObjectMutations({}, () => true);
      mutationsData['id'] = 'sepa' + randomString(24);
      mutationsData['mandate'] = mandate;
      mutationsData['name'] = name;
      mutationsData['dateMandate'] = dateMandate;

      expect(mutationsData['id']).toBeTruthy();
      await expect(endpoint.send(mutationsData, mutationsData['id'])).resolves.toStrictEqual(
        endpointResourceDeserialized,
      );
      expect(spyonPatch).toHaveBeenCalledTimes(1);
      expect(spyonPost).toHaveBeenCalledTimes(0);
    });

    it('post if no id', () => {
      const endpoint = new SepaApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');

      const mutationsData = trackObjectMutations({}, () => true);
      mutationsData['iban'] = iban;
      mutationsData['name'] = name;

      endpoint.send(undefined, mutationsData);
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
});
