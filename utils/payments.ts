import type { Percent, Token } from '@wicchain/sdk'
import { validateAndParseAddress } from '@wicchain/sdk'
import type { Address } from 'viem'
import { encodeFunctionData } from 'viem'
import peripheryPaymentsWithFeeABI from '@/constant/abi/peripheryPaymentsWithFeeABI.json'

export interface FeeOptions {
  /**
   * The percent of the output that will be taken as a fee.
   */
  fee: Percent

  /**
   * The recipient of the fee.
   */
  recipient: Address
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Payments {
  public static ABI = peripheryPaymentsWithFeeABI

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  private static encodeFeeBips(fee: Percent): bigint {
    return fee.multiply(10_000).quotient
  }

  public static encodeUnwrapWMON(amountMinimum: bigint, recipient: Address, feeOptions?: FeeOptions): `0x${string}` {
    recipient = validateAndParseAddress(recipient)

    if (feeOptions) {
      const feeBips = this.encodeFeeBips(feeOptions.fee)
      const feeRecipient = validateAndParseAddress(feeOptions.recipient)

      return encodeFunctionData({
        abi: Payments.ABI,
        functionName: 'unwrapWMONWithFee',
        args: [amountMinimum, recipient, feeBips, feeRecipient]
      })
    }

    return encodeFunctionData({ abi: Payments.ABI, functionName: 'unwrapWMON', args: [amountMinimum, recipient] })
  }
  public static encodeUnwrapWMON9(amountMinimum: bigint, recipient: Address, feeOptions?: FeeOptions): `0x${string}` {
    recipient = validateAndParseAddress(recipient)

    if (feeOptions) {
      const feeBips = this.encodeFeeBips(feeOptions.fee)
      const feeRecipient = validateAndParseAddress(feeOptions.recipient)

      return encodeFunctionData({
        abi: Payments.ABI,
        functionName: 'unwrapWMONWithFee',
        args: [amountMinimum, recipient, feeBips, feeRecipient]
      })
    }

    return encodeFunctionData({ abi: Payments.ABI, functionName: 'unwrapWMON9', args: [amountMinimum, recipient] })
  }

  public static encodeSweepToken(token: Token, amountMinimum: bigint, recipient: Address, feeOptions?: FeeOptions): `0x${string}` {
    recipient = validateAndParseAddress(recipient)

    if (feeOptions) {
      const feeBips = this.encodeFeeBips(feeOptions.fee)
      const feeRecipient = validateAndParseAddress(feeOptions.recipient)

      return encodeFunctionData({
        abi: Payments.ABI,
        functionName: 'sweepTokenWithFee',
        args: [token.address, amountMinimum, recipient, feeBips, feeRecipient]
      })
    }

    return encodeFunctionData({
      abi: Payments.ABI,
      functionName: 'sweepToken',
      args: [token.address, amountMinimum, recipient]
    })
  }

  public static encodeRefundETH(): `0x${string}` {
    return encodeFunctionData({ abi: Payments.ABI, functionName: 'refundETH' })
  }
}
