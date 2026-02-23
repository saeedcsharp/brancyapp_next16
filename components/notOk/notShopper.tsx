import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import { MethodType } from "../../helper/api";
import {
  BusinessBankAccountType,
  CreateShopperSteps,
  CreateShopStep,
  IdentityVerifyType,
} from "../../models/store/enum";
import { ILogistic, InputTypeAddress } from "../../models/userPanel/orders";
import RingLoader from "../design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import PostalCode from "../store/addressType/postalCode";
import CardNumber from "../store/bankAccountType/cardNumber";
import NationalCard from "../store/countryType/nationaCard";
import Logistic from "../store/logistic/logistic";
import TermsAndCondition from "../store/termsandcondition/termsandcondition";
import Loading from "./loading";
import styles from "./notShopper.module.css";
import { clientFetchApi } from "../../helper/clientFetchApi";

export default function NotShopper() {
  const { data: session, update } = useSession();
  const [verifyType, setVerifyType] = useState<IdentityVerifyType>(IdentityVerifyType.NationalCard);
  const [bankAccountType, setBankAccountType] = useState<BusinessBankAccountType>(BusinessBankAccountType.CardNumber);
  const [steps, setSteps] = useState<CreateShopperSteps>(CreateShopperSteps.AuthorizeUser);
  const [inputTypeAddress, setInputTypeAddress] = useState<InputTypeAddress | null>(null);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [logistic, setLogistic] = useState<ILogistic[]>([]);
  const [finalLoading, setFinalLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
  async function handleGetAddressInputType() {
    try {
      const res = await clientFetchApi<boolean, InputTypeAddress>("/api/address/GetAddressInputType", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        setInputTypeAddress(res.value);
        setSteps(CreateShopperSteps.Address);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  async function getShopLogistic() {
    try {
      const res = await clientFetchApi<boolean, ILogistic[]>("/api/authorize/GetShopLogestics", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        setLogistic(res.value);
        setSteps(CreateShopperSteps.Shipping);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  async function getAuthorizeLevel() {
    try {
      const res = await clientFetchApi<boolean, number>("/api/authorize/GetAuthorizeLevel", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "isShopper", value: "0" }], onUploadProgress: undefined });
      console.log("AddShopperAddress", res.value);

      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else if (res.value === CreateShopStep.None) getAuthorizeUserType();
      else if (res.value === CreateShopStep.UserAuthorize) getInstagramerAuthorizeType();
      else if (res.value === CreateShopStep.InstagramerAuthorize) handleGetAddressInputType();
      else if (res.value === CreateShopStep.AddShopperAddress) {
        getShopLogistic();
      } else if (res.value === CreateShopStep.AddLogesticService) {
        setSteps(CreateShopperSteps.AddLogistic);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  async function handleCreateShopper() {
    setFinalLoading(true);
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/authorize/CreateShopper", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else {
        await update({
          ...session,
          user: {
            isShopper: true,
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
    if (!session) return;
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
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 73">
                  <rect x=".5" y="1" width="71" height="71" rx="35.5" fill="var(--color-light-green10)" />
                  <rect x=".5" y="1" width="71" height="71" rx="35.5" stroke="var(--color-light-green60)" />
                  <path
                    d="M17.6 54.9c3.2 3.5 10.8 3.6 18.4 3.7 7.6-.1 15.2-.2 18.4-3.7 3.5-3.2 3.6-10.8 3.7-18.4-.1-7.6-.2-15.2-3.7-18.4-3.2-3.5-10.8-3.6-18.4-3.7-7.6.1-15.2.2-18.4 3.7-3.5 3.2-3.6 10.8-3.7 18.4.1 7.6.2 15.2 3.7 18.4"
                    fill="var(--color-light-green30)"
                  />
                  <path
                    d="M40.7 24.3c3.3 0 6 2.4 6.4 5.7l1.2 11.2v.4a7 7 0 0 1-6.8 7.1h-11c-4 0-7.2-3.5-6.8-7.5L24.9 30a6.4 6.4 0 0 1 6.4-5.7zm-9.4 3a3.4 3.4 0 0 0-3.5 3l-1.1 11.2a4 4 0 0 0 3.8 4.3h11a4 4 0 0 0 3.9-4v-.3l-1.2-11.2c-.2-1.7-1.7-3-3.5-3z"
                    fill="var(--color-light-green)"
                  />
                  <path
                    d="M30.8 31.3a1.5 1.5 0 1 1 3 0 2.2 2.2 0 1 0 4.4 0 1.5 1.5 0 0 1 3 0 5.2 5.2 0 0 1-10.4 0"
                    fill="var(--color-light-green)"
                  />
                </svg>
                <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                  <div className="title">{t(LanguageKey.signinyourstore)}</div>
                  <div className="explain">{t(LanguageKey.signinyourstoreExplain)}</div>
                </div>
              </div>

              <button
                style={{ borderRadius: "var(--br50)" }}
                className={`saveButton ${styles.btn} ${
                  steps !== CreateShopperSteps.AddLogistic || !termsAccepted ? "fadeDiv" : ""
                }`}
                onClick={handleCreateShopper}
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
                handleShowAddress={(addressType: InputTypeAddress) => {
                  setInputTypeAddress(addressType);
                  setSteps(CreateShopperSteps.Address);
                }}
              />
            )}
            {(steps === CreateShopperSteps.Address ||
              steps === CreateShopperSteps.Shipping ||
              steps === CreateShopperSteps.AddLogistic) && (
              <div className={`${styles.progressStep} ${styles.progressStepSuccess}`}>
                <div className="headerparent">
                  <div className="instagramprofile">
                    <img width="25px" height="25px" src={"/click-hashtag.svg"} />
                    <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                      <div className="title">{t(LanguageKey.Storeproduct_addcreditnumber)}</div>
                      <div className="explain">{t(LanguageKey.Storeproduct_successnumber)}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.UploadContainer}></div>
              </div>
            )}
            {/* مرحله 3: کدپستی و لوکیشن */}
            {steps === CreateShopperSteps.Address && inputTypeAddress === InputTypeAddress.PostalCode && (
              <PostalCode
                handleShowLogestic={(logistics: ILogistic[]) => {
                  setLogistic(logistics);
                  setSteps(CreateShopperSteps.Shipping);
                }}
              />
            )}
            {(steps === CreateShopperSteps.Shipping || steps === CreateShopperSteps.AddLogistic) && (
              <div className={`${styles.progressStep} ${styles.progressStepSuccess}`}>
                <div className="headerparent">
                  <div className="instagramprofile">
                    <img width="25px" height="25px" src={"/click-hashtag.svg"} />
                    <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                      <div className="title">{t(LanguageKey.Storeproduct_postalcode)}</div>
                      <div className="explain">
                        {steps === CreateShopperSteps.Shipping || steps === CreateShopperSteps.AddLogistic
                          ? t(LanguageKey.Storeproduct_postalcodesuccess)
                          : t(LanguageKey.Storeproduct_postalcodeExplain)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.UploadContainer}></div>
              </div>
            )}
            {(steps === CreateShopperSteps.AuthorizeUser || steps === CreateShopperSteps.CardNumber) && (
              <div className={styles.progressStep}>
                <div className="headerparent">
                  <div className="instagramprofile">
                    <img width="30px" height="30px" src={"/attention.svg"} />
                    <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                      <div className="title">{t(LanguageKey.Storeproduct_postalcode)}</div>
                      <div className="explain">{t(LanguageKey.Storeproduct_postalcodeExplain)}</div>
                    </div>
                  </div>
                  <button className={`${styles.btn} cancelButton  fadeDiv`} disabled={true}>
                    {t(LanguageKey.add)}
                  </button>
                </div>
                <div className={`${styles.UploadContainer} ${styles.hide}`}>
                  <div className="headerandinput">
                    <button type="button" className={styles.uploadActionBtn} style={{ marginTop: 12, marginBottom: 8 }}>
                      {location ? "موقعیت انتخاب شد" : "انتخاب موقعیت روی نقشه"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* مرحله 4: روش ارسال */}
            {steps === CreateShopperSteps.Shipping && (
              <Logistic shippingList={logistic} handleAddLogistic={() => setSteps(CreateShopperSteps.AddLogistic)} />
            )}
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
            {(steps === CreateShopperSteps.Address ||
              steps === CreateShopperSteps.AuthorizeUser ||
              steps === CreateShopperSteps.CardNumber) && (
              <>
                <div className={styles.progressStep}>
                  <div className="headerparent">
                    <div className="instagramprofile">
                      <img width="30px" height="30px" src="/attention.svg" />
                      <div className="headerandinput" style={{ gap: "var(--gap-5)" }}>
                        <div className="title">{t(LanguageKey.Storeproduct_shippingmethod)}</div>
                        <div className="explain">{t(LanguageKey.Storeproduct_shippingmethodExplain)}</div>
                      </div>
                    </div>
                    <button className={`${styles.btn} cancelButton  fadeDiv`} disabled={true}>
                      {t(LanguageKey.add)}
                    </button>
                  </div>
                  <div className={`${styles.UploadContainer} ${styles.hide}`}></div>
                </div>
              </>
            )}
            {/* مرحله 5: قوانین و مقررات */}
            {steps === CreateShopperSteps.AddLogistic && <TermsAndCondition onAccept={setTermsAccepted} />}
            {(steps === CreateShopperSteps.AuthorizeUser ||
              steps === CreateShopperSteps.CardNumber ||
              steps === CreateShopperSteps.Address ||
              steps === CreateShopperSteps.Shipping) && (
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
                <div className={`${styles.UploadContainer} ${styles.hide}`}></div>
              </div>
            )}
          </div>
        </main>
      )}
    </>
  );
}
