export const PaymentIntentStatusEnum = [
  'require_payment_method',
  'require_authentication',
  'require_authorization',
  'authorized',
  'processing',
  'captured',
  'canceled',
  'unpaid',
] as const;
export type PaymentIntentStatus = (typeof PaymentIntentStatusEnum)[number];

export const failedPaymentIntentStatus = [
  'canceled',
  'unpaid',
];
export const succeedPaymentIntentStatus = [
  'authorized',
  'processing',
  'captured',
];
