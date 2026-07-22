import { describe, expect, it, vi } from 'vitest';

import { PaymentApiEndpoint } from '#payment/api-endpoint.js';
import { CurrencyEnum } from '#payment/enum/currency.js';
import type { IdPayment } from '#payment/model.js';
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

describe('payment api endpoint', () => {
  describe('Serialize/Deserialize resources', () => {
    const endpoint = new PaymentApiEndpoint();

    it('test deserialize resource', async () => {
      const deserializedResources = await endpoint.deserializeResource(endpointResource);
      expect(deserializedResources).toMatchObject(endpointResourceDeserialized);
      expect(endpointResourceDeserialized).toMatchObject(deserializedResources);
    });

    it('test post serialize resource', () => {
      const serializedResources = endpoint.postObjectSerializer({
        ...endpointResourceDeserialized,
        wallet: {},
      }) as typeof endpointResource;

      // property not in postObject are API generated or not postable
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        created,
        date_paym,
        date_bank,
        fee,
        method,
        response,
        response_author,
        status,
        origin,
        payout,
        payment_intent,
        id,
        ...postObject
      } = endpointResource;
      /* eslint-enable @typescript-eslint/no-unused-vars */

      //Double match to guaranty exact same shape
      //Auth is really special, what we send is not what we receive
      expect(serializedResources).toMatchObject({ ...postObject, auth: true });
      expect({ ...postObject, auth: true }).toMatchObject(serializedResources);
    });

    it('test patch serialize resource (not available in repository)', () => {
      const serializedResources = endpoint.patchObjectSerializer({
        ...endpointResourceDeserialized,
        wallet: {},
        device: { city: 'city' },
      }) as typeof endpointResource;

      // property not in patchObject are API generated or not patchable
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        id,
        unique_id,
        created,
        date_bank,
        date_paym,
        fee,
        method,
        origin,
        payment_intent,
        payout,
        response,
        response_author,
        ...patchObject
      } = endpointResource;
      /* eslint-enable */

      //Double match to guaranty exact same shape
      //Auth is really special, what we send is not what we receive
      expect(serializedResources).toMatchObject({ ...patchObject, auth: true });
      expect({ ...patchObject, auth: true }).toMatchObject(serializedResources);
    });
  });

  describe('endpoint path', () => {
    it('endpoint url', () => {
      const endpoint = new PaymentApiEndpoint();
      const id = ('paym_' + randomString(24)) as IdPayment;
      expect(endpoint._getResourceUri(id)).toStrictEqual(`https://api.stancer.com/v2/payments/${id}`);
      expect(endpoint._getResourceUri()).toStrictEqual('https://api.stancer.com/v2/payments/');
    });
  });

  describe('verbs', () => {
    const paymentEndpoint = new PaymentApiEndpoint();

    it('get', async () => {
      const responseWithId = await paymentEndpoint.get(('paym_' + randomString(24)) as IdPayment);
      expect(await responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('post no deserialization', async () => {
      const responseWithId = await paymentEndpoint.post({
        amount: randomNumber(0, 1000000),
        currency: CurrencyEnum[randomNumber(0, CurrencyEnum.length - 1)],
      });
      expect(responseWithId).toStrictEqual(endpointResourceDeserialized);
    });

    it('patch', async () => {
      const patchResponse = await paymentEndpoint.patch(('paym_' + randomString(24)) as IdPayment, endpointResource);
      expect(patchResponse).toStrictEqual(endpointResourceDeserialized);
    });

    it('delete', async () => {
      expect(await paymentEndpoint.delete(('paym_' + randomString(24)) as IdPayment)).toStrictEqual(
        endpointResourceDeserialized,
      );
    });
  });

  describe('send', () => {
    const { amount, currency } = endpointResourceDeserialized;

    it('send with required data', async () => {
      const endpoint = new PaymentApiEndpoint();

      await expect(endpoint.send(undefined, { amount, currency })).resolves.toStrictEqual(endpointResourceDeserialized);
    });

    it('does not post with missing amount', async () => {
      const endpoint = new PaymentApiEndpoint();

      expect(() => endpoint.send(undefined, { currency })).toThrow();
    });

    it('does not post with missing currency', async () => {
      const endpoint = new PaymentApiEndpoint();
      expect(() => endpoint.send(undefined, { amount })).toThrow();
    });

    it('Patch if id', async () => {
      const endpoint = new PaymentApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');

      await expect(endpoint.send('paym_' + randomString(24), { currency, amount })).resolves.toStrictEqual(
        endpointResourceDeserialized,
      );
      expect(spyonPatch).toHaveBeenCalledTimes(1);
      expect(spyonPost).toHaveBeenCalledTimes(0);
    });

    it('post if no id', () => {
      const endpoint = new PaymentApiEndpoint();
      const spyonPatch = vi.spyOn(endpoint, 'patch');
      const spyonPost = vi.spyOn(endpoint, 'post');

      endpoint.send(undefined, { currency, amount });
      expect(spyonPatch).toHaveBeenCalledTimes(0);
      expect(spyonPost).toHaveBeenCalledTimes(1);
    });
  });
});
