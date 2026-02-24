import Head from "next/head";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import PhoneInput from "react-phone-input-2";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import InputText from "brancy/components/design/inputText";
import RadioButton from "brancy/components/design/radioButton";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import { getCountryCodeFromTimezone } from "brancy/helper/detectLocaleFromTimezone";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import {
  ICreatePartner,
  IPartner,
  IUpdatePartner,
  PartnerRole,
} from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import styles from "./addPartner.module.css";
const AddPartner = React.memo(
  ({
    partner,
    removeMask,
    handleSavePartner,
    handleShowDeletePartner,
    handleUpdatePartner,
  }: {
    partner: IPartner;
    removeMask: () => void;
    handleSavePartner: (addNewObj: ICreatePartner) => void;
    handleUpdatePartner: (addNewObj: IUpdatePartner) => void;
    handleShowDeletePartner: (addNewObj: IPartner) => void;
  }) => {
    const { t } = useTranslation();
    const [checkBox, setCheckBox] = useState({
      permanent: partner?.expireTime === null,
      periodic: partner?.expireTime !== null,
    });
    const [defaultCountry, setDefaultCountry] = useState("gb");
    const [preferredCountries, setPreferredCountries] = useState<string[] | undefined>(undefined);

    const [createPartner, setCreatePartner] = useState<ICreatePartner>({
      phoneNumber: partner?.phoneNumber || "",
      countryCode: partner?.countryCode || "",
      expireTime:
        partner?.userId !== 0 && partner?.expireTime !== null ? partner?.expireTime * 1e3 : Date.now() + 3960000,
      roles: partner?.roles || [],
      name: partner?.name || "",
    });
    const [showSetDateAndTime, setShowSetDateAndTime] = useState(false);
    const [activeTab, setActiveTab] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
    const handleOptionChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setCheckBox(
        e.target.name === "Permanent" ? { permanent: true, periodic: false } : { permanent: false, periodic: true },
      );
    }, []);
    const handleSaveNewPartner = useCallback(() => {
      if (partner?.userId !== 0) {
        const updatePartner: IUpdatePartner = {
          expireTime: checkBox.periodic ? (createPartner.expireTime! / 1000) | 0 : null,
          roles: createPartner.roles,
          userId: partner?.userId || 0,
          name: createPartner.name,
        };
        console.log("updatePartner", updatePartner);
        handleUpdatePartner(updatePartner);
      } else {
        const addPartner: ICreatePartner = {
          phoneNumber: createPartner.phoneNumber,
          countryCode: createPartner.countryCode,
          expireTime: checkBox.periodic ? (createPartner.expireTime! / 1000) | 0 : null,
          roles: createPartner.roles,
          name: createPartner.name,
        };
        console.log("addPartner", addPartner);
        handleSavePartner(addPartner);
      }
    }, [checkBox, createPartner, handleSavePartner]);
    function handleSelectRole(e: React.ChangeEvent<HTMLInputElement>): void {
      const role = PartnerRole[e.target.name as keyof typeof PartnerRole];
      if (e.target.checked) {
        setCreatePartner((prev) => ({
          ...prev,
          roles: [...prev.roles, role],
        }));
      } else {
        setCreatePartner((prev) => ({
          ...prev,
          roles: prev.roles.filter((r) => r !== role),
        }));
      }
    }
    function handleSaveDateAndTime(date: string | undefined) {
      // setRecTimeSelect(-1);
      if (date !== undefined) {
        let dateInt = parseInt(date);
        setCreatePartner((prev) => ({ ...prev, expireTime: dateInt }));
        setShowSetDateAndTime(false);
      }
    }
    const handlePhoneChange = (value: string, country: { dialCode: string; countryCode: string }) => {
      // Normalize Persian (۰-۹) and Arabic-Indic (٠-٩) digits to English (0-9)
      const normalizedValue = value
        .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
        .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48));

      setCreatePartner((prev) => ({
        ...prev,
        countryCode: country.countryCode,
        phoneNumber: normalizedValue,
      }));
    };

    function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
      const newValue = e.target.value;
      // For example, if you had a local state for the partner's name you could update it:
      // setPartnerName(newValue);
      console.log("Partner name input changed to:", newValue);
      setCreatePartner((prev) => ({ ...prev, name: newValue }));
    }
    useEffect(() => {
      // Use centralized timezone detection
      const detectedCountry = getCountryCodeFromTimezone();
      setDefaultCountry(detectedCountry);
    }, []);
    return (
      <>
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>Bran.cy ▸ {t(LanguageKey.SettingGeneral_addSubAdmin)}</title>
          <meta name="description" content="Advanced Instagram post management tool" />
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        </Head>
        {!showSetDateAndTime && (
          <>
            <div className="headerandinput">
              <div className="title">
                {partner?.userId !== 0 ? t(LanguageKey.edit) : t(LanguageKey.SettingGeneral_addSubAdmin)}
              </div>
              <div className="explain">{t(LanguageKey.SettingGeneral_addSubAdminExplain)}</div>
              <FlexibleToggleButton
                options={[
                  { label: t(LanguageKey.General), id: 0 },
                  { label: t(LanguageKey.SettingGeneral_access), id: 1 },
                ]}
                onChange={setActiveTab}
                selectedValue={activeTab}
              />
            </div>
            <div className={styles.all}>
              {activeTab === ToggleOrder.FirstToggle && (
                <>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.SettingGeneral_partnertitle)}</div>
                    <InputText
                      className={"textinputbox"}
                      handleInputChange={handleInputChange}
                      value={createPartner.name || ""}
                      maxLength={100}
                      dangerOnEmpty
                    />
                  </div>
                  <div className="headerandinput">
                    {partner?.userId !== 0 && (
                      <div className="headerandinput">
                        <div className="headertext">{t(LanguageKey.userpanel_MobileNumber)}</div>
                        <InputText
                          className={"textinputbox"}
                          value={partner?.phoneNumber || ""}
                          handleInputChange={() => {}}
                          disabled={true}
                          dangerOnEmpty
                        />
                      </div>
                    )}

                    {partner?.userId === 0 && (
                      <div className="headerandinput">
                        <div className="headertext">{t(LanguageKey.phonenumber)}</div>
                        <div className={styles.inputsection}>
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
                            }}
                            country={defaultCountry}
                            placeholder="Enter phone number"
                            preferredCountries={preferredCountries || []}
                            autoFormat={true}
                            enableSearch={true}
                            searchNotFound="Country not found"
                            searchPlaceholder="🔍 Search"
                            onChange={handlePhoneChange}
                            isValid={(value: string) => {
                              const normalizedValue = value
                                .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660))
                                .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0));
                              return /^\d+$/.test(normalizedValue);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="explain">{t(LanguageKey.SettingGeneral_partnernumberexplain)}</div>
                  </div>
                  <div className="headerandinput">
                    <div className="headertext">{t(LanguageKey.ExpirationTime)}</div>
                    <RadioButton
                      name="Permanent"
                      id={t(LanguageKey.permanent)}
                      checked={checkBox.permanent}
                      handleOptionChanged={handleOptionChanged}
                      textlabel={t(LanguageKey.permanent)}
                      title={t(LanguageKey.permanent)}
                    />
                    <div className="headerandinput">
                      <RadioButton
                        name="Periodic"
                        id={t(LanguageKey.ExpiresIn)}
                        checked={checkBox.periodic}
                        handleOptionChanged={handleOptionChanged}
                        textlabel={t(LanguageKey.ExpiresIn)}
                        title={t(LanguageKey.ExpiresIn)}
                      />
                      <div className={checkBox.periodic ? styles.calendar : `${styles.calendar} fadeDiv`}>
                        <div className={styles.input} role="presentation">
                          {new DateObject({
                            date: createPartner.expireTime || Date.now() + 3960000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("MM/DD/YYYY")}
                        </div>
                        <div className={styles.input} role="presentation">
                          {new DateObject({
                            date: createPartner.expireTime || Date.now() + 3960000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("hh:mm")}
                        </div>
                        <div className={styles.input} role="presentation">
                          {new DateObject({
                            date: createPartner.expireTime || Date.now() + 3960000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("A")}
                        </div>
                        {
                          <div
                            style={{ maxWidth: "42px" }}
                            onClick={() => {
                              setShowSetDateAndTime(true);
                            }}
                            className="saveButton"
                            role="button"
                            aria-label="Open date and time picker"
                            title="Select date and time">
                            <img alt="Calendar icon for date/time selection" src="/selectDate-item.svg" />
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === ToggleOrder.SecondToggle && (
                <>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.content)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Publish)}
                        title={"Publish"}
                        name={"Publish"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">Posts - Stories - Reels - IGTV - Carousels - Scheduling and ...</div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.navbar_Statistics)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.PageView)}
                        title={"PageView"}
                        name={"PageView"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">Page Views - Tools and ...</div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.navbar_Direct)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Message)}
                        title={"Message"}
                        name={"Message"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">Instagram Directs - Internal message - Tools and ...</div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.comment)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Comment)}
                        title={"Comment"}
                        name={"Comment"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">Comments and Replies - Tools and ...</div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.navbar_Payment)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Transaction)}
                        title={"Transaction"}
                        name={"Transaction"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">Payment Account Managing - Transactions Wallet - Tools and ...</div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.SettingGeneral_Advertise)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Ads)}
                        title={"Ads"}
                        name={"Ads"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">
                      Calendar managing - Advertisers Managing Reject and Accept Ads - Pricing -Tools and ...
                    </div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.navbar_Orders)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Orders)}
                        title={"Orders"}
                        name={"Orders"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">
                      List of products - Product Price - warehouse stock - Orders and WayBill - Tools and ...
                    </div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.SettingGeneral_Marketlink)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Bio)}
                        title={"Bio"}
                        name={"Bio"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">
                      Content and arrangement - Links and Third Party Content Shotcuts and ...
                    </div>
                  </div>

                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">{t(LanguageKey.navbar_Ticket)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.SystemTicket)}
                        title={"SystemTicket"}
                        name={"SystemTicket"}
                        role={"switch"}
                      />
                    </div>
                    <div className="explain">CRM - System Ticket - Support and ...</div>
                  </div>
                </>
              )}
            </div>
            <div className="ButtonContainer">
              <button onClick={removeMask} className="cancelButton">
                {t(LanguageKey.cancel)}
              </button>
              <button
                disabled={
                  (partner?.userId === 0 && createPartner.phoneNumber.length === 0) || createPartner.roles.length === 0
                }
                onClick={handleSaveNewPartner}
                className={
                  (partner?.userId === 0 && createPartner.phoneNumber.length === 0) || createPartner.roles.length === 0
                    ? "disableButton"
                    : "saveButton"
                }>
                {partner?.userId !== 0 ? t(LanguageKey.save) : t(LanguageKey.SettingGeneral_Send)}
              </button>
            </div>
          </>
        )}
        {showSetDateAndTime && (
          <SetTimeAndDate
            removeMask={() => setShowSetDateAndTime(false)}
            saveDateAndTime={handleSaveDateAndTime}
            backToNormalPicker={() => setShowSetDateAndTime(false)}
            startDay={createPartner.expireTime || Date.now() + 3960000}
            // fromUnix={Date.now() + 86400000}
          />
        )}
      </>
    );
  },
);

export default AddPartner;
