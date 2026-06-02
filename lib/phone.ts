export function formatPhone(value: string): string {
  const hasPlus = value.trimStart().startsWith('+')
  const digits = value.replace(/\D/g, '')
  if (!digits) return hasPlus ? '+' : ''

  if (hasPlus) {
    // Keep first 2 digits as country code, then group rest in 3s
    if (digits.length <= 2) return '+' + digits
    const cc = digits.slice(0, 2)
    const rest = digits.slice(2).match(/.{1,3}/g) ?? []
    return '+' + cc + ' ' + rest.join(' ')
  }

  const chunks = digits.match(/.{1,3}/g) ?? []
  return chunks.join(' ')
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}
