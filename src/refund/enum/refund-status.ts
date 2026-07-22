export const RefundStatusEnum = [
  'to_refund',
  'refund_sent',
  'refunded',
  'not_honored',
  'payment_canceled',
  'failed',
  'awaiting_approval',
] as const;

export type RefundStatus = (typeof RefundStatusEnum)[number];
