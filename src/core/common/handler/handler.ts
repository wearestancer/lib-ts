export type AccessRight = {
  gettable: boolean;
  postable: boolean;
  patchable: boolean;
  postRequired: 'partial' | boolean;
  patchRequired: 'partial' | boolean;
};

export type Serializer<SDKType> = {
  deserialize: (arg0: unknown) => SDKType | undefined;
  serialize: (arg0: SDKType) => unknown;
  payloadName?: string;
};

export type Handler<SDKType> = AccessRight & Serializer<SDKType>;

export const defaultSerialize = <T>(value: T) => value;

export const defaultDeserialize = <T>(value: unknown, type: BasicType): T | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const typeNarrowing = (value: unknown): value is T =>
    type === 'array' ? Array.isArray(value) : typeof value === type;

  if (typeNarrowing(value)) {
    return value;
  }

  return undefined;
};

export const useDefaultSerializer = <SDKType>(type: BasicType) => {
  return {
    serialize: defaultSerialize<SDKType>,
    deserialize: (value: unknown) => defaultDeserialize<SDKType>(value, type),
  };
};

type BasicType = 'boolean' | 'string' | 'number' | 'array' | 'object';

export const defaultHandler = <SDKType>(type: BasicType, access?: Partial<AccessRight>): Handler<SDKType> => {
  return {
    ...useDefaultSerializer<SDKType>(type),
    ...setAccess(access ?? {}),
  };
};

export const setAccess = ({
  gettable = true,
  postable = true,
  patchable = true,
  postRequired = false,
  patchRequired = false,
}: Partial<AccessRight>): AccessRight => {
  return {
    gettable,
    postable,
    patchable,
    postRequired,
    patchRequired,
  };
};
