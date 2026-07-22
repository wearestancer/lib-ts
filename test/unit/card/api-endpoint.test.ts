import { describe, expect, it, vi } from 'vitest';

import { CardApiEndpoint } from '#card/api-endpoint.js';
import type { IdCard } from '#card/model.js';
import { randomExpYear, randomMonth, randomString } from '#test/test-helper.js';

import { randomCardNumber } from './card-helper.js';
import { creationResource, endpointResource, endpointResourceDeserialized } from './fixtures.js';

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

describe('card api endpoint', () => {
  describe('Serialize/Deserialize resources', () => {
    const endpoint = new CardApiEndpoint();

    it('test deserialize resource', () => {
      const deserializedResources = endpoint.deserializeResource(endpointResource);

      //Double match to guaranty exact same shape
      expect(deserializedResources).toMatchObject(endpointResourceDeserialized);
      expect(endpointResourceDeserialized).toMatchObject(deserializedResources);
    });

    it('test post serialize resource', () => {
      const serializedResources = endpoint.postObjectSerializer({
        ...endpointResourceDeserialized,
        number: creationResource.number,
        tokenize: creationResource.tokenize,
        cvc: creationResource.cvc,
      }) as typeof endpointResource;
      // The fields not included in the partial object are API generated
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { brand, country, created, deleted, funding, id, last4, nature, network, ...partialObject } =
        endpointResource;
      const postObject = {
        ...partialObject,
        number: creationResource.number,
        tokenize: creationResource.tokenize,
        cvc: creationResource.cvc,
      };
      //Double match to guaranty exact same shape
      expect(serializedResources).toMatchObject(postObject);
      expect(postObject).toMatchObject(serializedResources);
    });

    it('test patch serialize resource (not available in repository)', () => {
      const serializedResources = endpoint.patchObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      //The object with all the patchable field
      const patchObject = {
        exp_month: endpointResource.exp_month,
        exp_year: endpointResource.exp_year,
        external_id: endpointResource.external_id,
        zip_code: endpointResource.zip_code,
      };
      //Double match to guaranty exact same shape
      expect(serializedResources).toMatchObject(patchObject);
      expect(patchObject).toMatchObject(serializedResources);
    });
  });

  describe('endpoint path', () => {
    it('endpoint url', () => {
      const endpoint = new CardApiEndpoint();
      const id = ('card_' + randomString(24)) as IdCard;
      expect(endpoint._getResourceUri(id)).toStrictEqual(`https://api.stancer.com/v2/cards/${id}`);
      expect(endpoint._getResourceUri()).toStrictEqual('https://api.stancer.com/v2/cards/');
    });
  });

  describe('verbs', () => {
    const cardEndpoint = new CardApiEndpoint();

    it('get', async () => {
      const responseWithId = await cardEndpoint.get(('card_' + randomString(24)) as IdCard);
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('post no deserialization', async () => {
      const responseWithId = await cardEndpoint.post({
        id: 'card_' + randomString(24),
        expMonth: randomMonth(),
        expYear: randomExpYear(),
        number: randomCardNumber(),
      });
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('patch', async () => {
      const patchResponse = await cardEndpoint.patch(('card_' + randomString(24)) as IdCard, endpointResource);
      expect(patchResponse).toStrictEqual(endpointResourceDeserialized);
    });

    it('delete', async () => {
      expect(await cardEndpoint.delete(('card_' + randomString(24)) as IdCard)).toStrictEqual(
        endpointResourceDeserialized,
      );
    });
  });

  describe('send', () => {
    const { expYear, expMonth } = endpointResourceDeserialized;

    it('send with required data', async () => {
      const endpoint = new CardApiEndpoint();
      await expect(endpoint.send(undefined, { expYear, expMonth, number: randomCardNumber() })).resolves.toStrictEqual(
        endpointResourceDeserialized,
      );
    });

    it('does not post with missing expYear', async () => {
      const endpoint = new CardApiEndpoint();
      expect(() => endpoint.send(undefined, { expMonth, number: randomCardNumber() })).toThrow();
    });

    it('does not post with missing expMonth', async () => {
      const endpoint = new CardApiEndpoint();
      expect(() => endpoint.send(undefined, { expYear, number: randomCardNumber() })).toThrow();
    });

    it('does not post with missing number', async () => {
      const endpoint = new CardApiEndpoint();
      expect(() => endpoint.send(undefined, { expYear, expMonth })).toThrow();
    });

    it('Patch if id', async () => {
      const endpoint = new CardApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      await expect(endpoint.send('card_' + randomString(24), { expYear, expMonth })).resolves.toStrictEqual(
        endpointResourceDeserialized,
      );
      expect(spyonPatch).toHaveBeenCalledTimes(1);
      expect(spyonPost).toHaveBeenCalledTimes(0);
    });

    it('post if no id', () => {
      const endpoint = new CardApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      endpoint.send(undefined, { expYear, expMonth, number: randomCardNumber() });
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
});
