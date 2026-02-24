import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import RingLoader from "brancy/components/design/loader/ringLoder";
import {
  InternalResponseType,
  NotifType,
  internalNotify,
  notify,
} from "brancy/components/notifications/notificationBox";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import { IPageInfo } from "brancy/models/page/post/preposts";
import { IPageAnalysisHashtags } from "brancy/models/page/tools/tools";
import styles from "./newPageAnalyzer.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
interface IPageHashtagAnalysisInfo {
  pk: number;
  username: string;
}
const NewPageAnalyzer = (props: {
  data: { id: number; hashtags: string[] | null };
  removeMask: () => void;
  saveHashtagAnalyzer: () => void;
}) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [hashtagSourceImg, sethashtagSourceImg] = useState("");
  const [hashtags, setHashtags] = useState<string[]>();
  const [searchPeaple, setSearchPeaple] = useState("");
  const [showAddPeapleBox, setShowAddPeapleBox] = useState(false);
  const [SelectedPeaple, setSelectedPeaple] = useState<IPageInfo | null>();
  const [pageInfo, setPageInfo] = useState<IPageInfo[]>([]);
  const [peopleTimeOutId, setPeopleTimeOutId] = useState<any>();
  const [onGettingInformation, setOnGettingInformation] = useState<boolean>(false);
  const [peopleLocked, setPeopleLocked] = useState(false);
  const handleDeleteHashtag = (id: number) => {
    sethashtagSourceImg("");
    var list = hashtags;
    list?.splice(id, 1);
    setHashtags([...(list ?? [])]);
  };
  const handelStartAnalysis = async () => {
    if (!SelectedPeaple) return;
    setOnGettingInformation(true);
    try {
      let info: IPageHashtagAnalysisInfo = {
        pk: 0,
        username: SelectedPeaple.username,
      };
      var res = await clientFetchApi<IPageHashtagAnalysisInfo, IPageAnalysisHashtags>(
        "Instagramer" + "/hashtag/AnalysisPageHashtags",
        { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined },
      );
      if (res.succeeded) {
        setHashtags(res.value.hashtags);
      } else {
        notify(res.info.responseType, NotifType.Error);
        props.removeMask();
      }
    } catch (error) {
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    } finally {
      setSelectedPeaple(null);
      setOnGettingInformation(false);
    }
  };
  const handleApiPeopleSearch = async (query: string) => {
    try {
      var instagramerId = session?.user.instagramerIds[session.user.currentIndex];
      console.log("start searched people ", query);
      var res = await clientFetchApi<boolean, IPageInfo[]>("Instagramer" + "/searchPeople", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "query", value: query }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) setPageInfo(res.value);
      else notify(res.info.responseType, NotifType.Error);
    } catch {
      internalNotify(InternalResponseType.Network, NotifType.Error);
    }
  };
  const handleSearchPeopleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setShowAddPeapleBox(true);
    var query = e.currentTarget.value;
    setSearchPeaple(query);
    setPageInfo([]);
    setSelectedPeaple(null);
    if (peopleTimeOutId) clearTimeout(peopleTimeOutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (peopleLocked) return;
          setPeopleLocked(true);
          handleApiPeopleSearch(query);
          setTimeout(() => {
            setPeopleLocked(false);
          }, 2000);
        }
      }, 1000);
      setPeopleTimeOutId(timeOutId);
    }
  };
  const handleSelectPage = (v: IPageInfo) => {
    setSelectedPeaple(v);
  };
  return (
    <>
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.pageTools_CreateNewListpage)}</div>
      </div>
      <div className="headerandinput">
        <div className="headertext">{t(LanguageKey.pageToolspopup_pageURL)}</div>
        {onGettingInformation && SelectedPeaple ? (
          <div className={styles.searchContent}>
            <img
              loading="lazy"
              decoding="async"
              alt="profile picture"
              className={styles.userProfile}
              src={basePictureUrl + SelectedPeaple.profileUrl}
            />
            <div className={styles.username}>{SelectedPeaple.username}</div>
          </div>
        ) : (
          <>
            <InputText
              className="textinputbox"
              handleInputChange={handleSearchPeopleInputChange}
              placeHolder={t(LanguageKey.search)}
              value={searchPeaple}
              maxLength={undefined}
            />

            {searchPeaple.length > 0 && showAddPeapleBox && (
              <div className={`${styles.resultSearchmention} translate`}>
                {pageInfo.length > 0 &&
                  pageInfo.map((v) => (
                    <div onClick={() => handleSelectPage(v)} key={v.username} className={styles.searchContent}>
                      <img
                        loading="lazy"
                        decoding="async"
                        className={
                          SelectedPeaple && SelectedPeaple.username == v.username
                            ? styles.userProfileSelected
                            : styles.userProfile
                        }
                        src={basePictureUrl + v.profileUrl}
                      />
                      <div
                        className={
                          SelectedPeaple && SelectedPeaple.username == v.username
                            ? styles.usernameSelected
                            : styles.username
                        }>
                        {v.username}
                      </div>
                    </div>
                  ))}
                {pageInfo.length === 0 && <RingLoader />}
              </div>
            )}
          </>
        )}
        {
          <button
            disabled={SelectedPeaple ? false : true}
            onClick={handelStartAnalysis}
            className={onGettingInformation || !SelectedPeaple ? "disableButton" : "saveButton"}>
            {!onGettingInformation ? t(LanguageKey.pageTools_StartAnalysis) : <RingLoader />}
          </button>
        }
      </div>

      <div className="headerandinput" style={{ height: "100%" }}>
        <div className="headerparent">
          <div className="headertext">{t(LanguageKey.pageTools_hashtags)}</div>
          <div className="counter">
            ( <strong>{hashtags?.length ?? 0}</strong> / <strong>200</strong> )
          </div>
        </div>
        <div className={styles.hashtagListItem}>
          {hashtags?.map((v, i) => (
            <div key={i} className={styles.tagHashtag}>
              <img
                onMouseOver={() => sethashtagSourceImg(i.toString())}
                onMouseLeave={() => sethashtagSourceImg("")}
                onClick={() => handleDeleteHashtag(i)}
                className={styles.component9431}
                alt="delete"
                src={hashtagSourceImg === i.toString() ? "/deleteHashtag.svg" : "/icon-hashtag.svg"}
              />
              <div className={styles.instagramer}>{v}</div>
            </div>
          ))}
        </div>

        {/* {hashtags && (
            <div className="ButtonContainer">
              <button onClick={props.removeMask} className="cancelButton">
                {t(LanguageKey.cancel)}
              </button>
              <button
                onClick={() => props.saveHashtagAnalyzer()}
                className="saveButton">
                {t(LanguageKey.save)}
              </button>
            </div>
          )} */}
      </div>
      <div className="ButtonContainer">
        <button onClick={props.removeMask} className="cancelButton">
          {t(LanguageKey.cancel)}
        </button>

        {hashtags && hashtags.length > 0 && (
          <button onClick={props.saveHashtagAnalyzer} className="saveButton">
            {t(LanguageKey.save)}
          </button>
        )}
      </div>
    </>
  );
};

export default NewPageAnalyzer;
