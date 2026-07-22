export const CurrencyEnum = [
  'aud',
  'cad',
  'chf',
  'dkk',
  'eur',
  'gbp',
  'nok',
  'pln',
  'sek',
  'usd',
] as const;

export type Currency = (typeof CurrencyEnum)[number];
