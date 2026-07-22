import type { IdValue } from '../branded-type.js';
import { isValidID } from '../id-validator.js';
import { type AccessRight, type Handler, defaultSerialize, setAccess } from './handler.js';

export const IdHandler = <ID extends IdValue>(regex: RegExp, access?: Partial<AccessRight>): Handler<ID> => {
  return {
    deserialize: (id: unknown) => {
      if (typeof id === 'string' && isValidID<ID>(id, regex)) {
        return id;
      }

      if (typeof id === 'object' && id !== null && Object.hasOwn(id, 'id')) {
        const data = id as { id: string };

        if (isValidID<ID>(data.id, regex)) {
          return data.id;
        }
      }

      return undefined;
    },
    serialize: defaultSerialize,
    ...setAccess(
      access ?? { gettable: true, postable: false, patchable: false, postRequired: false, patchRequired: false },
    ),
  };
};
