import type { ChangeEvent, InputHTMLAttributes } from "react";

export type PhoneFormat = "national" | "international" | "e164";

export interface PhoneCountry {
  iso2: string;
  dialCode: string;
  name: string;
  localizedName?: string;
  format?: string;
  placeholder?: string;
  priority?: number;
}

export interface PhoneValue {
  country: PhoneCountry;
  countryCode: string;
  dialCode: string;
  nationalNumber: string;
  e164: string;
  international: string;
  national: string;
  isValid: boolean;
}

export interface PhoneInputProps {
  value?: string;
  defaultCountry?: string;
  country?: string;
  onChange?: (value: PhoneValue) => void;
  onCountryChange?: (country: PhoneCountry) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  countryInputName?: string;
  numberInputName?: string;
  id?: string;
  label?: string;
  countryLabel?: string;
  numberLabel?: string;
  placeholder?: string;
  locale?: string;
  direction?: "ltr" | "rtl" | "auto";
  countries?: PhoneCountry[];
  onlyCountries?: string[];
  excludeCountries?: string[];
  preferredCountries?: string[];
  suggestedCountries?: string[];
  enableCountrySelector?: boolean;
  enableFlag?: boolean;
  enableSearch?: boolean;
  enableAutoDetect?: boolean;
  detectIp?: boolean;
  detectIpUrl?: string;
  enableFormatting?: boolean;
  format?: PhoneFormat;
  validate?: (value: PhoneValue) => boolean | string;
  error?: string;
  success?: string;
  loading?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  countryInputProps?: InputHTMLAttributes<HTMLInputElement>;
  numberInputProps?: InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  countrySelectorClassName?: string;
  countryListClassName?: string;
  numberInputClassName?: string;
  "aria-label"?: string;
}

export type PhoneNumberChangeEvent = ChangeEvent<HTMLInputElement>;
