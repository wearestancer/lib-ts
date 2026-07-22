import { describe, expect, it, vi } from 'vitest';

import { RefundApiEndpoint } from '#refund/api-endpoint.js';
import type { IdRefund } from '#refund/model.js';
import { randomNumber, randomString } from '#test/test-helper.js';

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

describe('refund api endpoint', () => {
  describe('Serialize/Deserialize resources', () => {
    const endpoint = new RefundApiEndpoint();

    it('test deserialize resource', async () => {
      const deserializedResources = await endpoint.deserializeResource(endpointResource);
      expect(endpointResourceDeserialized).toMatchObject(deserializedResources);
      expect(deserializedResources).toMatchObject(endpointResourceDeserialized);
    });

    it('test post serialize resource', () => {
      const serializedResources = endpoint.postObjectSerializer(
        endpointResourceDeserialized,
      ) as typeof endpointResource;
      const postObject = {
        amount: endpointResource.amount,
        payment: endpointResource.payment,
      };
      expect(serializedResources).toMatchObject(postObject);
      expect(postObject).toMatchObject(serializedResources);
    });
  });

  describe('endpoint path', () => {
    it('endpoint url', () => {
      const endpoint = new RefundApiEndpoint();
      const id = ('refd_' + randomString(24)) as IdRefund;
      expect(endpoint._getResourceUri(id)).toStrictEqual(`https://api.stancer.com/v2/refunds/${id}`);
      expect(endpoint._getResourceUri()).toStrictEqual('https://api.stancer.com/v2/refunds/');
    });
  });

  describe('verbs', () => {
    const refundEndpoint = new RefundApiEndpoint();

    it('get', async () => {
      const responseWithId = await refundEndpoint.get(('refd_' + randomString(24)) as IdRefund);
      expect(await responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('post no deserialization', async () => {
      const responseWithId = await refundEndpoint.post({
        amount: randomNumber(0, 100000),
        payment: `paym_${randomString(24)}`,
      });
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('does not patch', async () => {
      expect(() => refundEndpoint.patch(('refd_' + randomString(24)) as IdRefund, endpointResource)).toThrow();
    });

    it('delete', async () => {
      expect(await refundEndpoint.delete(('refd_' + randomString(24)) as IdRefund)).toStrictEqual(
        endpointResourceDeserialized,
      );
    });
  });

  describe('send', () => {
    const { amount, payment } = endpointResourceDeserialized;

    it('send with required data', async () => {
      const endpoint = new RefundApiEndpoint();
      await expect(endpoint.send(undefined, { amount, payment })).resolves.toStrictEqual(endpointResourceDeserialized);
    });

    it('does not post with missing amount', async () => {
      const endpoint = new RefundApiEndpoint();
      expect(() => endpoint.send(undefined, { payment })).toThrow();
    });

    it('does not post with missing payment', async () => {
      const endpoint = new RefundApiEndpoint();
      expect(() => endpoint.send(undefined, { amount })).toThrow();
    });

    it('Refund does not Patch if id', async () => {
      const endpoint = new RefundApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      expect(() => endpoint.send('refd_' + randomString(24), { payment, amount })).toThrow();
      expect(spyonPatch).toHaveBeenCalledTimes(1);
      expect(spyonPost).toHaveBeenCalledTimes(0);
    });

    it('post if no id', () => {
      const endpoint = new RefundApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');
      endpoint.send(undefined, { payment, amount });
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
});
