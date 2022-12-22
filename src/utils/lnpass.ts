const app_no = 19557 // sha256('lnpass') := 0x4c65... := 19557

export const lnpassAccountDerivationPath = (accountNumber: number): string => {
  return `m/83696968'/${app_no}/${accountNumber}`
}
