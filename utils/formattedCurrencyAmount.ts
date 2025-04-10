import { Fraction, Rounding, type Token, type Currency, type CurrencyAmount } from '@monchain/swap-sdk-core'
const CURRENCY_AMOUNT_MIN = new Fraction(1n, 1000000n)

export default function formattedCurrencyAmount(currencyAmount: CurrencyAmount<Token> | CurrencyAmount<Currency> | undefined, significantDigits = 4) {
  const formattedAmount = formatAmount(currencyAmount, significantDigits)
  return !formattedAmount || !currencyAmount || currencyAmount.equalTo(0n)
    ? '0'
    : currencyAmount.greaterThan(CURRENCY_AMOUNT_MIN)
      ? new Intl.NumberFormat(undefined, {
          maximumSignificantDigits: significantDigits
        }).format(Number(formattedAmount))
      : `<${CURRENCY_AMOUNT_MIN.toSignificant(1)}`
}

function formatFraction(fraction?: Fraction | null | undefined, precision: number | undefined = 6, rounding: Rounding | undefined = undefined) {
  if (!fraction || fraction.denominator === 0n) {
    return undefined
  }
  if (fraction.greaterThan(10n ** BigInt(precision))) {
    return fraction.toFixed(0)
  }
  return fraction.toSignificant(precision, undefined, rounding)
}

export function formatAmount(amount?: CurrencyAmount<Currency> | null | undefined, precision?: number | undefined) {
  if (!amount) {
    return undefined
  }
  return formatFraction(amount?.asFraction.divide(10n ** BigInt(amount?.currency.decimals)), precision, Rounding.ROUND_DOWN)
}
