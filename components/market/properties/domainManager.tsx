import CounterDownNotRing, { CounterDownColor } from "brancy/components/design/counterDown/counterDownNotRing";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { NotifType, notify } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import Modal from "brancy/components/design/modal";
import RadioButton from "brancy/components/design/radioButton";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { handleCopyLink } from "brancy/helper/copyLink";
import { fetchAndCheckFeature } from "brancy/helper/checkFeature";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./domainManager.module.css";
import { PsgFeatureType } from "brancy/models/enums";
import { InstagramerAccountInfo, IGetCustomDomain } from "brancy/models/interfaces";

const baseShortUrl = process.env.NEXT_PUBLIC_SHORT_LINK;
const forbiddenDomains = new Set(["brancy.app", "bran.cy", "brncy.ir", "brancy.ir"]);
const domainLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

function isValidDomain(value: string): boolean {
  const normalized = normalizeDomain(value);
  if (!normalized || normalized.length > 253 || normalized.includes("_") || normalized.includes("-")) return false;

  const labels = normalized.split(".");
  if (labels.length !== 2 || labels.some((label) => !domainLabelPattern.test(label) || label.length > 63)) {
    return false;
  }

  const tld = labels[1];
  return /^[a-z]{2,63}$/.test(tld) && !forbiddenDomains.has(normalized);
}

