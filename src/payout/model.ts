import type { IdValue } from '#core/common/branded-type.js';
import { validateID } from '#core/common/id-validator.js';

export type IdPayout = IdValue<`pout_${string}`>;
export const IdPayout = (id: string) => validateID<IdPayout>(id, PayoutModel.regex);
export class PayoutModel {
  static regex = /^pout_[a-zA-Z0-9]{24}$/;
}
