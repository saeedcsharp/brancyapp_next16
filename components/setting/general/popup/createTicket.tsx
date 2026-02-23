import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "../../../design/dragDrop/dragDrop";
import InputText from "../../../design/inputText";
import TextArea from "../../../design/textArea/textArea";
import { LanguageKey } from "../../../../i18n";
import {
  PlatformTicketItemType,
  PlatformTicketType,
} from "../../../../models/setting/enums";
import { ICreatePlatform } from "../../../../models/setting/general";

interface ICreateTicketProps {
  removeMask: () => void;
  handleCreateTicket: (ticketData: ICreatePlatform) => void;
}

const CreateTicket = React.memo(
  ({ removeMask, handleCreateTicket }: ICreateTicketProps) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<ICreatePlatform>({
      item: { imageUrl: "", itemType: PlatformTicketItemType.Text, text: "" },
      subject: "",
      type: 0,
    });
    const selectDepartment = useMemo(
      () => [
        <div id={PlatformTicketType.BugReport.toString()} key="bug">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 36 36">
              <path
                opacity=".4"
                d="M21.68 8.82a7 7 0 0 1 1.97.37 6.5 6.5 0 0 1 3.84 3.83q.3.88.36 1.98.06 1.05.05 2.72v5a9.9 9.9 0 1 1-19.8 0v-5q-.01-1.65.04-2.72a7 7 0 0 1 .37-1.98 6.5 6.5 0 0 1 3.83-3.83c.6-.23 1.25-.32 1.98-.37a53 53 0 0 1 2.72-.04h1.92q1.64-.01 2.72.04"
              />
              <path d="M19.13 32.56a10 10 0 0 1-2.25 0v-7.81a1.13 1.13 0 0 1 2.25 0zM15.52 8.78q.15-1.05.57-1.78c.37-.6.9-1 1.91-1s1.54.4 1.9 1q.45.72.58 1.78.66 0 1.2.04a7 7 0 0 1 1.85.32 8 8 0 0 0-1.06-3.7A5 5 0 0 0 18 3a5 5 0 0 0-4.47 2.44 8 8 0 0 0-1.06 3.7 7 7 0 0 1 1.86-.32zM9.6 11.15l-.37-.05A3.23 3.23 0 0 1 6 7.88V7.5a1.5 1.5 0 1 0-3 0v.38c0 3.1 2.28 5.68 5.25 6.14a6 6 0 0 1 1.34-2.87m-1.49 6.7H4.5a1.5 1.5 0 1 0 0 3h3.6zm.21 6.93A6.9 6.9 0 0 0 3 31.5a1.5 1.5 0 0 0 3 0 3.9 3.9 0 0 1 3.4-3.87 10 10 0 0 1-1.09-2.85m18.29 2.85A3.9 3.9 0 0 1 30 31.5a1.5 1.5 0 1 0 3 0c0-3.27-2.27-6-5.31-6.72a10 10 0 0 1-1.09 2.85m1.3-6.78h3.6a1.5 1.5 0 1 0 0-3h-3.6zm-.15-6.83A6.2 6.2 0 0 0 33 7.88V7.5a1.5 1.5 0 1 0-3 0v.38a3.23 3.23 0 0 1-3.23 3.22q-.2 0-.36.05a6.5 6.5 0 0 1 1.34 2.87" />
            </svg>
            {t(LanguageKey.SettingGeneral_ReportBug)}
          </div>
        </div>,
        <div id={PlatformTicketType.Other.toString()} key="general">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {t(LanguageKey.SettingGeneral_GeneralSupport)}
          </div>
        </div>,
        <div id={PlatformTicketType.Wallet.toString()} key="wallet">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            {t(LanguageKey.SettingGeneral_Walletandfinance)}
          </div>
        </div>,
        <div id={PlatformTicketType.Message.toString()} key="messaging">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
            </svg>
            {t(LanguageKey.SettingGeneral_MessageingandComment)}
          </div>
        </div>,
        <div id={PlatformTicketType.CustomerSupport.toString()} key="customer">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {t(LanguageKey.SettingGeneral_Customerservices)}
          </div>
        </div>,
        <div id={PlatformTicketType.Ad.toString()} key="advertise">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {t(LanguageKey.SettingGeneral_Advertise)}
          </div>
        </div>,
        <div id={PlatformTicketType.Shop.toString()} key="store">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {t(LanguageKey.SettingGeneral_Store)}
          </div>
        </div>,
        <div id={PlatformTicketType.LinkMarket.toString()} key="market">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {t(LanguageKey.SettingGeneral_Marketlink)}
          </div>
        </div>,
      ],
      [t]
    );

    const handleSelectDepartment = useCallback((index: number) => {
      setFormData((prev) => ({
        ...prev,
        type: parseInt(index.toString()),
      }));
    }, []);

    const handleInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setFormData((prev) => ({ ...prev, [name]: value }));
      },
      []
    );

    const handleTextareaChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
          ...prev,
          item: {
            ...prev.item,
            text: value,
            itemType: PlatformTicketItemType.Text,
          },
        }));
      },
      []
    );
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleCreateTicket(formData);
      removeMask();
    };

    const handleCancel = useCallback(() => {
      removeMask();
    }, [removeMask]);

    // Check if form has validation errors (empty required fields)
    const isFormInvalid = useMemo(() => {
      return (
        !formData.subject.trim() ||
        (!formData.item.text?.trim() && !formData.item.imageUrl?.trim())
      );
    }, [formData.subject, formData.item.text, formData.item.imageUrl]);
    return (
      <>
        <div className="frameParent">
          <div className="title">{t(LanguageKey.SettingGeneral_Support)}</div>
          <img
            onClick={handleCancel}
            style={{
              cursor: "pointer",
              width: "30px",
              height: "30px",
              alignSelf: "end",
            }}
            title="ℹ️ close"
            src="/close-box.svg"
          />
        </div>
        <form
          onSubmit={handleSubmit}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "var(--gap-20)",
          }}>
          <div className="headerandinput">
            <label htmlFor="department" className="headertext">
              {t(LanguageKey.SettingGeneral_Department)}
            </label>
            <DragDrop
              data={selectDepartment}
              handleOptionSelect={handleSelectDepartment}
            />
          </div>

          <div className="headerandinput">
            <label htmlFor="title" className="headertext">
              {t(LanguageKey.SettingGeneral_Title)}
            </label>
            <InputText
              id="subject"
              name="subject"
              className="textinputbox"
              placeHolder=""
              handleInputChange={handleInputChange}
              value={formData.subject}
              maxLength={100}
              dangerOnEmpty
            />
          </div>

          <div className="headerandinput" style={{ height: "100%" }}>
            <div className="headerparent">
              <label htmlFor="description" className="headertext">
                {t(LanguageKey.SettingGeneral_Description)}
              </label>
              <div className="counter">
                {formData.item.text?.length || 0}/6000
              </div>
            </div>
            <TextArea
              id="description"
              style={{ height: "100%" }}
              name="description"
              value={formData.item.text || ""}
              className="captiontextarea"
              maxLength={6000}
              role=""
              title=""
              handleInputChange={handleTextareaChange}
            />
          </div>
          <div className="ButtonContainer">
            <button
              type="submit"
              className={isFormInvalid ? "disableButton" : "saveButton"}
              disabled={isFormInvalid}>
              {t(LanguageKey.SettingGeneral_Send)}
            </button>
            <button
              type="button"
              className="cancelButton"
              onClick={handleCancel}>
              {t(LanguageKey.close)}
            </button>
          </div>
        </form>
      </>
    );
  }
);

CreateTicket.displayName = "CreateTicket";

export default CreateTicket;
export type { ICreatePlatform };
