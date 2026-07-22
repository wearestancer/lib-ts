import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import { StancerValidationError } from '#core/error/validation-error.js';
import { type RefundAmount, refundAmount } from '#refund/model.js';

import { PaymentIntentApiEndpoint } from './api-endpoint.js';
import { type PaymentIntentData, PaymentIntentModel } from './model.js';
import { PaymentIntentValidator } from './validator.js';

export class PaymentIntentRepository
  extends AbstractRepository<PaymentIntentData, PaymentIntentModel>
  implements Repository<PaymentIntentData, PaymentIntentModel>
{
  protected override endpoint: PaymentIntentApiEndpoint;

  constructor(endpoint?: PaymentIntentApiEndpoint) {
    const PIendpoint = endpoint ?? new PaymentIntentApiEndpoint();
    super({
      endpoint: PIendpoint,
      validator: PaymentIntentValidator,
      model: PaymentIntentModel,
    });
    this.endpoint = PIendpoint;
  }

  public async capture(paymentIntent: PaymentIntentModel) {
    if (!paymentIntent.id) {
      throw new StancerValidationError('PaymentIntent must be populated before calling capture method');
    }

    if (paymentIntent.status !== 'authorized') {
      throw new StancerValidationError('PaymentIntent must be authorize to be captured');
    }

    await this.endpoint.capture(paymentIntent.id);
  }

  public async getPayments(paymentIntent: PaymentIntentModel) {
    if (paymentIntent.id === undefined) {
      throw new StancerValidationError('PaymentIntent must be populated before calling getPayments method');
    }

    const payments = await this.endpoint.payments(paymentIntent.id);
    paymentIntent.populatePayments(payments);
    return payments;
  }

  public async getRefunds(paymentIntent: PaymentIntentModel) {
    if (paymentIntent.id === undefined) {
      throw new StancerValidationError('PaymentIntent must be populated before calling getRefunds method');
    }

    const refunds = await this.endpoint.refunds(paymentIntent.id);
    paymentIntent.populateRefunds(refunds);
    return refunds;
  }

  public async refund(paymentIntent: PaymentIntentModel, amount?: RefundAmount) {
    if (!paymentIntent.amount || !paymentIntent.id) {
      throw new StancerValidationError('PaymentIntent must be populated before calling refund method');
    }

    if (paymentIntent.isNotSuccess()) {
      throw new StancerValidationError('PaymentIntent must be successful to be refunded');
    }

    if (!paymentIntent.isRefundPopulated()) {
      await this.getRefunds(paymentIntent);
    }

    const refundingAmount = refundAmount(amount ?? paymentIntent.amount);
    if (refundingAmount > paymentIntent.amount || refundingAmount > paymentIntent.refundableAmount) {
      throw new StancerValidationError(
        `You are trying to refund ${refundingAmount} it's ${refundingAmount - paymentIntent.refundableAmount} more than possible ${paymentIntent.refundableAmount}.`,
      );
    }

    if (paymentIntent.status !== 'captured' && Number(refundingAmount) !== Number(paymentIntent.amount)) {
      throw new StancerValidationError(`You cannot partially refund a payment intent that isn't captured`);
    }

    const newData = await this.endpoint.refund(paymentIntent.id, refundingAmount);
    paymentIntent.dataTrackMutations(newData);
    return paymentIntent;
  }
}
