export const StatusEnum = [
  'refused',
  'authorized',
  'expired',
  'to_capture',
  'capture_sent',
  'captured',
  'disputed',
  'canceled',
  'failed',
  'authorize',
  'capture',
] as const;

export type PaymentStatus = (typeof StatusEnum)[number];

export const succeedPaymentStatus = [
  'to_capture',
  'capture_sent',
  'captured',
];
