import CounterDownNotRing, { CounterDownColor } from "brancy/components/design/counterDown/counterDownNotRing";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { NotifType, notify } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { handleCopyLink } from "brancy/helper/copyLink";
import { fetchAndCheckFeature } from "brancy/helper/checkFeature";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { InstagramerAccountInfo } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { IGetCustomDomain } from "brancy/models/market/properties";
import { FeatureType } from "brancy/models/psg/psg";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./domainManager.module.css";
const baseShortUrl = process.env.NEXT_PUBLIC_SHORT_LINK;
const DomainManager = ({ instagramerInfo }: { instagramerInfo: InstagramerAccountInfo | null }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const { gridSpan, hidePage, toggle } = useHideDiv(true, 82);
  const [loading, setLoading] = useState(true);
  const [instaInfo, setInstaInfo] = useState<InstagramerAccountInfo>();
  const [customeDomain, setCustomeDomain] = useState<IGetCustomDomain>({ acceptDomain: null, pendingDomain: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyCooldownUntil, setVerifyCooldownUntil] = useState<number>(0);
  const [inputText, setInputText] = useState("");
  const [hasCustomDomainFeature, setHasCustomDomainFeature] = useState<boolean | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const isCustomDomainActive =
    !!customeDomain.acceptDomain && hasCustomDomainFeature === true && customeDomain.acceptDomain.status === 0;
  useEffect(() => {
    if (instagramerInfo) {
      setInstaInfo(instagramerInfo);
      setLoading(false);
    }
  }, [instagramerInfo]);
  async function getCustomerInfo() {
    const res = await clientFetchApi<boolean, IGetCustomDomain>("Instagramer/Bio/GetCustomDomain", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
    });

    if (res.succeeded) {
      setCustomeDomain(res.value);
      // restore cooldown if lastCheckTime is within 5 minutes ago
      const lastCheck = res.value?.pendingDomain?.lastCheckTime;
      if (lastCheck) {
        const enableAt = lastCheck + 300;
        if (enableAt > Date.now() / 1000) {
          setVerifyCooldownUntil(enableAt);
        }
      }
    }
  }
  async function handleRequestCustomAddress() {
    if (isUpdating) return; // Prevent multiple clicks
    const hasFeature = await fetchAndCheckFeature(FeatureType.CustomDomain, session);
    if (!hasFeature) {
      router.push("/upgrade");
      return;
    }
    setIsUpdating(true);
    const res = await clientFetchApi<boolean, { url: string }>("Instagramer/Bio/UpdateCustomDomain", {
      methodType: MethodType.post,
      session: session,
      data: { uri: inputText },
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      getCustomerInfo();
    } else notify(res.info.responseType, NotifType.Warning);
    setIsUpdating(false);
  }
  function isValidDomain(value: string): boolean {
    if (!value || value.trim().length === 0) return false;
    // Remove http(s):// and www. prefixes for validation
    const cleaned = value
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "");
    // Must contain only valid domain characters (no underscore, no hyphen)
    if (!/^[a-zA-Z0-9][a-zA-Z0-9.]*\.[a-zA-Z]{2,}$/.test(cleaned)) return false;
    // Must not contain underscore or hyphen
    if (cleaned.includes("_") || cleaned.includes("-")) return false;
    // Must not be a subdomain (only one dot allowed after removing www)
    const parts = cleaned.split(".");
    if (parts.length > 2) return false;
    // Must not be brancy domains
    const forbidden = ["brancy.app", "bran.cy", "brncy.ir", "brancy.ir"];
    if (forbidden.includes(cleaned.toLowerCase())) return false;
    return true;
  }

  async function handleVerifyCustomAddress() {
    if (isVerifying) return; // Prevent multiple clicks
    const hasFeature = await fetchAndCheckFeature(FeatureType.CustomDomain, session);
    if (!hasFeature) {
      router.push("/upgrade");
      return;
    }
    setIsVerifying(true);
    const res = await clientFetchApi<boolean, boolean>("api/bio/verifyCustomDomainDns", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      await getCustomerInfo();
      // set 5-minute cooldown from now
      setVerifyCooldownUntil(Math.floor(Date.now() / 1000) + 300);
    } else notify(res.info.responseType, NotifType.Warning);
    setIsVerifying(false);
  }

  async function handleDeleteCustomDomain() {
    const res = await clientFetchApi<boolean, boolean>("api/bio/deleteCustomDomain", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      await getCustomerInfo();
    } else notify(res.info.responseType, NotifType.Warning);
  }

  async function handleConnectCustomAddress() {
    const hasFeature = await fetchAndCheckFeature(FeatureType.CustomDomain, session);
    if (!hasFeature) {
      router.push("/upgrade");
      return;
    }
    const res = await clientFetchApi<boolean, boolean>("api/bio/connectCustomDomain", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      await getCustomerInfo();
    }
  }

  useEffect(() => {
    getCustomerInfo();
    fetchAndCheckFeature(FeatureType.CustomDomain, session).then(setHasCustomDomainFeature);
    const host = window.location.hostname;
    setIsDevMode(host.includes("patran.ir") || host === "localhost" || host === "127.0.0.1");
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
                      <span>{t(LanguageKey.marketProperties_defaultAddress)}</span>
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
                  <div className="headerandinput">
                    <div className="title2">
                      <span>{t(LanguageKey.marketProperties_CustomAddress)}</span>
                    </div>
                    <div className={`${styles.input} `}>
                      {!customeDomain.acceptDomain && (
                        <div className="headerparent">
                          <Tooltip
                            position="bottom"
                            onClick={false}
                            tooltipValue={
                              `• ${t(LanguageKey.customDomain_rule_notEmpty)}\n` +
                              `• ${t(LanguageKey.customDomain_rule_validChars)}\n` +
                              `• ${t(LanguageKey.customDomain_rule_noUnderscore)}\n` +
                              `• ${t(LanguageKey.customDomain_rule_noSubdomain)}\n` +
                              `• ${t(LanguageKey.customDomain_rule_notBrancy)}`
                            }>
                            <InputText
                              className="textinputbox"
                              placeHolder="www.yourname.com"
                              name="domain"
                              handleInputChange={(e) => setInputText(e.currentTarget.value)}
                              value={
                                customeDomain && customeDomain.pendingDomain
                                  ? customeDomain.pendingDomain.uri
                                  : inputText
                              }
                            />
                          </Tooltip>
                          <button
                            onClick={handleRequestCustomAddress}
                            disabled={!isValidDomain(inputText)}
                            className={isValidDomain(inputText) ? "saveButton" : "disableButton"}
                            style={{ height: "40px", maxWidth: "90px" }}>
                            {isUpdating ? <RingLoader /> : t(LanguageKey.marketProperties_Request)}
                          </button>
                        </div>
                      )}
                      {customeDomain.pendingDomain && customeDomain.pendingDomain.nameServerCompletedTime === null && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div className="headerparent">
                            <div className={styles.defaultdomain}>
                              {customeDomain.pendingDomain.uri}{" "}
                              <Tooltip tooltipValue={""} position="bottom" onClick={true}>
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
                            {verifyCooldownUntil > Date.now() / 1000 && (
                              <CounterDownNotRing
                                unixTime={verifyCooldownUntil}
                                timerColor={CounterDownColor.Blue}
                                isDead={() => setVerifyCooldownUntil(0)}
                              />
                            )}
                            <button
                              onClick={handleVerifyCustomAddress}
                              disabled={verifyCooldownUntil > Date.now() / 1000}
                              className={verifyCooldownUntil > Date.now() / 1000 ? "disableButton" : "saveButton"}
                              style={{ height: "40px", maxWidth: "90px" }}>
                              {isVerifying ? <RingLoader /> : t(LanguageKey.Verify)}
                            </button>
                          </div>
                          {customeDomain.pendingDomain.nameServers?.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {customeDomain.pendingDomain.nameServers.map((ns, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "var(--card-background)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    fontFamily: "monospace",
                                    fontSize: "13px",
                                    color: "var(--text-color)",
                                  }}>
                                  <span style={{ color: "var(--subText-color)", fontWeight: 600, minWidth: "28px" }}>
                                    NS{i + 1}
                                  </span>
                                  <span style={{ flex: 1 }}>{ns}</span>
                                  <img
                                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                    title="Copy"
                                    alt="Copy"
                                    src="/copy.svg"
                                    onClick={() => handleCopyLink(ns)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {customeDomain.pendingDomain && customeDomain.pendingDomain.nameServerCompletedTime !== null && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div className="headerparent">
                            <div className={styles.defaultdomain}>
                              {customeDomain.pendingDomain.uri}{" "}
                              <Tooltip tooltipValue={""} position="bottom" onClick={true}>
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

                            <button
                              onClick={handleConnectCustomAddress}
                              className={"saveButton"}
                              style={{ height: "40px", maxWidth: "90px" }}>
                              {t(LanguageKey.marketProperties_Connect)}
                            </button>
                          </div>
                          {customeDomain.pendingDomain.nameServers?.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {customeDomain.pendingDomain.nameServers.map((ns, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "var(--card-background)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    fontFamily: "monospace",
                                    fontSize: "13px",
                                    color: "var(--text-color)",
                                  }}>
                                  <span style={{ color: "var(--subText-color)", fontWeight: 600, minWidth: "28px" }}>
                                    NS{i + 1}
                                  </span>
                                  <span style={{ flex: 1 }}>{ns}</span>
                                  <img
                                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                    title="Copy"
                                    alt="Copy"
                                    src="/copy.svg"
                                    onClick={() => handleCopyLink(ns)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {customeDomain.acceptDomain && (
                        <>
                          <div className={`headerparent ${!isCustomDomainActive ? "fadeDiv" : ""}`}>
                            <div className={styles.defaultdomain}>
                              {customeDomain.acceptDomain.uri}
                              <Tooltip
                                tooltipValue={t(LanguageKey.marketProperties_explain)}
                                position="bottom"
                                onClick={true}>
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
                                handleCopyLink(customeDomain.acceptDomain?.uri!);
                              }}
                            />
                          </div>
                          {customeDomain.acceptDomain.status !== 0 &&
                            hasCustomDomainFeature === true &&
                            !isCustomDomainActive && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  background: "var(--card-background)",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "10px",
                                  padding: "10px 14px",
                                  marginTop: "8px",
                                  width: "100%",
                                }}>
                                <img src="/attention.svg" style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <span style={{ fontWeight: 600, color: "var(--text-color)", fontSize: "13px" }}>
                                    {t(LanguageKey.customDomain_inactive_title)}
                                  </span>
                                  <span style={{ color: "var(--subText-color)", fontSize: "12px" }}>
                                    {t(LanguageKey.customDomain_inactive_desc)}
                                  </span>
                                </div>
                              </div>
                            )}
                          {hasCustomDomainFeature === false && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "var(--card-background)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "10px",
                                padding: "10px 14px",
                                marginTop: "8px",
                                width: "100%",
                                cursor: "pointer",
                              }}
                              onClick={() => router.push("/upgrade")}>
                              <img src="/attention.svg" style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-color)", fontSize: "13px" }}>
                                  {t(LanguageKey.customDomain_noPackage_title)}
                                </span>
                                <span style={{ color: "var(--subText-color)", fontSize: "12px" }}>
                                  {t(LanguageKey.customDomain_noPackage_desc)}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {isDevMode && (
                        <button
                          onClick={handleDeleteCustomDomain}
                          className="disableButton"
                          style={{
                            height: "34px",
                            maxWidth: "80px",
                            background: "var(--danger-color, #e53935)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            marginTop: "8px",
                          }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`${styles.section1} `}>
                  {instaInfo.isShopper && (
                    <>
                      <div className={styles.link}>
                        <div className="headertext">{t(LanguageKey.marketProperties_yourstore)}</div>
                        <div className={`${styles.defaultaddress} translate`}>
                          <div
                            className={styles.defaultdomain}
                            onClick={() =>
                              window.open(
                                isCustomDomainActive
                                  ? `https://${customeDomain.acceptDomain!.uri}/Shopping`
                                  : `https://${instaInfo.username}.${baseShortUrl}/Shopping`,
                                "_blank",
                              )
                            }
                            style={{ cursor: "pointer" }}>
                            {!isCustomDomainActive && `${instaInfo.username}.${baseShortUrl}/Shopping`}
                            {isCustomDomainActive && `${customeDomain.acceptDomain!.uri}/Shopping`}
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
                              window.open(
                                isCustomDomainActive
                                  ? `https://${customeDomain.acceptDomain!.uri}/Advertise`
                                  : `https://${instaInfo.username}.${baseShortUrl}/Advertise`,
                                "_blank",
                              )
                            }
                            style={{ cursor: "pointer" }}>
                            {!isCustomDomainActive && `${instaInfo.username}.${baseShortUrl}/Advertise`}
                            {isCustomDomainActive && `${customeDomain.acceptDomain!.uri}/Advertise`}
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
                        onClick={() =>
                          window.open(
                            isCustomDomainActive
                              ? `https://${customeDomain.acceptDomain!.uri}/Tariff`
                              : `https://${instaInfo.username}.${baseShortUrl}/Tariff`,
                            "_blank",
                          )
                        }
                        style={{ cursor: "pointer" }}>
                        {!isCustomDomainActive && `${instaInfo.username}.${baseShortUrl}/Tariff`}
                        {isCustomDomainActive && `${customeDomain.acceptDomain!.uri}/Tariff`}
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
                        onClick={() =>
                          window.open(
                            isCustomDomainActive
                              ? `https://${customeDomain.acceptDomain!.uri}/workHour`
                              : `https://${instaInfo.username}.${baseShortUrl}/workHour`,
                            "_blank",
                          )
                        }
                        style={{ cursor: "pointer" }}>
                        {!isCustomDomainActive && `${instaInfo.username}.${baseShortUrl}/workHour`}
                        {isCustomDomainActive && `${customeDomain.acceptDomain!.uri}/workHour`}
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
                        onClick={() =>
                          window.open(
                            isCustomDomainActive
                              ? `https://${customeDomain.acceptDomain!.uri}/Terms`
                              : `https://${instaInfo.username}.${baseShortUrl}/Terms`,
                            "_blank",
                          )
                        }
                        style={{ cursor: "pointer" }}>
                        {!isCustomDomainActive && `${instaInfo.username}.${baseShortUrl}/Terms`}
                        {isCustomDomainActive && `${customeDomain.acceptDomain!.uri}/Terms`}
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
