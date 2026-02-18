import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import RadioButton from "saeed/components/design/radioButton";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import Loading from "saeed/components/notOk/loading";
import { handleCopyLink } from "saeed/helper/copyLink";
import useHideDiv from "saeed/hook/useHide";
import { LanguageKey } from "saeed/i18n";
import { InstagramerAccountInfo } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/api";
import { CustomDomainStatus } from "saeed/models/market/enums";
import { DomainType, ICustomeDomainInfo } from "saeed/models/market/properties";
import styles from "./domainManager.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const baseShortUrl = process.env.NEXT_PUBLIC_SHORT_LINK;
const DomainManager = ({ instagramerInfo }: { instagramerInfo: InstagramerAccountInfo | null }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { gridSpan, hidePage, toggle } = useHideDiv(true, 82);
  const [loading, setLoading] = useState(true);
  const [instaInfo, setInstaInfo] = useState<InstagramerAccountInfo>();
  const [customeDomain, setCustomeDomain] = useState<ICustomeDomainInfo | null>(null);
  const [domainType, setDomainType] = useState<DomainType>(DomainType.BrancyDefault);
  const [inputText, setInputText] = useState("");
  useEffect(() => {
    if (instagramerInfo) {
      setInstaInfo(instagramerInfo);
      setLoading(false);
    }
  }, [instagramerInfo]);
  async function getCustomerInfo() {
    const instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    if (!instagramerId) return;
    const res = await clientFetchApi<boolean, ICustomeDomainInfo>("Instagramer" + "/Bio/GetCustomDomain", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });

    if (res.succeeded) {
      setCustomeDomain(res.value);
      if (res.value.isActive) setDomainType(DomainType.CustomeName);
    } else {
      setCustomeDomain(null);
      setDomainType(DomainType.BrancyDefault);
    }
  }
  async function handleToggleRadioButton(type: DomainType) {
    setDomainType(type);
    const query = type === DomainType.BrancyDefault ? "false" : "true";
    const instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    if (!instagramerId) return;
    const res = await clientFetchApi<boolean, boolean>("Instagramer" + "/Bio/ToggleCustomDomain", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "enabled", value: query }], onUploadProgress: undefined });
    if (res.succeeded) {
    }
  }
  async function handleRequestCustomAddress() {
    if (!handleCheckRequest()) return;
    const instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    if (!instagramerId) return;
    const res = await clientFetchApi<boolean, { url: string }>("Instagramer" + "/Bio/UpdateCustomDomain", { methodType: MethodType.post, session: session, data: { url: inputText }, queries: undefined, onUploadProgress: undefined });
    if (res.succeeded) {
    }
  }
  function handleCheckRequest() {
    if (
      customeDomain &&
      (customeDomain.status === CustomDomainStatus.Requested || customeDomain.status === CustomDomainStatus.Checking)
    )
      return false;
    return true;
  }

  useEffect(() => {
    getCustomerInfo();
  }, []);
  return (
    <div className="tooBigCard" style={gridSpan}>
      <div className={styles.all}>
        <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.marketProperties_DomainManager)}</div>
        </div>
        {hidePage && (
          <>
            {loading && <Loading />}
            {!loading && instaInfo && (
              <>
                <div className={styles.section}>
                  <div className="headerandinput">
                    <div className="title">{t(LanguageKey.marketProperties_DomainManagerexplain)}</div>
                    <div className="explain">{t(LanguageKey.marketProperties_DomainManagerexplain2)}</div>
                  </div>
                  <div className="headerandinput">
                    <div className="title2">
                      <RadioButton
                        name="domain"
                        id={t(LanguageKey.marketProperties_defaultAddress)}
                        textlabel={t(LanguageKey.marketProperties_defaultAddress)}
                        checked={domainType === DomainType.BrancyDefault}
                        handleOptionChanged={() => handleToggleRadioButton(DomainType.BrancyDefault)}
                        title={"Default Address"}
                      />
                      <Tooltip tooltipValue={t(LanguageKey.marketProperties_explain)} position="bottom" onClick={true}>
                        <img
                          loading="lazy"
                          decoding="async"
                          style={{
                            marginInline: "5px",
                            cursor: "pointer",
                            width: "15px",
                            height: "15px",
                          }}
                          src="/attention.svg"
                        />
                      </Tooltip>
                    </div>
                    <div className={`${styles.defaultaddress} translate`}>
                      <div
                        className={styles.defaultdomain}
                        onClick={() => window.open(`https://${instaInfo.username}.${baseShortUrl}`, "_blank")}
                        style={{ cursor: "pointer" }}>
                        www.
                        {instaInfo.username}.{baseShortUrl}
                      </div>
                      <img
                        style={{
                          width: "30px",
                          cursor: "pointer",
                          height: "30px",
                          padding: "var(--padding-5)",
                        }}
                        title="ℹ️ copy Domain"
                        alt="Copy Domain"
                        src="/copy.svg"
                        onClick={() => {
                          handleCopyLink(instaInfo.username + "." + baseShortUrl);
                        }}
                      />
                    </div>
                    <div className={`${styles.defaultaddress} translate`}>
                      <div
                        className={styles.defaultdomain}
                        onClick={() => window.open(`https://${baseShortUrl}/${instaInfo.username}`, "_blank")}
                        style={{ cursor: "pointer" }}>
                        www.
                        {baseShortUrl}/{instaInfo.username}
                      </div>
                      <img
                        style={{
                          width: "30px",
                          cursor: "pointer",
                          height: "30px",
                          padding: "var(--padding-5)",
                        }}
                        title="ℹ️ copy Domain"
                        alt="Copy Domain"
                        src="/copy.svg"
                        onClick={() => {
                          handleCopyLink(baseShortUrl + "/" + instaInfo.username);
                        }}
                      />
                    </div>
                  </div>
                  <div className="headerandinput fadeDiv">
                    <RadioButton
                      name="domain"
                      id={t(LanguageKey.marketProperties_CustomAddress)}
                      textlabel={t(LanguageKey.marketProperties_CustomAddress)}
                      checked={domainType === DomainType.CustomeName}
                      handleOptionChanged={() => {
                        // handleToggleRadioButton(DomainType.CustomeName)
                      }}
                      title="Custom Address"
                    />
                    <div className={`${styles.input} ${domainType === DomainType.BrancyDefault && "fadeDiv"}`}>
                      <div className="headerparent">
                        <InputText
                          className="textinputbox"
                          placeHolder="www.yourname.com"
                          name="domain"
                          handleInputChange={(e) => setInputText(e.currentTarget.value)}
                          value={customeDomain ? customeDomain.url : ""}
                        />
                        <button
                          onClick={handleRequestCustomAddress}
                          className={handleCheckRequest() ? "saveButton" : "disableButton"}
                          style={{ height: "40px", maxWidth: "90px" }}>
                          {(!customeDomain ||
                            customeDomain.status === CustomDomainStatus.Approved ||
                            customeDomain.status === CustomDomainStatus.Rejected) &&
                            t(LanguageKey.marketProperties_Request)}

                          {customeDomain &&
                            customeDomain.status === CustomDomainStatus.Requested &&
                            t(LanguageKey.marketProperties_Requested)}

                          {customeDomain &&
                            customeDomain.status === CustomDomainStatus.Checking &&
                            t(LanguageKey.marketProperties_Checking)}
                        </button>
                      </div>
                      {/* {customeDomain &&
                        customeDomain.status ===
                          CustomDomainStatus.Requested && <div>Requested</div>} */}
                      {customeDomain && customeDomain.status === CustomDomainStatus.Approved && (
                        <>
                          <div className={styles.defaultdomain}>{customeDomain.url}</div>
                          <img
                            style={{
                              width: "30px",
                              cursor: "pointer",
                              height: "30px",
                              padding: "var(--padding-5)",
                            }}
                            title="ℹ️ copy Domain"
                            alt="Copy Domain"
                            src="/copy.svg"
                            role="button"
                            aria-label="Copy custom domain"
                            onClick={() => {
                              handleCopyLink(customeDomain.url);
                            }}
                          />
                        </>
                      )}
                      {/* {customeDomain &&
                        customeDomain.status ===
                          CustomDomainStatus.Checking && <div>Checking</div>} */}
                      {customeDomain && customeDomain.status === CustomDomainStatus.Rejected && (
                        <div style={{ color: "red" }}>{t(LanguageKey.marketProperties_rejected)}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`${styles.section1} soon`}>
                  {instaInfo.isShopper && (
                    <>
                      <div className={styles.link}>
                        <div className="headertext">{t(LanguageKey.marketProperties_yourstore)}</div>
                        <div className={`${styles.defaultaddress} translate`}>
                          <div
                            className={styles.defaultdomain}
                            onClick={() =>
                              window.open(`https://${instaInfo.username}.${baseShortUrl}/Shopping`, "_blank")
                            }
                            style={{ cursor: "pointer" }}>
                            {instaInfo.username}.{baseShortUrl}/Shopping
                          </div>
                          <img
                            style={{
                              width: "30px",
                              cursor: "pointer",
                              height: "30px",
                              padding: "var(--padding-5)",
                            }}
                            title="ℹ️ copy Domain"
                            src="/copy.svg"
                            onClick={() => {
                              handleCopyLink(`${instaInfo.username}.${baseShortUrl}/Shopping`);
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {instaInfo.isBusiness && (
                    <>
                      <div className={styles.link}>
                        <div className="headertext">{t(LanguageKey.marketProperties_yourads)}</div>
                        <div className={`${styles.defaultaddress} translate`}>
                          <div
                            className={styles.defaultdomain}
                            onClick={() =>
                              window.open(`https://${instaInfo.username}.${baseShortUrl}/Advertise`, "_blank")
                            }
                            style={{ cursor: "pointer" }}>
                            {instaInfo.username}.{baseShortUrl}/Advertise
                          </div>
                          <img
                            style={{
                              width: "30px",
                              cursor: "pointer",
                              height: "30px",
                              padding: "var(--padding-5)",
                            }}
                            title="ℹ️ copy Domain"
                            src="/copy.svg"
                            onClick={() => {
                              handleCopyLink(`${instaInfo.username}.${baseShortUrl}/Advertise`);
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.link}>
                    <div className="headertext">{t(LanguageKey.marketProperties_yourtariff)}</div>
                    <div className={`${styles.defaultaddress} translate`}>
                      <div
                        className={styles.defaultdomain}
                        onClick={() => window.open(`https://${instaInfo.username}.${baseShortUrl}/Tariff`, "_blank")}
                        style={{ cursor: "pointer" }}>
                        {instaInfo.username}.{baseShortUrl}/Tariff
                      </div>
                      <img
                        style={{
                          width: "30px",
                          cursor: "pointer",
                          height: "30px",
                          padding: "var(--padding-5)",
                        }}
                        title="ℹ️ copy Domain"
                        src="/copy.svg"
                        onClick={() => {
                          handleCopyLink(`${instaInfo.username}.${baseShortUrl}/Tarrif`);
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.link}>
                    <div className="headertext">{t(LanguageKey.marketProperties_yourBusinesshours)}</div>
                    <div className={`${styles.defaultaddress} translate`}>
                      <div
                        className={styles.defaultdomain}
                        onClick={() => window.open(`https://${instaInfo.username}.${baseShortUrl}/workHour`, "_blank")}
                        style={{ cursor: "pointer" }}>
                        {instaInfo.username}.{baseShortUrl}/workHour
                      </div>
                      <img
                        style={{
                          width: "30px",
                          cursor: "pointer",
                          height: "30px",
                          padding: "var(--padding-5)",
                        }}
                        title="ℹ️ copy Domain"
                        src="/copy.svg"
                        onClick={() => {
                          handleCopyLink(`${instaInfo.username}.${baseShortUrl}/workHour`);
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.link}>
                    <div className="headertext">{t(LanguageKey.marketProperties_yourBusinessTerms)}</div>
                    <div className={`${styles.defaultaddress} translate`}>
                      <div
                        className={styles.defaultdomain}
                        onClick={() => window.open(`https://${instaInfo.username}.${baseShortUrl}/Terms`, "_blank")}
                        style={{ cursor: "pointer" }}>
                        {instaInfo.username}.{baseShortUrl}/Terms
                      </div>
                      <img
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "30px",
                          cursor: "pointer",
                          height: "30px",
                          padding: "var(--padding-5)",
                        }}
                        title="ℹ️ copy Domain"
                        src="/copy.svg"
                        onClick={() => {
                          handleCopyLink(`${instaInfo.username}.${baseShortUrl}/Terms`);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DomainManager;
