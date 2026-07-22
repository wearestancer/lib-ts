export const NetworkCardEnum = [
  'national',
  'visa',
  'mastercard',
  'unknown',
] as const;

export type NetworkCard = (typeof NetworkCardEnum)[number];

export const PreferredNetworkCardEnum = [
  'national',
  'visa',
  'mastercard',
] as const;

export type PreferredNetworkCard = (typeof PreferredNetworkCardEnum)[number];
