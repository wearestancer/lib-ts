import { type AccessRight, type Handler, setAccess } from './handler.js';

export const enumHandler = <Enum extends readonly string[]>(
  enumDeclaration: Enum,
  access?: Partial<AccessRight>,
): Handler<(typeof enumDeclaration)[number]> => {
  return {
    deserialize: (arg0: unknown) => {
      if (typeof arg0 === 'string' && enumDeclaration.includes(arg0)) {
        return arg0 as (typeof enumDeclaration)[number];
      }

      return undefined;
    },
    serialize: (arg0: (typeof enumDeclaration)[number]) => arg0,
    ...setAccess(access ?? {}),
  };
};
