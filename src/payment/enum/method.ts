export const MethodEnum = ['card', 'sepa'] as const;
export type Method = (typeof MethodEnum)[number];
