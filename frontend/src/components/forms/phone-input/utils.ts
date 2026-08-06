import { countries } from "@/components/forms/shared/countries";

/** Splits a full E.164 value into a known country + the remaining national digits, preferring the longest matching dial code. */
export function splitPhoneValue(value: string, fallbackCountry: string) {
  const digits = value.replace(/[^\d+]/g, "");
  const sortedByDialCodeLength = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const match = sortedByDialCodeLength.find((country) => digits.startsWith(country.dialCode));

  if (match) {
    return { countryCode: match.code, nationalNumber: digits.slice(match.dialCode.length) };
  }
  return { countryCode: fallbackCountry, nationalNumber: digits.replace(/^\+/, "") };
}

export function composePhoneValue(countryCode: string, nationalNumber: string) {
  const country = countries.find((c) => c.code === countryCode);
  return `${country?.dialCode ?? ""}${nationalNumber}`;
}
