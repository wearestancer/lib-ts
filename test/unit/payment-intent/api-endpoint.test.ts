import { describe, expect, it, vi } from 'vitest';

import { PaymentIntentApiEndpoint } from '#payment-intent/api-endpoint.js';
import type { IdPaymentIntent } from '#payment-intent/model.js';
import { randomString } from '#test/test-helper.js';

import { endpointResource, endpointResourceDeserialized } from './fixtures';

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

describe('paymentintent api endpoint', () => {
  describe('Serialize/Deserialize resources', () => {
    const endpoint = new PaymentIntentApiEndpoint();

    it('test deserialize resource', async () => {
      const deserializedResources = await endpoint.deserializeResource(endpointResource);
      expect(deserializedResources).toMatchObject(endpointResourceDeserialized);
      expect(endpointResourceDeserialized).toMatchObject(deserializedResources);
    });

    it('test post serialize resource', () => {
      const serializedResources = endpoint.postObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      // We extract the API generated Data and the non postable data from our endpoint resources.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { origin, payment, status, id, created_at, ...postObject } = endpointResource;
      expect(serializedResources).toMatchObject(postObject);
      expect(postObject).toMatchObject(serializedResources);
    });

    it('test patch serialize resource', () => {
      const serializedResources = endpoint.patchObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      // We extract the API generated Data and the non patchable data from our endpoint resources.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { origin, payment, status, id, created_at, ...patchObject } = endpointResource;
      expect(serializedResources).toMatchObject(patchObject);
      expect(patchObject).toMatchObject(serializedResources);
    });
  });

  describe('endpoint path', () => {
    it('endpoint url', () => {
      const endpoint = new PaymentIntentApiEndpoint();
      const id = ('paym_' + randomString(24)) as IdPaymentIntent;
      expect(endpoint._getResourceUri(id)).toStrictEqual(`https://api.stancer.com/v2/payment_intents/${id}`);
      expect(endpoint._getResourceUri()).toStrictEqual('https://api.stancer.com/v2/payment_intents/');
    });
  });

  describe('verbs', () => {
    const paymentintentEndpoint = new PaymentIntentApiEndpoint();

    it('get', async () => {
      const responseWithId = await paymentintentEndpoint.get(('paym_' + randomString(24)) as IdPaymentIntent);
      expect(await responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('post', async () => {
      const responseWithId = await paymentintentEndpoint.post(endpointResource);
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('patch', async () => {
      const patchResponse = await paymentintentEndpoint.patch(
        ('paym_' + randomString(24)) as IdPaymentIntent,
        endpointResource,
      );
      expect(patchResponse).toStrictEqual(endpointResourceDeserialized);
    });

    it('delete', async () => {
      expect(await paymentintentEndpoint.delete(('paym_' + randomString(24)) as IdPaymentIntent)).toStrictEqual(
        endpointResourceDeserialized,
      );
    });
  });

  describe('send', () => {
    const { amount, currency } = endpointResourceDeserialized;

    it('send with required data', async () => {
      const endpoint = new PaymentIntentApiEndpoint();
      await expect(endpoint.send(undefined, { amount, currency })).resolves.toStrictEqual(endpointResourceDeserialized);
    });

    it('does not post with missing amount', async () => {
      const endpoint = new PaymentIntentApiEndpoint();
      expect(() => endpoint.send(undefined, { currency })).toThrow();
    });

    it('does not post with missing currency', async () => {
      const endpoint = new PaymentIntentApiEndpoint();
      expect(() => endpoint.send(undefined, { amount })).toThrow();
    });

    it('Patch if id', async () => {
      const endpoint = new PaymentIntentApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      await expect(endpoint.send('pi_' + randomString(24), { currency, amount })).resolves.toStrictEqual(
        endpointResourceDeserialized,
      );
      expect(spyonPatch).toHaveBeenCalledTimes(1);
      expect(spyonPost).toHaveBeenCalledTimes(0);
    });

    it('post if no id', () => {
      const endpoint = new PaymentIntentApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      endpoint.send(undefined, { currency, amount });
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
});
