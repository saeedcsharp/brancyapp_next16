import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "saeed/components/design/textArea/textArea";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { IQuestion, IUpdateFAQ } from "saeed/models/market/properties";
import styles from "./featureBoxPU.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const QAndABox = (props: { removeMask: () => void }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [qABoxes, setQABoxes] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const maxFAQItems = 4;
  const currentInstagramerId = useMemo(
    () => session?.user.instagramerIds[session.user.currentIndex],
    [session?.user.instagramerIds, session?.user.currentIndex]
  );
  const canAddMoreFAQ = useMemo(() => qABoxes.length < maxFAQItems, [qABoxes.length]);
  const handleChangeQuestionTextArea = useCallback((e: ChangeEvent<HTMLTextAreaElement>, id: string) => {
    setQABoxes((prev) => prev.map((x) => (x.id === id ? { ...x, question: e.target.value } : x)));
  }, []);
  const handleChangeAnswerTextArea = useCallback((e: ChangeEvent<HTMLTextAreaElement>, id: string) => {
    setQABoxes((prev) => prev.map((x) => (x.id === id ? { ...x, answer: e.target.value } : x)));
  }, []);
  const handleChangeCheckBox = useCallback((e: ChangeEvent<HTMLInputElement>, id: string) => {
    setQABoxes((prev) => prev.map((x) => (x.id === id ? { ...x, isActive: e.target.checked } : x)));
  }, []);
  const handleAddNewFAQ = useCallback(() => {
    if (!canAddMoreFAQ || !currentInstagramerId) return;
    const newFAQ: IQuestion = {
      id: "",
      question: "",
      answer: "",
      instagramerId: currentInstagramerId,
      orderId: qABoxes.length + 1,
    };
    setQABoxes((prev) => [...prev, newFAQ]);
  }, [canAddMoreFAQ, currentInstagramerId, qABoxes]);
  const handleDeleteFAQ = useCallback((id: string) => {
    setQABoxes((prev) => prev.filter((x) => x.id !== id));
  }, []);
  const handleSave = useCallback(async () => {
    if (!currentInstagramerId) return;
    const updateFAQ: IUpdateFAQ = {
      items: qABoxes.map((item) => ({
        id: item.id,
        answer: item.answer,
        question: item.question,
      })),
    };
    const res = await clientFetchApi<IUpdateFAQ, boolean>("/api/bio/UpdateFaqs", { methodType: MethodType.post, session: session, data: updateFAQ, queries: undefined, onUploadProgress: undefined });
    if (res.value) props.removeMask();
  }, [currentInstagramerId, qABoxes, session, props.removeMask]);
  const fetchData = useCallback(async () => {
    if (!currentInstagramerId) return;
    const res = await clientFetchApi<string, IQuestion[]>("/api/bio/GetFaqs", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
    if (res.succeeded) {
      setQABoxes(res.value);
    }
    setLoading(false);
  }, [currentInstagramerId, session]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.footer_FAQ)}</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className="title">{t(LanguageKey.marketPropertiesQandABox)}</div>
      <div
        className={`${styles.addnewlink} ${!canAddMoreFAQ ? "fadeDiv" : ""}`}
        title="◰ add new FAQ to your market"
        onClick={handleAddNewFAQ}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleAddNewFAQ()}
        aria-disabled={!canAddMoreFAQ}>
        <div className={styles.addnewicon}>
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path
              d="M22 11q-.1 1.5-1.6 1.6h-7.8v7.8a1.6 1.6 0 1 1-3.2 0v-7.8H1.6a1.6 1.6 0 1 1 0-3.2h7.8V1.6a1.6 1.6 0 1 1 3.2 0v7.8h7.8q1.5.1 1.6 1.6"
              fill="var(--color-dark-blue)"
            />
          </svg>
        </div>
        <div className={styles.addnewcontent}>
          <div className={styles.addnewheader}>
            {t(LanguageKey.Addfaq)}{" "}
            <span className="explain" style={{ color: "var(--color-dark-blue)" }}>
              ({qABoxes.length}/{maxFAQItems})
            </span>
          </div>
          <div className={styles.addnewexplain}>{t(LanguageKey.addfaqexplain)}</div>{" "}
        </div>
      </div>
      <div className={styles.all}>
        {loading && <Loading />}
        {!loading && qABoxes.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "20px" }} className="explain">
            {t(LanguageKey.faqEmptyState)}
          </div>
        )}
        {!loading &&
          qABoxes.length > 0 &&
          qABoxes.map((v, index) => (
            <div key={v.id} className={styles.qasection}>
              <div className="headerandinput" role="contentinfo">
                <div className="headerandinput" style={{ height: "100px" }} role="contentinfo">
                  <div className="headerparent">
                    <div className="headertext">
                      {t(LanguageKey.question)} {index + 1}{" "}
                      <img
                        style={{ cursor: "pointer", width: "20px", height: "20px", marginInline: "10px" }}
                        title="🗑️ Delete question"
                        onClick={() => handleDeleteFAQ(v.id)}
                        src="/delete-red.svg"
                        alt={`Delete question ${index + 1}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleDeleteFAQ(v.id)}
                      />
                    </div>

                    <span className="counter">
                      (<strong>{v.question.length}</strong> /<strong>100</strong>)
                    </span>
                  </div>
                  <TextArea
                    className={"captiontextarea"}
                    placeHolder={""}
                    fadeTextArea={false}
                    handleInputChange={(e) => handleChangeQuestionTextArea(e, v.id)}
                    value={v.question}
                    maxLength={100}
                    handleKeyDown={undefined}
                    role={"textbox"}
                    title={"Question text area"}
                  />
                </div>
                <div className="headerandinput" style={{ height: "150px" }} role="contentinfo">
                  <div className="headerparent">
                    <div className="headertext" title={`Answer ${index + 1}`}>
                      {t(LanguageKey.Answer)} {index + 1}
                    </div>
                    <div className="counter" aria-label={`Answer length: ${v.answer.length} / 200`}>
                      ( <strong>{v.answer.length}</strong> / <strong>200</strong>)
                    </div>
                  </div>
                  <TextArea
                    className={"captiontextarea"}
                    placeHolder={"Answer"}
                    fadeTextArea={false}
                    handleInputChange={(e) => handleChangeAnswerTextArea(e, v.id)}
                    value={v.answer}
                    maxLength={200}
                    handleKeyDown={undefined}
                    aria-label={`Answer text area ${index + 1}`}
                    role={"textbox"}
                    title={"Answer text area"}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>{" "}
      {!loading && (
        <div className="ButtonContainer">
          <button type="button" className="cancelButton" onClick={props.removeMask} aria-label={t(LanguageKey.cancel)}>
            {t(LanguageKey.cancel)}
          </button>
          <button type="button" onClick={handleSave} className="saveButton" aria-label={t(LanguageKey.save)}>
            {t(LanguageKey.save)}
          </button>
        </div>
      )}
    </>
  );
};
export default QAndABox;
