import { Temporal } from 'temporal-polyfill';

import { type AccessRight, type Handler, setAccess } from './handler.js';

const isValidRfc9557String = (arg0: unknown): arg0 is string =>
  typeof arg0 === 'string' && RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).test(arg0);

export const RFC9557Handler = (access: Partial<AccessRight>): Handler<Temporal.PlainDate> => {
  return {
    serialize: (arg0: Temporal.PlainDate) => arg0.toString(),
    deserialize: (arg0: unknown) => (isValidRfc9557String(arg0) ? Temporal.PlainDate.from(arg0) : undefined),
    ...setAccess(access),
  };
};

export const timestampHandler = (
  access: Partial<AccessRight>,
  name?: string,
): Handler<Temporal.Instant | undefined> => {
  const payloadName = name ? { payloadName: name } : {};

  return {
    serialize: (arg0: Temporal.Instant | undefined) => (arg0 ? arg0.epochMilliseconds / 1000 : undefined),
    deserialize: (arg0: unknown) => {
      const timestamp = Number(arg0);
      return isNaN(timestamp) ? undefined : Temporal.Instant.fromEpochMilliseconds(timestamp * 1000);
    },
    ...setAccess(access),
    ...payloadName,
  };
};
