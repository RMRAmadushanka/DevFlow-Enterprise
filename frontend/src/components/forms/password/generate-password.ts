const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+";
const ALL = UPPER + LOWER + NUMBERS + SYMBOLS;

/** Generates a strong, random password using `crypto.getRandomValues` (falls back to `Math.random` outside the browser). */
export function generateStrongPassword(length = 16): string {
  const randomIndex = (max: number) => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return buffer[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const guaranteed = [
    UPPER[randomIndex(UPPER.length)],
    LOWER[randomIndex(LOWER.length)],
    NUMBERS[randomIndex(NUMBERS.length)],
    SYMBOLS[randomIndex(SYMBOLS.length)],
  ];

  const rest = Array.from({ length: Math.max(length - guaranteed.length, 0) }, () => ALL[randomIndex(ALL.length)]);

  const chars = [...guaranteed, ...rest];
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
