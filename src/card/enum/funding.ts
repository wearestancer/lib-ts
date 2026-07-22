export const FundingCardEnum = [
  'credit',
  'debit',
  'prepaid',
  'universal',
  'charge',
  'deferred',
  'unknown',
] as const;

export type FundingCard = (typeof FundingCardEnum)[number];
