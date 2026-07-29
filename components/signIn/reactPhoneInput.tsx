import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "brancy/components/design/phoneInput";
import type { PhoneValue } from "brancy/components/design/phoneInput";
import { getCountryCodeFromTimezone } from "brancy/helper/detectLocaleFromTimezone";
import { LanguageKey } from "brancy/i18n";
import RingLoader from "brancy/components/design/loader/ringLoder";
import styles from "./reactPhoneInput.module.css";

const ReactPhoneInput = (prop: {
  natinalNumber: string;
  loading: boolean;
  handlePhoneChange: (value: string, country: { dialCode: string; countryCode: string }) => void;
  onDetectedCountry?: (countryCode: string) => void;
  countryCode?: string;
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

  const handlePhoneChangeWrapper = (value: PhoneValue) =>
    prop.handlePhoneChange(value.nationalNumber, { dialCode: value.dialCode, countryCode: value.countryCode });
  useLayoutEffect(() => {
    // Use centralized timezone detection
    const detectedCountry = getCountryCodeFromTimezone();
    console.log("prop.countryCode", prop.countryCode);
    setDefaultCountry(detectedCountry);
    prop.onDetectedCountry?.(detectedCountry);
  }, []);
  return (
    <div className={styles.inputcodesection}>
      <PhoneInput
        numberInputName="phone"
        numberInputClassName={styles.inputtelsection}
        defaultCountry={defaultCountry}
        preferredCountries={preferredCountries || []}
        enableFormatting={true}
        enableSearch={true}
        value={prop.natinalNumber}
        onChange={handlePhoneChangeWrapper}
        validate={(value: PhoneValue) => value.nationalNumber.length > 0 && value.isValid}
        country={prop.countryCode}
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
