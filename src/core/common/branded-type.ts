import { StancerValidationError } from '#error/validation-error.js';

export type Branded<T, Tag> = T & { readonly __tag: Tag };

export type IdValue<T = string> = Branded<T, 'ID'>;

const isId = (id: string): id is IdValue => Boolean(id);

export const IdValue = (id: string): IdValue => {
  if (isId(id)) {
    return id;
  }

  throw new StancerValidationError('not an ID');
};
