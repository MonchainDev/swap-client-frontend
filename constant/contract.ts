enum CONTRACT_NAME {
  MON_FACTORY
}

enum ADDRESS_FEE {
  SPENDER
}

export const CONTRACT_ADDRESS: Record<keyof typeof CONTRACT_NAME, string | `0x${string}`> = {
  MON_FACTORY: '0xF04f6ACf17C9e884D5eBE4aa6804cFD16CdEe32B'
}

export const LIST_ADDRESS_FEE: Record<keyof typeof ADDRESS_FEE, string> = {
  SPENDER: '0x4298706288f08E37B41096e888B00100Bd99e060'
}
