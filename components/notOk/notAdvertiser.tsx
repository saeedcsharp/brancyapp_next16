import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import { MethodType } from "../../helper/api";
import {
  BusinessBankAccountType,
  CreateShopperSteps,
  CreateShopStep,
  IdentityVerifyType,
} from "../../models/store/enum";
import RingLoader from "../design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import CardNumber from "../store/bankAccountType/cardNumber";
import NationalCard from "../store/countryType/nationaCard";
import TermsAndCondition from "../store/termsandcondition/termsandcondition";
import Loading from "./loading";
import styles from "./notAdvertiser.module.css";
import { clientFetchApi } from "../../helper/clientFetchApi";

export default function NotAdvertiser() {
  const { data: session, update } = useSession();
  const [verifyType, setVerifyType] = useState<IdentityVerifyType>(IdentityVerifyType.NationalCard);
  const [bankAccountType, setBankAccountType] = useState<BusinessBankAccountType>(BusinessBankAccountType.CardNumber);
  const [steps, setSteps] = useState<CreateShopperSteps>(CreateShopperSteps.AuthorizeUser);
  // Removed Address step: no need for inputTypeAddress
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  // Removed Shipping step: no need for logistic
  const [finalLoading, setFinalLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const hasCalledGetAuthorizeLevel = useRef(false);

  async function getAuthorizeUserType() {
    try {
      const res = await clientFetchApi<boolean, IdentityVerifyType>("/api/authorize/GetAuthorizeUserType", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else {
        setVerifyType(res.value);
        setSteps(CreateShopperSteps.AuthorizeUser);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }

  async function getInstagramerAuthorizeType() {
    try {
      const res = await clientFetchApi<boolean, BusinessBankAccountType>("/api/authorize/GetInstagramerAuthorizeType", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else {
        setBankAccountType(res.value);
        setSteps(CreateShopperSteps.CardNumber);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }

  // Removed Address step handler

  // Removed Shipping step handler

  async function getAuthorizeLevel() {
    try {
      const res = await clientFetchApi<boolean, number>("/api/authorize/GetAuthorizeLevel", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "isShopper", value: "1" }], onUploadProgress: undefined });
      console.log("AddAdvertiserAddress", res.value);

      if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
        return; // جلوگیری از اجرای بقیه کد و نمایش دوباره notify
      } else if (res.value === CreateShopStep.None) {
        getAuthorizeUserType();
      } else if (res.value === CreateShopStep.UserAuthorize) {
        getInstagramerAuthorizeType();
      }
      // Skip Address and Shipping steps - go directly to AddLogistic
      else if (
        res.value === CreateShopStep.InstagramerAuthorize ||
        res.value === CreateShopStep.AddShopperAddress ||
        res.value === CreateShopStep.AddLogesticService
      ) {
        setSteps(CreateShopperSteps.AddLogistic);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAdvertiser() {
    setFinalLoading(true);
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/authorize/CreateAdvertiser", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else {
        await update({
          ...session,
          user: {
            ...session?.user,
            isBusiness: true, // تغییر برای advertiser
          },
        });
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setFinalLoading(false);
    }
  }

  useEffect(() => {
    if (!session || hasCalledGetAuthorizeLevel.current) return;
    hasCalledGetAuthorizeLevel.current = true;
    getAuthorizeLevel();
  }, [session]);

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <main className={styles.background}>
          <header className={styles.header}>
            <div className="headerparent">
              <div className="instagramprofile">
                <svg
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="68"
                  height="68"
                  viewBox="0 0 56 56"
                  aria-hidden="true"
                  focusable="false">
                  <rect x=".5" y=".5" width="55" height="55" rx="35.5" fill="var(--color-purple30)"></rect>
                  <rect x=".5" y=".5" width="55" height="55" rx="35.5" stroke="var(--color-purple60)"></rect>
                  <path
                    d="M23.7 14h8.6q1.6 0 2.5 1l6.2 6.2q1 1 1 2.5v8.6q0 1.5-1 2.5L34.8 41q-1 1-2.5 1h-8.6q-1.5 0-2.5-1L15 34.8q-1-1-1-2.5v-8.6q0-1.5 1-2.5l6.2-6.2q1-1 2.5-1"
                    fill="var(--color-purple30)"></path>
                  <path
                    d="m36 30.6-2-1a1 1 0 0 0-1.5.4 1 1 0 0 0 .5 1.4l2 1a1 1 0 0 0 1.5-.4 1 1 0 0 0-.5-1.4m-6.2-8q-.7-.3-1.3 0s-1.5 1-3 1h-2.4c-2 0-3.7 1.7-3.7 3.7q.1 2.6 2.4 3.4v1.5a1.2 1.2 0 0 0 2.5 0V31h1.2c1.5 0 3 1 3 1q.7.3 1.3 0t.6-1v-7.3q0-.8-.6-1.1m-1.4 6.7q-1.2-.5-2.8-.6h-2.8q-1.3-.1-1.4-1.4.1-1.3 1.4-1.4h2.8q1.6 0 2.8-.5zm5.1-.9h2q1-.1 1.1-1-.1-1-1-1.1h-2.1a1 1 0 0 0-1.1 1q.1 1 1 1m.6-3.2 2-1q.8-.6.5-1.4a1 1 0 0 0-1.4-.5l-2.1 1a1 1 0 0 0-.5 1.4q.5 1 1.4.5"
                    fill="var(--color-purple)"></path>
                </svg>
                {/* <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 73">
                  <rect x=".5" y="1" width="71" height="71" rx="35.5" fill="var(--color-purple10)" />
                  <rect x=".5" y="1" width="71" height="71" rx="35.5" stroke="var(--color-purple60)" />
                  <path
                    d="M17.6 54.9c3.2 3.5 10.8 3.6 18.4 3.7 7.6-.1 15.2-.2 18.4-3.7 3.5-3.2 3.6-10.8 3.7-18.4-.1-7.6-.2-15.2-3.7-18.4-3.2-3.5-10.8-3.6-18.4-3.7-7.6.1-15.2.2-18.4 3.7-3.5 3.2-3.6 10.8-3.7 18.4.1 7.6.2 15.2 3.7 18.4"
                    fill="var(--color-light-blue30)"
                  />
                  <path
                    d="M40.7 24.3c3.3 0 6 2.4 6.4 5.7l1.2 11.2v.4a7 7 0 0 1-6.8 7.1h-11c-4 0-7.2-3.5-6.8-7.5L24.9 30a6.4 6.4 0 0 1 6.4-5.7zm-9.4 3a3.4 3.4 0 0 0-3.5 3l-1.1 11.2a4 4 0 0 0 3.8 4.3h11a4 4 0 0 0 3.9-4v-.3l-1.2-11.2c-.2-1.7-1.7-3-3.5-3z"
                    fill="var(--color-light-blue)"
                  />
                  <path
                    d="M30.8 31.3a1.5 1.5 0 1 1 3 0 2.2 2.2 0 1 0 4.4 0 1.5 1.5 0 0 1 3 0 5.2 5.2 0 0 1-10.4 0"
                    fill="var(--color-light-blue)"
                  />
                </svg> */}
                <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                  <div className="title">{t(LanguageKey.signinyouradvertise)}</div>
                  <div className="explain">{t(LanguageKey.signinyouradvertiseExplain)}</div>
                </div>
              </div>

              <button
                style={{ borderRadius: "var(--br50)" }}
                className={`saveButton ${styles.btn} ${
                  steps !== CreateShopperSteps.AddLogistic || !termsAccepted ? "fadeDiv" : ""
                }`}
                onClick={handleCreateAdvertiser}
                disabled={steps !== CreateShopperSteps.AddLogistic || !termsAccepted}>
                {finalLoading ? <RingLoader /> : t(LanguageKey.activate)}
              </button>
            </div>
          </header>
          <div className={styles.progressContainer}>
            {/* مرحله 1: احراز هویت */}
            {steps === CreateShopperSteps.AuthorizeUser && verifyType === IdentityVerifyType.NationalCard && (
              <NationalCard
                handleShowCredit={(bankAccount: BusinessBankAccountType) => {
                  setBankAccountType(bankAccount);
                  setSteps(CreateShopperSteps.CardNumber);
                }}
              />
            )}
            {steps !== CreateShopperSteps.AuthorizeUser && (
              <div className={`${styles.progressStep} ${styles.progressStepSuccess}`}>
                <div className="headerparent">
                  <div className="instagramprofile">
                    <img width="25px" height="25px" src={"/click-hashtag.svg"} />
                    <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                      <div className="title">{t(LanguageKey.Storeproduct_needyourID)}</div>
                      <div className="explain">{t(LanguageKey.Storeproduct_successyourID)}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.UploadContainer}></div>
              </div>
            )}
            {/* مرحله 2: شماره کارت */}
            {steps === CreateShopperSteps.AuthorizeUser && (
              <div className={`${styles.progressStep} `}>
                <div className="headerparent">
                  <div className="instagramprofile">
                    <img width="30px" height="30px" src={"/attention.svg"} />
                    <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                      <div className="title">{t(LanguageKey.Storeproduct_addcreditnumber)}</div>
                      <div className="explain">
                        {steps === CreateShopperSteps.AuthorizeUser
                          ? t(LanguageKey.Storeproduct_addcreditnumberExplain)
                          : t(LanguageKey.Storeproduct_successnumber)}
                      </div>
                    </div>
                  </div>
                  <button className={`${styles.btn} cancelButton  fadeDiv`} disabled={true}>
                    {t(LanguageKey.add)}
                  </button>
                </div>
                <div className={styles.UploadContainer}></div>
              </div>
            )}
            {steps === CreateShopperSteps.CardNumber && bankAccountType === BusinessBankAccountType.CardNumber && (
              <CardNumber
                handleShowAddress={() => {
                  setSteps(CreateShopperSteps.AddLogistic);
                }}
              />
            )}
            {/* Removed Address and Shipping progress step */}
            {/* Removed Address step: PostalCode */}
            {/* Removed Shipping progress step */}
            {/* Removed Address/Shipping disabled step */}
            {/* Removed Shipping step: Logistic */}
            {steps === CreateShopperSteps.AddLogistic && (
              <div className={`${styles.progressStep} ${styles.progressStepSuccess}`}>
                <div className="headerparent">
                  <div className="instagramprofile">
                    <img width="25px" height="25px" src={"/click-hashtag.svg"} />
                    <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                      <div className="title">{t(LanguageKey.Storeproduct_shippingmethod)}</div>
                      <div className="explain">{t(LanguageKey.Storeproduct_shippingmethodsuccess)}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.UploadContainer}></div>
              </div>
            )}
            {/* Removed Address/Shipping disabled shipping method step */}
            {/* مرحله 3: قوانین و مقررات */}
            {steps === CreateShopperSteps.AddLogistic && <TermsAndCondition onAccept={setTermsAccepted} />}
            {(steps === CreateShopperSteps.AuthorizeUser || steps === CreateShopperSteps.CardNumber) && (
              <div className={styles.progressStep}>
                <div className="headerparent">
                  <div className="instagramprofile">
                    <img width="30px" height="30px" src="/attention.svg" />
                    <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                      <div className="title">{t(LanguageKey.Storeproduct_TermsAndCondition)}</div>
                      <div className="explain">{t(LanguageKey.Storeproduct_TermsAndConditionExplain)}</div>
                    </div>
                  </div>
                  <button className={`${styles.btn} cancelButton fadeDiv`} disabled={true}>
                    {t(LanguageKey.add)}
                  </button>
                </div>
                <div className={styles.UploadContainer}></div>
              </div>
            )}
          </div>
        </main>
      )}
    </>
  );
}
