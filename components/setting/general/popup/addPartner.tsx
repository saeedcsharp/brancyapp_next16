import Head from "next/head";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import PhoneInput from "brancy/components/design/phoneInput";
import type { PhoneValue } from "brancy/components/design/phoneInput";
import SetTimeAndDate from "brancy/components/dateAndTime/setTimeAndDate";
import InputBox from "brancy/components/design/inputBox/inputBox";
import RadioButton from "brancy/components/design/radioButton/radioButton";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import ToggleCheckBoxButton from "brancy/components/design/switchButton/switchButton";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import styles from "./addPartner.module.css";
import { PartnerRole } from "brancy/models/enums";
import { IPartner, ICreatePartner, IUpdatePartner } from "brancy/models/interfaces";
import Tooltip from "brancy/components/design/tooltip/tooltip";
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
    const rolesForSave = createPartner.roles.filter(
      (role) => role !== PartnerRole.Publish || createPartner.roles.includes(PartnerRole.PageView),
    );
    const handleOptionChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setCheckBox(
        e.target.name === "Permanent" ? { permanent: true, periodic: false } : { permanent: false, periodic: true },
      );
    }, []);
    const handleSaveNewPartner = useCallback(() => {
      if (partner?.userId !== 0) {
        const updatePartner: IUpdatePartner = {
          expireTime: checkBox.periodic ? (createPartner.expireTime! / 1000) | 0 : null,
          roles: rolesForSave,
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
          roles: rolesForSave,
          name: createPartner.name,
        };
        console.log("addPartner", addPartner);
        handleSavePartner(addPartner);
      }
    }, [checkBox, createPartner, handleSavePartner, handleUpdatePartner, rolesForSave]);
    function handleSelectRole(e: React.ChangeEvent<HTMLInputElement>): void {
      const role = PartnerRole[e.target.name as keyof typeof PartnerRole];
      if (role === PartnerRole.Publish && !createPartner.roles.includes(PartnerRole.PageView)) {
        return;
      }

      if (e.target.checked) {
        setCreatePartner((prev) => ({
          ...prev,
          roles: prev.roles.includes(role) ? prev.roles : [...prev.roles, role],
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
    const handlePhoneChange = (value: PhoneValue) => {
      setCreatePartner((prev) => ({
        ...prev,
        countryCode: value.countryCode,
        phoneNumber: value.e164,
      }));
    };

    function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
      const newValue = e.target.value;
      // For example, if you had a local state for the partner's name you could update it:
      // setPartnerName(newValue);
      console.log("Partner name input changed to:", newValue);
      setCreatePartner((prev) => ({ ...prev, name: newValue }));
    }

    const isSaveDisabled =
      (partner?.userId === 0 && createPartner.phoneNumber.length === 0) || rolesForSave.length === 0;

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
              <ToggleButton
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
                    <InputBox
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
                        <InputBox
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

                        <PhoneInput
                          numberInputName="phone"
                          defaultCountry={defaultCountry}
                          preferredCountries={preferredCountries || []}
                          enableFormatting={true}
                          enableSearch={true}
                          onChange={handlePhoneChange}
                          validate={(value: PhoneValue) => value.nationalNumber.length > 0 && value.isValid}
                          autoFocus
                        />
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
                      <div className="title">
                        {t(LanguageKey.content)}{" "}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_contentTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.PageView)}
                        title={"PageView"}
                        name={"PageView"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.publish)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_publishTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Publish)}
                        disabled={!createPartner.roles.includes(PartnerRole.PageView)}
                        title={"Publish"}
                        name={"Publish"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.automatic)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_automaticsTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Automatics)}
                        title={"Automatics"}
                        name={"Automatics"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.navbar_Direct)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_messageTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Message)}
                        title={"Message"}
                        name={"Message"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.comment)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_commentTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Comment)}
                        title={"Comment"}
                        name={"Comment"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.navbar_Payment)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_transactionTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Transaction)}
                        title={"Transaction"}
                        name={"Transaction"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.SettingGeneral_Advertise)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_adsTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Ads)}
                        title={"Ads"}
                        name={"Ads"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.navbar_Orders)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_ordersTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Orders)}
                        title={"Orders"}
                        name={"Orders"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.SettingGeneral_biolink)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_bioTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Bio)}
                        title={"Bio"}
                        name={"Bio"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.navbar_Ticket)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_ticketTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.SystemTicket)}
                        title={"SystemTicket"}
                        name={"SystemTicket"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="frameParent">
                      <div className="title">
                        {t(LanguageKey.product_Producttitle)}
                        <Tooltip
                          triggerType="tooltip"
                          tooltipValue={t(LanguageKey.SettingGeneral_productsTooltip)}
                          position="bottom"
                          onClick={true}
                        />
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={(e) => handleSelectRole(e)}
                        checked={createPartner.roles.includes(PartnerRole.Products)}
                        title={"Products"}
                        name={"Products"}
                        role={"switch"}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="ButtonContainer">
              <button onClick={removeMask} className="cancelButton">
                {t(LanguageKey.cancel)}
              </button>
              <button
                disabled={isSaveDisabled}
                onClick={handleSaveNewPartner}
                className={isSaveDisabled ? "disableButton" : "saveButton"}>
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
