import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import { StancerValidationError } from '#core/error/validation-error.js';
import { PaymentApiEndpoint } from '#payment/api-endpoint.js';
import { type PaymentData, PaymentModel } from '#payment/model.js';
import { paymentValidator } from '#payment/validator.js';
import { type RefundAmount, refundAmount } from '#refund/model.js';
import { RefundRepository } from '#refund/repository.js';

export class PaymentRepository
  extends AbstractRepository<PaymentData, PaymentModel, PaymentApiEndpoint>
  implements Repository<PaymentData, PaymentModel>
{
  private _refundRepository?: RefundRepository;

  constructor(endpoint?: PaymentApiEndpoint, refundRepository?: RefundRepository) {
    super({ endpoint: endpoint ?? new PaymentApiEndpoint(), validator: paymentValidator, model: PaymentModel });
    if (refundRepository) {
      this._refundRepository = refundRepository;
    }
  }

  public async refund(payment: PaymentModel, amount?: RefundAmount) {
    if (!payment.amount || !payment.id) {
      throw new StancerValidationError('Payment must be populated before calling refund method');
    }

    if (payment.isNotSuccess()) {
      throw new StancerValidationError('Payment must be successful to be refunded');
    }

    if (!payment.isRefundPopulated()) {
      await this.populateRefunds(payment);
    }

    const refundingAmount = refundAmount(amount ?? payment.amount);
    if (refundingAmount > payment.amount || refundingAmount > payment.refundableAmount) {
      throw new StancerValidationError(
        `You are trying to refund ${refundingAmount}, which is ${refundingAmount - payment.refundableAmount} more than the refundable amount of ${payment.refundableAmount}.`,
      );
    }

    if (
      (payment.status === 'to_capture' || payment.status === 'capture_sent') &&
      payment.amount !== payment.refundableAmount
    ) {
      throw new StancerValidationError(`Partial refund is not allowed when payment is not captured.`);
    }

    if (!this._refundRepository) {
      this._refundRepository = new RefundRepository();
    }

    const refundRepository = this._refundRepository;
    const refund = await refundRepository.create();
    refundRepository.send(refund.setPayment(payment.id).setAmount(refundingAmount));
    return await this.populateRefunds(payment);
  }

  /**
   * Populate the refunds property of a payment and return it
   * @param payment a payment
   * @returns the payment with populate refunds
   */
  public async populateRefunds(payment: PaymentModel) {
    if (payment.id === undefined) {
      throw new StancerValidationError('Payment must be populated before calling populateRefund method');
    }

    const refunds = await this.endpoint.refunds(payment.id);
    payment.populateRefund(refunds);
    return payment;
  }
}
