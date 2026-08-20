import CounterDownNotRing, { CounterDownColor } from "brancy/components/design/counterDown/counterDownNotRing";
import InputBox from "brancy/components/design/inputBox/inputBox";
import RingLoader from "brancy/components/design/loader/ringLoder";
import RadioButton from "brancy/components/design/radioButton/radioButton";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { NotifType, notify } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { handleCopyLink } from "brancy/helper/copyLink";
import { fetchAndCheckFeature } from "brancy/helper/checkFeature";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { PsgFeatureType } from "brancy/models/enums";
import { InstagramerAccountInfo, IGetCustomDomain } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./domainManager.module.css";

const baseShortUrl = process.env.NEXT_PUBLIC_SHORT_LINK ?? "";
const forbiddenDomains = new Set(["brancy.app", "bran.cy", "brncy.ir", "brancy.ir"]);
const domainLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function getDefaultDomain(username: string): string {
  return /[._\-ـ]/.test(username) ? `${baseShortUrl}/${username}` : `${username}.${baseShortUrl}`;
}

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
  const [customeDomain, setCustomeDomain] = useState<IGetCustomDomain>({ acceptDomain: null, pendingDomain: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyCooldownUntil, setVerifyCooldownUntil] = useState<number>(0);
  const [dnsError, setDnsError] = useState(false);
  const [inputText, setInputText] = useState("");
  const [hasCustomDomainFeature, setHasCustomDomainFeature] = useState<boolean | null>(null);
  const [domainShake, setDomainShake] = useState(false);
  const [selectedDomainType, setSelectedDomainType] = useState<"default" | "custom">("default");
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeFrameRef = useRef<number | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const instaInfo = instagramerInfo;
  const loading = !instaInfo;
  const isInputDomainValid = useMemo(() => isValidDomain(inputText), [inputText]);
  const isCustomDomainActive =
    !!customeDomain.acceptDomain && hasCustomDomainFeature === true && customeDomain.acceptDomain.status === 0;
  const shouldUseCustomDomain = selectedDomainType === "custom" && isCustomDomainActive;
  const isVerifyCooldownActive = verifyCooldownUntil > Date.now() / 1000;
  const destinationLinks = useMemo(() => {
    if (!instaInfo) return [];
    const domain = shouldUseCustomDomain ? customeDomain.acceptDomain?.uri : getDefaultDomain(instaInfo.username);
    if (!domain) return [];
    const links = [
      instaInfo.isShopper && { label: t(LanguageKey.biolinkProperties_yourstore), path: "Shopping" },
      instaInfo.isBusiness && { label: t(LanguageKey.biolinkProperties_yourads), path: "Advertise" },
      { label: t(LanguageKey.biolinkProperties_yourtariff), path: "Tariff" },
      { label: t(LanguageKey.biolinkProperties_yourBusinesshours), path: "workHour" },
      { label: t(LanguageKey.biolinkProperties_yourBusinessTerms), path: "Terms" },
    ].filter((link): link is { label: string; path: string } => Boolean(link));
    return links.map((link) => ({
      ...link,
      address: `${domain}/${link.path}`,
      url: `https://${domain}/${link.path}`,
    }));
  }, [customeDomain.acceptDomain?.uri, instaInfo, shouldUseCustomDomain, t]);
  async function getCustomerInfo(signal?: AbortSignal): Promise<IGetCustomDomain | null> {
    const res = await clientFetchApi<boolean, IGetCustomDomain>("Instagramer/Bio/GetCustomDomain", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
      signal,
    });

    if (res.succeeded && mountedRef.current && !signal?.aborted) {
      setCustomeDomain(res.value);
      // restore cooldown if lastCheckTime is within 5 minutes ago
      const lastCheck = res.value?.pendingDomain?.lastCheckTime;
      if (lastCheck && lastCheck + 300 > Date.now() / 1000) {
        const enableAt = lastCheck + 300;
        setVerifyCooldownUntil(enableAt);
      } else {
        setVerifyCooldownUntil(0);
      }
      return res.value;
    }
    return null;
  }
  function handleRequestCustomAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isUpdating) return; // Prevent multiple clicks
    if (!isInputDomainValid) {
      setDomainShake(false);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (shakeFrameRef.current !== null) cancelAnimationFrame(shakeFrameRef.current);
      shakeFrameRef.current = window.requestAnimationFrame(() => {
        setDomainShake(true);
        shakeTimeoutRef.current = setTimeout(() => setDomainShake(false), 600);
      });
      return;
    }
    void confirmRequestCustomAddress();
  }

  const handleDomainTypeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSelectedDomainType(event.currentTarget.id === "custom-domain" ? "custom" : "default");
  }, []);

  async function confirmRequestCustomAddress() {
    if (isUpdating) return;
    const controller = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    setIsUpdating(true);
    try {
      const res = await clientFetchApi<boolean, { url: string }>("Instagramer/Bio/UpdateCustomDomain", {
        methodType: MethodType.post,
        session: session,
        data: { uri: inputText },
        queries: undefined,
        onUploadProgress: undefined,
        signal: controller.signal,
      });
      if (!mountedRef.current || controller.signal.aborted) return;
      if (res.succeeded) {
        setDnsError(false);
        await getCustomerInfo(controller.signal);
      } else notify(res.info.responseType, NotifType.Warning);
    } finally {
      if (mountedRef.current) setIsUpdating(false);
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }

  async function handleDeleteCustomDomain() {
    if (isUpdating || isVerifying) return;
    const controller = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    setIsUpdating(true);
    try {
      const res = await clientFetchApi<boolean, boolean>("api/bio/deleteCustomDomain", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
        signal: controller.signal,
      });
      if (!mountedRef.current || controller.signal.aborted) return;
      if (res.succeeded) {
        const domainInfo = await getCustomerInfo(controller.signal);
        if (domainInfo) {
          setDnsError(false);
          setVerifyCooldownUntil(0);
        }
      } else notify(res.info.responseType, NotifType.Warning);
    } finally {
      if (mountedRef.current) setIsUpdating(false);
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }

  async function handleConnectCustomAddress() {
    if (isVerifying || isVerifyCooldownActive) return;
    const hasFeature = await fetchAndCheckFeature(PsgFeatureType.CustomDomain, session);
    if (!hasFeature) {
      setShowNotFeature(true);
      return;
    }
    const controller = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    setIsVerifying(true);
    try {
      const res = await clientFetchApi<boolean, boolean>("api/bio/connectCustomDomain", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
        signal: controller.signal,
      });
      if (!mountedRef.current || controller.signal.aborted) return;
      if (res.succeeded) {
        const verifyRes = await clientFetchApi<boolean, boolean>("api/bio/verifyCustomDomainDns", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
          signal: controller.signal,
        });
        if (!mountedRef.current || controller.signal.aborted) return;
        const domainInfo = verifyRes.succeeded ? await getCustomerInfo(controller.signal) : null;
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
        notify(res.info.responseType, NotifType.Warning);
      }
    } finally {
      if (mountedRef.current) setIsVerifying(false);
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (shakeFrameRef.current !== null) cancelAnimationFrame(shakeFrameRef.current);
      mountedRef.current = false;
      requestControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    void getCustomerInfo(controller.signal);
    void fetchAndCheckFeature(PsgFeatureType.CustomDomain, session).then((hasFeature) => {
      if (mountedRef.current && !controller.signal.aborted) setHasCustomDomainFeature(hasFeature);
    });
    if (typeof window === "undefined") return; // برای SSR ایمن
    return () => {
      controller.abort();
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    };
  }, [session]);
  return (
    <div className="tooBigCard" style={gridSpan}>
      <button
        type="button"
        onClick={toggle}
        className={`${styles.headerChild} headerChild`}
        title="Resize the card"
        aria-expanded={hidePage}>
        <div className="circle"></div>
        <div className="Title">{t(LanguageKey.biolinkProperties_DomainManager)}</div>
      </button>
      <div className={styles.all}>
        {hidePage && (
          <>
            {loading && <Loading />}
            {!loading && instaInfo && (
              <>
                <div className={styles.section}>
                  <div className="headerandinput">
                    <div className="title">{t(LanguageKey.biolinkProperties_DomainManagerexplain)}</div>
                    <div className="explain">{t(LanguageKey.biolinkProperties_DomainManagerexplain2)}</div>
                  </div>
                  <div className="headerandinput">
                    <div className="title2">
                      <RadioButton
                        name="domain-type"
                        id="default-domain"
                        checked={selectedDomainType === "default"}
                        textlabel={t(LanguageKey.biolinkProperties_defaultAddress)}
                        handleOptionChanged={handleDomainTypeChange}
                      />
                      <Tooltip
                        triggerType="attention"
                        tooltipValue={t(LanguageKey.biolinkProperties_explain)}
                        position="bottom"
                        onClick={true}
                      />
                    </div>
                    <div className={`headerandinput ${selectedDomainType !== "default" ? "fadeDiv" : ""}`}>
                      <div className={`${styles.defaultaddress} translate`}>
                        <a
                          className={styles.defaultdomain}
                          href={`https://${getDefaultDomain(instaInfo.username)}`}
                          target="_blank"
                          rel="noopener noreferrer">
                          {getDefaultDomain(instaInfo.username)}
                        </a>
                        <button
                          type="button"
                          className={styles.copyButton}
                          title="Copy domain"
                          aria-label={`Copy ${getDefaultDomain(instaInfo.username)}`}
                          onClick={() => {
                            handleCopyLink(getDefaultDomain(instaInfo.username));
                          }}>
                          <img src="/copy.svg" alt="" aria-hidden="true" />
                        </button>
                      </div>
                      {getDefaultDomain(instaInfo.username) !== `${baseShortUrl}/${instaInfo.username}` && (
                        <div className={`${styles.defaultaddress} translate`}>
                          <a
                            className={styles.defaultdomain}
                            href={`https://${baseShortUrl}/${instaInfo.username}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            {baseShortUrl}/{instaInfo.username}
                          </a>
                          <button
                            type="button"
                            className={styles.copyButton}
                            title="Copy domain"
                            aria-label={`Copy ${baseShortUrl}/${instaInfo.username}`}
                            onClick={() => {
                              handleCopyLink(baseShortUrl + "/" + instaInfo.username);
                            }}>
                            <img src="/copy.svg" alt="" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="title2">
                      <RadioButton
                        name="domain-type"
                        id="custom-domain"
                        checked={selectedDomainType === "custom"}
                        textlabel={t(LanguageKey.biolinkProperties_CustomAddress)}
                        handleOptionChanged={handleDomainTypeChange}
                      />
                    </div>
                    <div className={selectedDomainType !== "custom" ? "fadeDiv" : "headerandinput"}>
                      {/* step 1 */}
                      {!customeDomain.acceptDomain && !customeDomain.pendingDomain && (
                        <>
                          <form
                            className={`headerparent ${customeDomain.pendingDomain ? "fadeDiv" : ""}`}
                            onSubmit={handleRequestCustomAddress}
                            noValidate>
                            <Tooltip
                              style={{ maxWidth: "70%" }}
                              position="bottom"
                              onClick={false}
                              tooltipValue={
                                `• ${t(LanguageKey.customDomain_rule_validChars)}\n` +
                                `• ${t(LanguageKey.customDomain_rule_noUnderscore)}\n` +
                                `• ${t(LanguageKey.customDomain_rule_noSubdomain)}\n`
                              }>
                              <InputBox
                                className="textinputbox"
                                placeHolder="yourname.com"
                                name="domain"
                                handleInputChange={(e) => setInputText(normalizeDomain(e.currentTarget.value))}
                                shake={domainShake}
                                value={inputText}
                              />
                            </Tooltip>
                            <button
                              style={{ maxWidth: "30%" }}
                              type="submit"
                              disabled={!isInputDomainValid || isUpdating}
                              className={isInputDomainValid && !isUpdating ? "saveButton" : "disableButton"}>
                              {isUpdating ? <RingLoader /> : t(LanguageKey.biolinkProperties_Request)}
                            </button>
                          </form>
                        </>
                      )}
                      {/* step progress */}
                      {!customeDomain.acceptDomain && customeDomain.pendingDomain && (
                        <ol
                          className={styles.domainProgress}
                          aria-label={t(LanguageKey.biolinkProperties_CustomAddress)}>
                          <li className={`${styles.domainProgressStep} ${styles.domainProgressDone}`}>
                            <span className={styles.domainProgressMarker}>1</span>
                            <span>
                              <Tooltip onClick={false} tooltipValue={customeDomain.pendingDomain.uri} position="bottom">
                                {t(LanguageKey.biolinkProperties_Request)}
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
                            <span>{t(LanguageKey.biolinkProperties_Connect)}</span>
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
                              <div className="headerandinput">
                                <div className="title2">
                                  {t(LanguageKey.biolinkProperties_NameServers)}

                                  <Tooltip
                                    triggerType="attention"
                                    tooltipValue={t(LanguageKey.biolinkProperties_NameServerstooltip)}
                                    position="bottom"
                                    onClick={true}
                                  />
                                </div>
                                <div className="explain">{t(LanguageKey.biolinkProperties_NameServersExplain)}</div>
                              </div>

                              {customeDomain.pendingDomain.nameServers.map((ns, i) => (
                                <div className={`${styles.defaultaddress} translate`} key={i}>
                                  <span style={{ minWidth: "35px" }} className="IDgreen">
                                    NS {i + 1}
                                  </span>
                                  <span className="explain" style={{ flex: 1, color: "var(--text-h1)" }}>
                                    {ns}
                                  </span>
                                  <button
                                    type="button"
                                    className={styles.copyButton}
                                    title="Copy"
                                    aria-label={`Copy ${ns}`}
                                    onClick={() => handleCopyLink(ns)}>
                                    <img src="/copy.svg" alt="" aria-hidden="true" />
                                  </button>
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
                                t(LanguageKey.biolinkProperties_Connect)
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
                              {t(LanguageKey.customDomain_dnsError)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* acceptDomain */}
                      {customeDomain.acceptDomain && (
                        <>
                          <div className={`headerparent translate ${!isCustomDomainActive ? "fadeDiv" : ""}`}>
                            <div className={styles.defaultdomain}>{customeDomain.acceptDomain.uri}</div>
                            <button
                              type="button"
                              className={styles.copyButton}
                              title="Copy domain"
                              aria-label="Copy custom domain"
                              onClick={() => {
                                handleCopyLink(customeDomain.acceptDomain?.uri!);
                              }}>
                              <img src="/copy.svg" alt="" aria-hidden="true" />
                            </button>
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
                            <button
                              type="button"
                              onClick={() => router.push("/upgrade")}
                              className={styles.domainError}
                              aria-label={t(LanguageKey.customDomain_noPackage_title)}>
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
                            </button>
                          )}
                          {isCustomDomainActive && (
                            <div className="explain">{t(LanguageKey.customDomain_active_desc)}</div>
                          )}
                        </>
                      )}
                    </div>
                    {/* {isDevMode && (
                      <div className="ButtonContainer">
                        <button onClick={handleDeleteCustomDomain} className="stopButton">
                        {t(LanguageKey.cancel)}
                        </button>
                        <button
                          onClick={handleDevAdvanceCustomDomain}
                          className="saveButton"
                          disabled={!customeDomain.pendingDomain}>
                          {t(LanguageKey.Continue)}
                        </button>
                      </div>
                    )} */}
                  </div>
                </div>
                {(selectedDomainType === "default" || isCustomDomainActive) && (
                  <div className={styles.section1}>
                    {destinationLinks.map((link) => (
                      <div className={styles.link} key={link.path}>
                        <div className="headertext">{link.label}</div>
                        <div className={`${styles.defaultaddress} translate`}>
                          <a className={styles.defaultdomain} href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.address}
                          </a>
                          <button
                            type="button"
                            className={styles.copyButton}
                            title="Copy domain"
                            aria-label={`Copy ${link.address}`}
                            onClick={() => handleCopyLink(link.address)}>
                            <img src="/copy.svg" alt="" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DomainManager;
