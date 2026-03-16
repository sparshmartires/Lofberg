/**
 * Holds the customer logo File object outside Redux to avoid
 * non-serializable value warnings. Shared between Step1 and Step5.
 */
let _file: File | null = null

export function getCustomerLogoFile(): File | null {
  return _file
}

export function setCustomerLogoFile(file: File | null) {
  _file = file
}
