import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getCountryCodeFromTimezone } from "brancy/helper/detectLocaleFromTimezone";
import { LanguageKey } from "brancy/i18n";
import RingLoader from "brancy/components/design/loader/ringLoder";
import styles from "./reactPhoneInput.module.css";

const ReactPhoneInput = (prop: {
  natinalNumber: string;
  loading: boolean;
  handlePhoneChange: (value: string, country: { dialCode: string; countryCode: string }) => void;
}) => {
  const { t } = useTranslation();
  const [defaultCountry, setDefaultCountry] = useState("gb");
  const [preferredCountries, setPreferredCountries] = useState<string[] | undefined>(undefined);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      console.log("Enter pressed - Trigger Send Verification Code");
      (document.querySelector(".saveButton") as HTMLElement)?.click();
    }
  };

  const handlePhoneChangeWrapper = (value: string, country: { dialCode: string; countryCode: string }) => {
    // Normalize Persian (۰-۹) and Arabic-Indic (٠-٩) digits to English (0-9)
    const normalizedValue = value
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48));

    prop.handlePhoneChange(normalizedValue, country);
  };
  useEffect(() => {
    // Use centralized timezone detection
    const detectedCountry = getCountryCodeFromTimezone();
    setDefaultCountry(detectedCountry);
  }, []);
  return (
    <div className={styles.inputcodesection}>
      <PhoneInput
        key={preferredCountries ? preferredCountries.join(",") : "default"}
        inputClass={styles.inputtelsection}
        dropdownClass={styles.dropdown}
        buttonClass={styles.country}
        inputProps={{
          name: "phone",
          required: true,
          autoFocus: true,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            const input = event.currentTarget;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            // Normalize Persian (۰-۹) and Arabic-Indic (٠-٩) digits to English (0-9)
            const normalized = input.value
              .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
              .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48));
            if (input.value !== normalized) {
              input.value = normalized;
              input.setSelectionRange(start, end);
            }
          },
          onKeyDown: handleKeyDown,
        }}
        country={defaultCountry}
        placeholder="Enter phone number"
        preferredCountries={preferredCountries || []}
        autoFormat={true}
        enableSearch={true}
        searchNotFound="Country not found"
        searchPlaceholder="🔍 Search"
        value={prop.natinalNumber}
        onChange={handlePhoneChangeWrapper}
        isValid={(value: string) => {
          const normalizedValue = value
            .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660))
            .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0));
          return /^\d+$/.test(normalizedValue);
        }}
      />

      <button
        disabled={prop.loading || prop.natinalNumber.length === 0}
        className={prop.natinalNumber.length > 0 ? "saveButton" : "disableButton"}
        type="submit">
        {prop.loading ? <RingLoader /> : t(LanguageKey.SendVerificationCode)}
      </button>
    </div>
  );
};

export default ReactPhoneInput;
