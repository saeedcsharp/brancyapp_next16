import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import Loading from "brancy/components/notOk/loading";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { IAutoReply } from "brancy/models/messages/properies";
import Prompt from "brancy/components/messages/properties/prompt";
import styles from "./properties.module.css";

function AutomaticReply() {
  // تابع استفاده از ترجمه برای چندزبانه بودن
  const { t } = useTranslation();

  // تعیین وضعیت دکمه‌های تغییر وضعیت (بین دایرکت و کامنت)
  const [automaticreplyToggle, setautomaticreplyToggle] = useState(ToggleOrder.FirstToggle);

  // دریافت اطلاعات جلسه کاربر
  const { data: session } = useSession();

  // حالت‌های مربوط به فعال بودن یا نبودن پاسخ خودکار دایرکت و کامنت
  const [activeAutoDirect, setActiveAutoDirect] = useState<boolean>(true);
  const [activeCommentReply, setActiveCommentReply] = useState<boolean>(true);

  // تعیین پاسخ‌های خودکار برای دایرکت و کامنت
  const [directReplies, setDirectReplies] = useState<IAutoReply>({
    activeReply: true,
    propmts: [],
  });
  const [commentReplies, setCommentReplies] = useState<IAutoReply>({
    activeReply: true,
    propmts: [],
  });

  // وضعیت بارگذاری داده‌ها
  const [refresh, setRefresh] = useState(false);
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Message));

  // تابع تغییر وضعیت دایرکت
  const toggleOnDirect = () => {
    var activeReply = activeAutoDirect;
    setActiveAutoDirect(!activeAutoDirect);
    directReplies.activeReply = !activeReply;
  };

  // تابع تغییر وضعیت کامنت
  const toggleOnComment = () => {
    var activeReply = activeCommentReply;
    setActiveCommentReply(!activeCommentReply);
    commentReplies.activeReply = !activeReply;
  };

  // تابع ذخیره پاسخ‌های خودکار
  const handleSaveAutoreply = () => {
    // ارسال داده‌ها برای ذخیره‌سازی
    console.log("comment save ", commentReplies);
    console.log("direct save ", directReplies);
  };

  // تابع اضافه کردن پاسخ جدید برای دایرکت
  const handleAddDirectPrompt = () => {
    if (!activeAutoDirect) return;
    var newDirectReplies = directReplies;
    newDirectReplies.propmts.push({
      activePrompt: true,
      answer: "",
      incomeMsg: "",
      propmtId: newDirectReplies.propmts.length + 1,
    });
    setDirectReplies(newDirectReplies);
    setRefresh(!refresh);
  };

  // تابع اضافه کردن پاسخ جدید برای کامنت
  const handleAddCommentPrompt = () => {
    if (!activeCommentReply) return;
    var newCommentReplies = commentReplies;
    newCommentReplies.propmts.push({
      activePrompt: true,
      answer: "",
      incomeMsg: "",
      propmtId: newCommentReplies.propmts.length + 1,
    });
    setCommentReplies(newCommentReplies);
    setRefresh(!refresh);
  };

  // تابع دریافت اطلاعات اولیه
  async function fetchData() {}

  // فراخوانی دریافت داده‌ها هنگام بارگذاری کامپوننت
  useEffect(() => {
    fetchData();
  }, []);

  // رندر کردن کامپوننت
  return (
    <div className="tooBigCard">
      <div className="headerChild">
        <div className="circle"></div>
        <div className="Title">automatic reply</div>
      </div>
      {loadingStatus && <Loading />}
      {!loadingStatus && (
        <>
          <FlexibleToggleButton
            options={[
              { label: t(LanguageKey.navbar_Direct), id: 0 },
              { label: t(LanguageKey.navbar_Comments), id: 1 },
            ]}
            onChange={setautomaticreplyToggle}
            selectedValue={automaticreplyToggle}
          />
          {/* ___auto direct ___*/}
          {automaticreplyToggle === ToggleOrder.FirstToggle && (
            <>
              <div className="headerandinput" role="region" aria-label="Direct Message Settings">
                <div className="headerparent">
                  <div
                    className={styles.headertitle}
                    role="heading"
                    aria-level={2}
                    title="Toggle automatic direct message">
                    auto direct
                  </div>
                  <ToggleCheckBoxButton
                    handleToggle={toggleOnDirect}
                    checked={activeAutoDirect}
                    name="direct-auto-reply"
                    aria-label="Toggle automatic direct messages"
                    role="switch"
                    title="Toggle automatic direct messages"
                  />
                </div>
                <div className="explain" role="note" aria-label="Explanation of auto-direct feature">
                  your custom answer will send instantly.
                </div>
              </div>
              <div
                className={`${styles.qanda} ${!activeAutoDirect && "fadeDiv"}`}
                role="region"
                aria-label="Direct message prompts">
                {directReplies.propmts.map((v) => (
                  <Prompt key={v.propmtId} data={v} propmptNumber={directReplies.propmts.indexOf(v) + 1} />
                ))}
                <div
                  className="saveButton"
                  style={{ width: "70%", alignSelf: "center" }}
                  onClick={handleAddDirectPrompt}
                  role="button"
                  aria-label="Add new direct message prompt"
                  title="Add new direct message prompt">
                  Add new
                </div>
              </div>
            </>
          )}
          {/* ___comment reply ___*/}
          {automaticreplyToggle === ToggleOrder.SecondToggle && (
            <>
              <div className="headerandinput" role="region" aria-label="Comment Reply Settings">
                <div className="headerparent">
                  <div
                    className={styles.headertitle}
                    role="heading"
                    aria-level={2}
                    title="Toggle automatic comment reply">
                    comment reply
                  </div>
                  <ToggleCheckBoxButton
                    handleToggle={toggleOnComment}
                    checked={activeCommentReply}
                    name="comment-auto-reply"
                    aria-label="Toggle automatic comment reply"
                    role="switch"
                    title="Toggle automatic comment reply"
                  />
                </div>
                <div className="explain" role="note" aria-label="Explanation of auto-comment feature">
                  your custom answer will send instantly.
                </div>
              </div>
              <div
                className={`${styles.qanda} ${!activeCommentReply && "fadeDiv"}`}
                role="region"
                aria-label="Comment prompts list">
                {commentReplies.propmts.map((v) => (
                  <Prompt key={v.propmtId} data={v} propmptNumber={commentReplies.propmts.indexOf(v) + 1} />
                ))}
                <div
                  className="saveButton"
                  style={{ width: "70%", alignSelf: "center" }}
                  onClick={handleAddCommentPrompt}
                  role="button"
                  aria-label="Add new comment prompt"
                  title="Add new comment prompt">
                  Add new
                </div>
              </div>
            </>
          )}

          <div
            onClick={handleSaveAutoreply}
            className="saveButton"
            role="button"
            aria-label="Save all changes"
            title="Save all changes">
            Save
          </div>
        </>
      )}
    </div>
  );
}

export default AutomaticReply;
