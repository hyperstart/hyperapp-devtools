const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SIZE = 16
const rand = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

export const guid = () =>
  Array.apply(null, Array(SIZE))
    .map(rand)
    .join("")

export function truncate(value: string, maxLength: number = 30): string {
  if (value.length <= maxLength) {
    return value
  }
  return value.substr(0, maxLength - 2) + "..."
}
