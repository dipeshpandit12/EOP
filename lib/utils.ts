// Utility function for conditional classNames (tailwind-friendly)
export function cn(...args: unknown[]): string {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
}
