import Modal from "brancy/components/design/modal";
import Customization from "brancy/components/messages/properties/customization";
import MessagePanel from "brancy/components/messages/properties/messagePanel";
import PhoneNumbers from "brancy/components/messages/properties/phoneNumbers";
import PopupComment from "brancy/components/messages/properties/popupComment";
import PopupDirect from "brancy/components/messages/properties/popupDirect";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import { MethodType } from "brancy/helper/api";
import { changePositionToRelative } from "brancy/helper/changeMarketAdsStyle";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LoginStatus, packageStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { Language } from "brancy/models/enums";
import { IAutoReplySetting, IFlowPhoneNumber, IFlowPhoneNumbers, IMessagePanel } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const Properties = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const [isPopupCOMMENT, setIsPopupCOMMENT] = useState(false);
  const [isPopupDirect, setIsPopupDirect] = useState(false);
  const [loadingStatus, setLoadingStaus] = useState(true);
  // Authentication effect
  useEffect(() => {
    if (session && !packageStatus(session)) router.push("/upgrade");
    if (session && !LoginStatus(session)) {
      router.push("/");
    }
  }, [session, router]);

  // Data loading protection
  // useEffect(() => {
  //   if (!isDataLoaded && !isFetchingRef.current) {
  //     setLoadingStaus(false);
  //   }
  // }, [isDataLoaded]);

  const fetchDataCallback = useCallback(fetchData, [session]);

  useEffect(() => {
    if (session && LoginStatus(session) && !isDataLoaded) {
      fetchDataCallback();
    }
  }, [session, fetchDataCallback, isDataLoaded]);

  //-----------Message panel----------------------//
  const [messagePanel, setMessagePanel] = useState<IMessagePanel>({
    followTemplate: { isActive: true, content: "", title: "" },
    initialEngagementTemplate: { isActive: false, content: "", title: "" },
    language: Language.English,
    likeReplyStory: true,
    robotReply: true,
  });
  async function handleLikeRobotReply(e: ChangeEvent<HTMLInputElement>) {
    try {
      const toggle = e.target.checked;
      const res = await clientFetchApi<boolean, boolean>("/api/message/ToggleLikeReplyAutoReply", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "isLike", value: toggle.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setMessagePanel((prev) => ({
          ...prev,
          likeReplyStory: toggle,
        }));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleChangeFollowTempTitle(e: ChangeEvent<HTMLInputElement>) {
    setMessagePanel((prev) => ({
      ...prev,
      followTemplate: { ...prev.followTemplate, title: e.target.value },
    }));
  }
  function handleChangeFollowTempContent(e: ChangeEvent<HTMLInputElement>) {
    setMessagePanel((prev) => ({
      ...prev,
      followTemplate: { ...prev.followTemplate, content: e.target.value },
    }));
  }
  async function handleToggleFollowTemplate(e: ChangeEvent<HTMLInputElement>) {
    try {
      const toggle = e.target.checked;
      const res = await clientFetchApi<boolean, boolean>("/api/message/ToggleCheckFollowerTemplate", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "isEnable", value: toggle.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setMessagePanel((prev) => ({
          ...prev,
          followTemplate: { ...prev.followTemplate, isActive: toggle },
        }));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleSaveFollowerTemplate() {
    try {
      const res = await clientFetchApi<IMessagePanel, boolean>("/api/message/UpdateCheckFollowerTemplate", {
        methodType: MethodType.post,
        session: session,
        data: {
          title: messagePanel.followTemplate.title,
          buttonText: messagePanel.followTemplate.content,
        },
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) internalNotify(InternalResponseType.SaveFollowTemplate, NotifType.Success);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleChangeInitialEngagementTitle(e: ChangeEvent<HTMLTextAreaElement>) {
    setMessagePanel((prev) => ({
      ...prev,
      initialEngagementTemplate: { ...prev.initialEngagementTemplate, title: e.target.value },
    }));
  }
  function handleChangeInitialEngagementContent(e: ChangeEvent<HTMLInputElement>) {
    setMessagePanel((prev) => ({
      ...prev,
      initialEngagementTemplate: { ...prev.initialEngagementTemplate, content: e.target.value },
    }));
  }
  async function handleToggleInitialEngagementTemplate(e: ChangeEvent<HTMLInputElement>) {
    try {
      const toggle = e.target.checked;
      const res = await clientFetchApi<boolean, boolean>("/api/message/ToggleInitialEngagmentTemplate", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "isEnable", value: toggle.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setMessagePanel((prev) => ({
          ...prev,
          initialEngagementTemplate: { ...prev.initialEngagementTemplate, isActive: toggle },
        }));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleSaveInitialEngagementTemplate() {
    try {
      const res = await clientFetchApi<{ title: string; buttonText: string }, boolean>(
        "/api/message/UpdateInitialEngagmentTemplate",
        {
          methodType: MethodType.post,
          session: session,
          data: {
            title: messagePanel.initialEngagementTemplate.title,
            buttonText: messagePanel.initialEngagementTemplate.content,
          },
          queries: undefined,
          onUploadProgress: undefined,
        },
      );
      if (res.succeeded) internalNotify(InternalResponseType.SaveInitialEngagementTemplate, NotifType.Success);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleChangeDragDrop(id: any) {
    setMessagePanel((prev) => ({
      ...prev,
      language: id,
    }));
  }
  async function handleSaveLanguage() {
    if (messagePanel.language === 1e6) return;
    const prevLng = messagePanel.language;
    try {
      setMessagePanel((prev) => ({ ...prev, language: 1e6 }));
      const res = await clientFetchApi<IMessagePanel, boolean>("/api/message/SetDefaultLanguage", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "language", value: messagePanel.language.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) internalNotify(InternalResponseType.SelectLanguage, NotifType.Success);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setMessagePanel((prev) => ({ ...prev, language: prevLng }));
    }
  }
  //-----------Message panel----------------------//
  //-----------Phone Numbers----------------------//
  const [phoneNumbers, setPhoneNumbers] = useState<IFlowPhoneNumber[]>([]);
  const [phoneNumbersNextMaxId, setPhoneNumbersNextMaxId] = useState<string | null>(null);
  const isFetchingPhoneNumbersRef = useRef(false);
  async function handleGetNextPhoneNumbers() {
    if (!phoneNumbersNextMaxId || isFetchingPhoneNumbersRef.current) return;
    isFetchingPhoneNumbersRef.current = true;
    try {
      const res = await clientFetchApi<boolean, IFlowPhoneNumbers>("/api/flow/GetPhoneNumbers", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "nextMaxId", value: phoneNumbersNextMaxId }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setPhoneNumbers((prev) => [...prev, ...res.value.items]);
        setPhoneNumbersNextMaxId(res.value.nextMaxId);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      isFetchingPhoneNumbersRef.current = false;
    }
  }
  //-----------Phone Numbers----------------------//
  function removeMask() {
    changePositionToRelative();
    setIsPopupCOMMENT(false);
    setIsPopupDirect(false);
  }
  async function fetchData() {
    if (!session || !LoginStatus(session)) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const [replySettingRes, phoneNumbersRes] = await Promise.all([
        clientFetchApi<boolean, IAutoReplySetting>("/api/message/GetAutoReplySetting", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IFlowPhoneNumbers>("/api/flow/GetPhoneNumbers", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);
      if (replySettingRes.succeeded) {
        setMessagePanel({
          followTemplate: {
            isActive:
              replySettingRes.value.checkFollowerTemplate !== null &&
              replySettingRes.value.checkFollowerTemplate.isActive,
            content: replySettingRes.value.checkFollowerTemplate
              ? replySettingRes.value.checkFollowerTemplate.buttonText
              : "",
            title: replySettingRes.value.checkFollowerTemplate ? replySettingRes.value.checkFollowerTemplate.title : "",
          },
          initialEngagementTemplate: {
            isActive: replySettingRes.value.initialEngagmentTemplate?.isActive ?? false,
            content: replySettingRes.value.initialEngagmentTemplate?.buttonText ?? "",
            title: replySettingRes.value.initialEngagmentTemplate?.title ?? "",
          },
          language: replySettingRes.value.language,
          likeReplyStory: replySettingRes.value.autoReplyCustomAction.likeReply,
          robotReply: replySettingRes.value.autoReplyCustomAction.hideComment,
        });
      }
      if (phoneNumbersRes.succeeded) {
        setPhoneNumbers(phoneNumbersRes.value.items);
        setPhoneNumbersNextMaxId(phoneNumbersRes.value.nextMaxId);
      }

      setIsDataLoaded(true);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingStaus(false);
      isFetchingRef.current = false;
    }
  }
  if (session?.user.currentIndex === -1) router.push("/user");
  if (session !== undefined && !session?.user.messagePermission)
    return <NotPermission permissionType={PermissionType.Messages} />;
  return (
    session &&
    session.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Properties)}</title>
          <meta name="description" content="Advanced Instagram post management tool" />
          <meta name="theme-color"></meta>
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
          {/* Add other meta tags as needed */}
        </Head>
        {/* head for SEO */}
        {loadingStatus && <Loading />}
        {!LoginStatus(session) && (
          <main className="pinContainer">
            <MessagePanel
              messagePanel={{
                followTemplate: { isActive: false, content: "", title: "" },
                initialEngagementTemplate: { isActive: false, content: "", title: "" },
                language: Language.English,
                likeReplyStory: false,
                robotReply: false,
              }}
              handleLikeRobotReply={() => {}}
              handleChangeDragDrop={() => {}}
              handleSaveLanguage={() => {}}
            />
            <Customization
              messagePanel={{
                followTemplate: { isActive: false, content: "", title: "" },
                initialEngagementTemplate: { isActive: false, content: "", title: "" },
                language: Language.English,
                likeReplyStory: false,
                robotReply: false,
              }}
              handleToggleFollowTemplate={() => {}}
              handleChangeTitle={() => {}}
              handleChangeContent={() => {}}
              handleSaveFollowerTemplate={() => {}}
              handleToggleInitialEngagementTemplate={() => {}}
              handleChangeInitialEngagementTitle={() => {}}
              handleChangeInitialEngagementContent={() => {}}
              handleSaveInitialEngagementTemplate={() => {}}
            />
            <PhoneNumbers phoneNumbers={[]} hasMore={false} handleGetNextPhoneNumbers={() => {}} />
            {/* <GhostFollower /> */}
          </main>
        )}
        {!loadingStatus && LoginStatus(session) && (
          <main className="pinContainer">
            {/* <WelcomeMessage /> */}
            {/* <BusinessFilter /> */}
            <MessagePanel
              messagePanel={messagePanel}
              handleLikeRobotReply={handleLikeRobotReply}
              handleChangeDragDrop={handleChangeDragDrop}
              handleSaveLanguage={handleSaveLanguage}
            />
            <Customization
              messagePanel={messagePanel}
              handleToggleFollowTemplate={handleToggleFollowTemplate}
              handleChangeTitle={handleChangeFollowTempTitle}
              handleChangeContent={handleChangeFollowTempContent}
              handleSaveFollowerTemplate={handleSaveFollowerTemplate}
              handleToggleInitialEngagementTemplate={handleToggleInitialEngagementTemplate}
              handleChangeInitialEngagementTitle={handleChangeInitialEngagementTitle}
              handleChangeInitialEngagementContent={handleChangeInitialEngagementContent}
              handleSaveInitialEngagementTemplate={handleSaveInitialEngagementTemplate}
            />
            <PhoneNumbers
              phoneNumbers={phoneNumbers}
              hasMore={phoneNumbersNextMaxId !== null}
              handleGetNextPhoneNumbers={handleGetNextPhoneNumbers}
            />
            {/* <GhostFollower /> */}
          </main>
        )}

        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={isPopupCOMMENT}>
          <PopupComment onClose={removeMask} />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={isPopupDirect}>
          <PopupDirect onClose={removeMask} />
        </Modal>
      </>
    )
  );
};

export default Properties;
