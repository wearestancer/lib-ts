export const NatureCardEnum = [
  'personal',
  'corporate',
  'unknown',
] as const;

export type NatureCard = (typeof NatureCardEnum)[number];