const DomainManager = ({
  instagramerInfo,
  setShowNotFeature,
}: {
  instagramerInfo: InstagramerAccountInfo | null;
  setShowNotFeature: (value: boolean) => void;
}) => {
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
  const [dnsError, setDnsError] = useState(false);
  const [showRequestConfirm, setShowRequestConfirm] = useState(false);
  const [inputText, setInputText] = useState("");
  const [hasCustomDomainFeature, setHasCustomDomainFeature] = useState<boolean | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [domainShake, setDomainShake] = useState(false);
  const [selectedDomainType, setSelectedDomainType] = useState<"default" | "custom">("default");
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCustomDomainActive =
    !!customeDomain.acceptDomain && hasCustomDomainFeature === true && customeDomain.acceptDomain.status === 0;
  const shouldUseCustomDomain = selectedDomainType === "custom" && isCustomDomainActive;
  const isVerifyCooldownActive = verifyCooldownUntil > Date.now() / 1000;
  useEffect(() => {
    if (instagramerInfo) {
      setInstaInfo(instagramerInfo);
      setLoading(false);
    }
  }, [instagramerInfo]);
  async function getCustomerInfo(): Promise<IGetCustomDomain | null> {
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
      return res.value;
    }
    return null;
  }
  function handleRequestCustomAddress() {
    if (isUpdating) return; // Prevent multiple clicks
    if (!isValidDomain(inputText)) {
      setDomainShake(false);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      window.requestAnimationFrame(() => {
        setDomainShake(true);
        shakeTimeoutRef.current = setTimeout(() => setDomainShake(false), 600);
      });
      return;
    }
    setShowRequestConfirm(true);
  }

  function handleDomainTypeChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedDomainType(event.currentTarget.id === "custom-domain" ? "custom" : "default");
  }

  async function confirmRequestCustomAddress() {
    if (isUpdating) return;
    const hasFeature = await fetchAndCheckFeature(PsgFeatureType.CustomDomain, session);
    if (!hasFeature) {
      setShowNotFeature(true);
      return;
    }
    setShowRequestConfirm(false);
    setIsUpdating(true);
    const res = await clientFetchApi<boolean, { url: string }>("Instagramer/Bio/UpdateCustomDomain", {
      methodType: MethodType.post,
      session: session,
      data: { uri: inputText },
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      setDnsError(false);
      await getCustomerInfo();
    } else notify(res.info.responseType, NotifType.Warning);
    setIsUpdating(false);
  }
  async function handleVerifyCustomAddress() {
    if (isVerifying || isVerifyCooldownActive) return; // Prevent multiple clicks
    const hasFeature = await fetchAndCheckFeature(PsgFeatureType.CustomDomain, session);
    if (!hasFeature) {
      setShowNotFeature(true);
      return;
    }
    setIsVerifying(true);
    setDnsError(false);
    const res = await clientFetchApi<boolean, boolean>("api/bio/verifyCustomDomainDns", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      const domainInfo = await getCustomerInfo();
      if (!domainInfo?.acceptDomain || domainInfo.acceptDomain.status !== 0) {
        setDnsError(true);
        setVerifyCooldownUntil(Math.floor(Date.now() / 1000) + 300);
      }
    } else {
      setDnsError(true);
      setVerifyCooldownUntil(Math.floor(Date.now() / 1000) + 300);
      notify(res.info.responseType, NotifType.Warning);
    }
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
      setDnsError(false);
      setVerifyCooldownUntil(0);
    } else notify(res.info.responseType, NotifType.Warning);
  }

  function handleDevAdvanceCustomDomain() {
    const pendingDomain = customeDomain.pendingDomain;
    if (!pendingDomain) return;

    if (pendingDomain.nameServerCompletedTime === null) {
      setCustomeDomain({
        acceptDomain: customeDomain.acceptDomain,
        pendingDomain: { ...pendingDomain, nameServerCompletedTime: Math.floor(Date.now() / 1000) },
      });
      return;
    }

    setCustomeDomain({
      acceptDomain: {
        uri: pendingDomain.uri,
        fbId: pendingDomain.fbId,
        isActive: true,
        createdTime: pendingDomain.createdTime,
        isSubDomain: pendingDomain.isSubDomain,
        status: 0,
        registerType: pendingDomain.registerType,
      },
      pendingDomain: null,
    });
  }

  async function handleConnectCustomAddress() {
    if (isVerifying || isVerifyCooldownActive) return;
    const hasFeature = await fetchAndCheckFeature(PsgFeatureType.CustomDomain, session);
    if (!hasFeature) {
      setShowNotFeature(true);
      return;
    }
    setIsVerifying(true);
    try {
      const res = await clientFetchApi<boolean, boolean>("api/bio/connectCustomDomain", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        const verifyRes = await clientFetchApi<boolean, boolean>("api/bio/verifyCustomDomainDns", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        });
        const domainInfo = verifyRes.succeeded ? await getCustomerInfo() : null;
        if (!domainInfo?.acceptDomain || domainInfo.acceptDomain.status !== 0) {
          setDnsError(true);
          setVerifyCooldownUntil(Math.floor(Date.now() / 1000) + 300);
        } else {
          setDnsError(false);
          setVerifyCooldownUntil(0);
        }
      } else {
        setDnsError(true);
        setVerifyCooldownUntil(Math.floor(Date.now() / 1000) + 300);
      }
    } finally {
      setIsVerifying(false);
    }
  }

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    getCustomerInfo();
    fetchAndCheckFeature(PsgFeatureType.CustomDomain, session).then(setHasCustomDomainFeature);
    if (typeof window === "undefined") return; // برای SSR ایمن
    const host = window.location.hostname;
    setIsDevMode(host.includes("patran.ir") || host === "localhost" || host === "127.0.0.1");
  }, []);
  return (
    <div className="tooBigCard" style={gridSpan}>
      <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.marketProperties_DomainManager)}</div>
      </div>
      <div className={styles.all}>
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
                        name="domain-type"
                        id="default-domain"
                        checked={selectedDomainType === "default"}
                        textlabel={t(LanguageKey.marketProperties_defaultAddress)}
                        handleOptionChanged={handleDomainTypeChange}
                      />
                      <Tooltip
                        triggerType="attention"
                        tooltipValue={t(LanguageKey.marketProperties_explain)}
                        position="bottom"
                        onClick={true}
                      />
                    </div>
                    <div className={`headerandinput ${selectedDomainType !== "default" ? "fadeDiv" : ""}`}>
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
                  </div>
                  <div className="headerandinput">
                    <div className="title2">
                      <RadioButton
                        name="domain-type"
                        id="custom-domain"
                        checked={selectedDomainType === "custom"}
                        textlabel={t(LanguageKey.marketProperties_CustomAddress)}
                        handleOptionChanged={handleDomainTypeChange}
                      />
                    </div>
                    <div className={selectedDomainType !== "custom" ? "fadeDiv" : ""}>
                      {/* step 1 */}
                      {!customeDomain.acceptDomain && !customeDomain.pendingDomain && (
                        <div className={`headerparent ${customeDomain.pendingDomain ? "fadeDiv" : ""}`}>
                          <Tooltip
                            style={{ maxWidth: "70%" }}
                            position="bottom"
                            onClick={false}
                            tooltipValue={
                              `• ${t(LanguageKey.customDomain_rule_validChars)}\n` +
                              `• ${t(LanguageKey.customDomain_rule_noUnderscore)}\n` +
                              `• ${t(LanguageKey.customDomain_rule_noSubdomain)}\n`
                            }>
                            <InputText
                              className="textinputbox"
                              placeHolder="www.yourname.com"
                              name="domain"
                              handleInputChange={(e) => setInputText(normalizeDomain(e.currentTarget.value))}
                              shake={domainShake}
                              value={inputText}
                            />
                          </Tooltip>
                          <button
                            onClick={handleRequestCustomAddress}
                            disabled={!isValidDomain(inputText)}
                            className={isValidDomain(inputText) ? "saveButton" : "disableButton"}>
                            {isUpdating ? <RingLoader /> : t(LanguageKey.marketProperties_Request)}
                          </button>
                        </div>
                      )}
                      {/* step progress */}
                      {!customeDomain.acceptDomain && customeDomain.pendingDomain && (
                        <ol
                          className={styles.domainProgress}
                          aria-label={t(LanguageKey.marketProperties_CustomAddress)}>
                          <li className={`${styles.domainProgressStep} ${styles.domainProgressDone}`}>
                            <span className={styles.domainProgressMarker}>1</span>
                            <span>
                              <Tooltip
                                onClick={false}
                                tooltipValue={`www.${customeDomain.pendingDomain.uri}`}
                                position="bottom">
                                {t(LanguageKey.marketProperties_Request)}
                              </Tooltip>
                            </span>
                          </li>
                          <li
                            className={`${styles.domainProgressStep} ${
                              customeDomain.pendingDomain.nameServerCompletedTime === null
                                ? styles.domainProgressActive
                                : styles.domainProgressDone
                            }`}>
                            <span className={styles.domainProgressMarker}>2</span>
                            <span>{t(LanguageKey.marketProperties_Connect)}</span>
                          </li>
                          <li
                            className={`${styles.domainProgressStep} ${
                              customeDomain.pendingDomain.nameServerCompletedTime !== null
                                ? styles.domainProgressActive
                                : ""
                            }`}>
                            <span className={styles.domainProgressMarker}>3</span>
                            <span>{t(LanguageKey.Verify)}</span>
                          </li>
                        </ol>
                      )}
                      {/* pendingDomain */}
                      {customeDomain.pendingDomain && (
                        <div className="headerandinput" style={{ marginTop: "8px" }}>
                          {customeDomain.pendingDomain.nameServers?.length > 0 && (
                            <div className={styles.section1}>
                              <div className="title2">
                                نیم‌سرورهای دامنه{" "}
                                <Tooltip
                                  triggerType="tooltip"
                                  tooltipValue="نیم‌سرورها را در پنل ارائه‌دهنده دامنه خود ثبت کنید."
                                  position="bottom"
                                  onClick={true}
                                />
                              </div>
                              {customeDomain.pendingDomain.nameServers.map((ns, i) => (
                                <div className={`${styles.defaultaddress} translate`} key={i}>
                                  <span style={{ minWidth: "35px" }} className="IDgreen">
                                    NS {i + 1}
                                  </span>
                                  <span className="explain" style={{ flex: 1, color: "var(--text-h1)" }}>
                                    {ns}
                                  </span>
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
                          <div className="ButtonContainer">
                            <button
                              onClick={handleConnectCustomAddress}
                              disabled={isVerifyCooldownActive || isVerifying}
                              className={isVerifyCooldownActive || isVerifying ? "disableButton" : "saveButton"}>
                              {isVerifyCooldownActive ? (
                                <CounterDownNotRing
                                  unixTime={verifyCooldownUntil}
                                  timerColor={CounterDownColor.Blue}
                                  isDead={() => setVerifyCooldownUntil(0)}
                                />
                              ) : isVerifying ? (
                                <RingLoader />
                              ) : (
                                t(LanguageKey.marketProperties_Connect)
                              )}
                            </button>
                            <button onClick={handleDeleteCustomDomain} className="stopButton" type="button">
                              {t(LanguageKey.cancel)}
                            </button>
                          </div>
                          {dnsError && (
                            <div className={styles.domainAlert} role="alert">
                              <svg
                                className={styles.domainAlerticon}
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <path
                                  stroke="var(--color-light-yellow)"
                                  d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20"
                                  strokeOpacity=".4"
                                />
                                <path
                                  stroke="var(--color-light-yellow)"
                                  d="M12 8v4m.13 3.75H12m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0"
                                />
                              </svg>
                              هنوز نیم‌سرورهای دامنه در ارائه‌دهنده شما ثبت نشده است. دوباره تلاش کنید.
                            </div>
                          )}
                        </div>
                      )}

                      {/* acceptDomain */}
                      {customeDomain.acceptDomain && (
                        <>
                          <div className={`headerparent translate ${!isCustomDomainActive ? "fadeDiv" : ""}`}>
                            <div className={styles.defaultdomain}>www.{customeDomain.acceptDomain.uri}</div>
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
                          {/* ------- */}

                          {/* ---------- */}
                          {/* inactive */}
                          {customeDomain.acceptDomain.status !== 0 &&
                            hasCustomDomainFeature === true &&
                            !isCustomDomainActive && (
                              <div className={styles.domainError} role="alert">
                                <svg
                                  className={styles.domainAlerticon}
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24">
                                  <path
                                    stroke="var(--color-dark-red)"
                                    d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20"
                                    strokeOpacity=".4"
                                  />
                                  <path
                                    stroke="var(--color-dark-red)"
                                    d="M12 8v4m.13 3.75H12m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0"
                                  />
                                </svg>
                                <div className="headerandinput">
                                  <span className="title2" style={{ color: "currentColor" }}>
                                    {t(LanguageKey.customDomain_inactive_title)}
                                  </span>
                                  <span className="explain" style={{ color: "currentColor" }}>
                                    {t(LanguageKey.customDomain_inactive_desc)}
                                  </span>
                                </div>
                              </div>
                            )}
                          {/* noPackage */}
                          {hasCustomDomainFeature === false && (
                            <div onClick={() => router.push("/upgrade")} className={styles.domainError} role="alert">
                              <svg
                                className={styles.domainAlerticon}
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <path
                                  stroke="var(--color-dark-red)"
                                  d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20"
                                  strokeOpacity=".4"
                                />
                                <path
                                  stroke="var(--color-dark-red)"
                                  d="M12 8v4m.13 3.75H12m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0"
                                />
                              </svg>
                              <div className="headerandinput">
                                <span className="title2" style={{ color: "currentColor" }}>
                                  {t(LanguageKey.customDomain_noPackage_title)}
                                </span>
                                <span className="explain" style={{ color: "currentColor" }}>
                                  {t(LanguageKey.customDomain_noPackage_desc)}
                                </span>
                              </div>
                            </div>
                          )}
                          {isCustomDomainActive && (
                            <div className="explain">برای تغییر یا حذف این دامنه، از بخش تنظیمات تیکت ارسال کنید</div>
                          )}
                        </>
                      )}
                    </div>
                    {/* {isDevMode && (
                      <div className="ButtonContainer">
                        <button onClick={handleDeleteCustomDomain} className="stopButton">
                          Delete
                        </button>
                        <button
                          onClick={handleDevAdvanceCustomDomain}
                          className="saveButton"
                          disabled={!customeDomain.pendingDomain}>
                          مرحله بعدی (تست)
                        </button>
                      </div>
                    )} */}
                  </div>
                </div>
                {(selectedDomainType === "default" || isCustomDomainActive) && (
                  <div className={styles.section1}>
                    {instaInfo.isShopper && (
                      <>
                        <div className={styles.link}>
                          <div className="headertext">{t(LanguageKey.marketProperties_yourstore)}</div>
                          <div className={`${styles.defaultaddress} translate`}>
                            <div
                              className={styles.defaultdomain}
                              onClick={() =>
                                window.open(
                                  shouldUseCustomDomain
                                    ? `https://${customeDomain.acceptDomain!.uri}/Shopping`
                                    : `https://${instaInfo.username}.${baseShortUrl}/Shopping`,
                                  "_blank",
                                )
                              }
                              style={{ cursor: "pointer" }}>
                              {!shouldUseCustomDomain && `${instaInfo.username}.${baseShortUrl}/Shopping`}
                              {shouldUseCustomDomain && `${customeDomain.acceptDomain!.uri}/Shopping`}
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
                                  shouldUseCustomDomain
                                    ? `https://${customeDomain.acceptDomain!.uri}/Advertise`
                                    : `https://${instaInfo.username}.${baseShortUrl}/Advertise`,
                                  "_blank",
                                )
                              }
                              style={{ cursor: "pointer" }}>
                              {!shouldUseCustomDomain && `${instaInfo.username}.${baseShortUrl}/Advertise`}
                              {shouldUseCustomDomain && `${customeDomain.acceptDomain!.uri}/Advertise`}
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
                              shouldUseCustomDomain
                                ? `https://${customeDomain.acceptDomain!.uri}/Tariff`
                                : `https://${instaInfo.username}.${baseShortUrl}/Tariff`,
                              "_blank",
                            )
                          }
                          style={{ cursor: "pointer" }}>
                          {!shouldUseCustomDomain && `${instaInfo.username}.${baseShortUrl}/Tariff`}
                          {shouldUseCustomDomain && `${customeDomain.acceptDomain!.uri}/Tariff`}
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
                              shouldUseCustomDomain
                                ? `https://${customeDomain.acceptDomain!.uri}/workHour`
                                : `https://${instaInfo.username}.${baseShortUrl}/workHour`,
                              "_blank",
                            )
                          }
                          style={{ cursor: "pointer" }}>
                          {!shouldUseCustomDomain && `${instaInfo.username}.${baseShortUrl}/workHour`}
                          {shouldUseCustomDomain && `${customeDomain.acceptDomain!.uri}/workHour`}
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
                              shouldUseCustomDomain
                                ? `https://${customeDomain.acceptDomain!.uri}/Terms`
                                : `https://${instaInfo.username}.${baseShortUrl}/Terms`,
                              "_blank",
                            )
                          }
                          style={{ cursor: "pointer" }}>
                          {!shouldUseCustomDomain && `${instaInfo.username}.${baseShortUrl}/Terms`}
                          {shouldUseCustomDomain && `${customeDomain.acceptDomain!.uri}/Terms`}
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
                )}
              </>
            )}
          </>
        )}
      </div>
      <Modal
        closePopup={() => setShowRequestConfirm(false)}
        classNamePopup="popupMini"
        showContent={showRequestConfirm}>
        <div className={styles.domainConfirm}>
          <div className={styles.domainConfirmTitle}>تأیید درخواست دامنه</div>
          <div className={styles.domainConfirmText}>
            با وارد کردن دامنه، مسئولیت انتشار محتوا بر عهده شماست و برنسی هیچ مسئولیتی در این زمینه قبول نمی‌کند.
            همچنین آماده‌سازی درخواست، بسته به ارائه‌دهنده دامنه، ممکن است از ۵ دقیقه تا ۱۲ ساعت طول بکشد تا امکان تنظیم
            نیم‌سرورها و اتصال فراهم شود.
          </div>
          <div className={styles.domainConfirmAddress}>{inputText}</div>
          <div className={styles.domainConfirmActions}>
            <button type="button" className="disableButton" onClick={() => setShowRequestConfirm(false)}>
              انصراف
            </button>
            <button type="button" className="saveButton" onClick={confirmRequestCustomAddress}>
              تأیید و ادامه
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DomainManager;
