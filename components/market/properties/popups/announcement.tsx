import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "saeed/components/design/textArea/textArea";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { IAnnouncementInfo } from "saeed/models/market/properties";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const Announcement = (props: { removeMask: () => void }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [announcement, setAnnouncement] = useState<IAnnouncementInfo>();
  const [loading, setLoading] = useState(true);
  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAnnouncement((prev) => ({ ...prev!, str: e.target.value }));
  };
  async function handleSave() {
    //Api to save Announcement decsription
    const instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    if (!instagramerId) return;
    var res = await clientFetchApi<{ str: string }, boolean>("Instagramer" + "/bio/UpdateAnnouncement", { methodType: MethodType.post, session: session, data: { str: announcement?.str }, queries: undefined, onUploadProgress: undefined });
    if (res.succeeded) {
      props.removeMask();
    }
  }
  async function fetchData() {
    const instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    if (!instagramerId) return;
    var res = await clientFetchApi<string, IAnnouncementInfo>("/api/bio/GetAnnouncement", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
    if (res.succeeded) {
      setAnnouncement(res.value);
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ Edit Announcement</title>
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
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.marketPropertiesAnnouncements)}</div>
        <div className="explain">{t(LanguageKey.marketPropertiesAnnouncementsexplain)}</div>
      </div>
      <div className="headerandinput" style={{ height: "100%" }}>
        {loading && <Loading />}
        {!loading && (
          <>
            <div className="headerparent" role="banner" aria-label="Announcement Header">
              <span></span>
              <div className="counter translate" aria-live="polite">
                (<strong>{announcement?.str.length}</strong> / <strong>1500</strong>)
              </div>
            </div>
            <TextArea
              className={"captiontextarea"}
              placeHolder={""}
              fadeTextArea={false}
              handleInputChange={handleChangeTextArea}
              value={announcement?.str!}
              maxLength={1500}
              handleKeyDown={undefined}
              style={{ height: "100%" }}
              aria-label="Announcement text area"
              role={"textbox"}
              title={"Announcement text area"}
            />
          </>
        )}
      </div>
      {!loading && (
        <div className="ButtonContainer">
          <div className="cancelButton" onClick={props.removeMask}>
            {t(LanguageKey.cancel)}
          </div>
          <div onClick={handleSave} className={announcement?.str ? "saveButton" : "disableButton"}>
            {t(LanguageKey.save)}
          </div>
        </div>
      )}
    </>
  );
};

export default Announcement;
