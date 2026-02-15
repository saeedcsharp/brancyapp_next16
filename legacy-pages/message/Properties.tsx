import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "saeed/components/design/modal";
import EditAutoReply from "saeed/components/messages/popups/editAutoReply";
import SpecialPayLoadComp from "saeed/components/messages/popups/specialPayLoad";
import AutoReply from "saeed/components/messages/properties/autoreply";
import IceBreaker from "saeed/components/messages/properties/iceBreaker";
import MessagePanel from "saeed/components/messages/properties/messagePanel";
import PersistentMenu from "saeed/components/messages/properties/persistentMnue";
import PopupComment from "saeed/components/messages/properties/popupComment";
import PopupDirect from "saeed/components/messages/properties/popupDirect";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import NotPermission, {
  PermissionType,
} from "saeed/components/notOk/notPermission";
import {
  changePositionToFixed,
  changePositionToRelative,
} from "saeed/helper/changeMarketAdsStyle";
import {
  LoginStatus,
  packageStatus,
  RoleAccess,
} from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import {
  AutoReplyPayLoadType,
  IceOrPersistent,
  Language,
  MediaProductType,
  SpecialPayLoad,
} from "saeed/models/messages/enum";
import {
  IAutoReplySetting,
  ICreateGeneralAutoReply,
  IGeneralAutoReply,
  IIceBreaker,
  IMessagePanel,
  IProfileButtons,
  ISpecialPayload,
  IUpdateProfileButton,
} from "saeed/models/messages/properies";
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
    if (
      session &&
      LoginStatus(session) &&
      RoleAccess(session, PartnerRole.Message) &&
      !isDataLoaded
    ) {
      fetchDataCallback();
    }
  }, [session, fetchDataCallback, isDataLoaded]);

  //-----------secial payload----------------------//
  const [type, setType] = useState(IceOrPersistent.IceBreaker);
  const specialPayLoadArr: ISpecialPayload[] = [
    {
      description: "ChangeLanguage",
      specialPayload: SpecialPayLoad.ChangeLanguage,
    },
    {
      specialPayload: SpecialPayLoad.CreateTicket,
      description: "CreateTicket",
    },
    // {
    //   specialPayload: SpecialPayLoad.SearchProduct,
    //   description: "SearchProduct",
    // },
    // {
    //   specialPayload: SpecialPayLoad.ViewBusinessTime,
    //   description: "ViewBusinessTime",
    // },
    // {
    //   specialPayload: SpecialPayLoad.ViewPrice,
    //   description: "ViewPrice",
    // },
    // {
    //   specialPayload: SpecialPayLoad.ViewRole,
    //   description: "ViewRole",
    // },
    // {
    //   specialPayload: SpecialPayLoad.ViewShop,
    //   description: "ViewShop",
    // },
    {
      specialPayload: SpecialPayLoad.ViewWebsite,
      description: "ViewWebsite",
    },
  ];
  const [showSpecialPayLoad, setShowSpecialPayLoad] = useState(false);
  const [specialPayloadInfoForIce, setSpecialPayloadInfoForIce] =
    useState<ISpecialPayload[]>(specialPayLoadArr);
  const [specialPayloadInfoForPersistent, setSpecialPayloadInfoForPersistent] =
    useState<ISpecialPayload[]>(specialPayLoadArr);
  //-----------secial payload----------------------//

  //-----------Ice Breaker----------------------//
  const [iceBreakers, setIceBreakers] = useState<IIceBreaker>({
    isActive: true,
    profileButtons: { items: [] },
    updateTime: 0,
  });
  const [iceBeakerUpdateLoading, setIceBeakerUpdateLoading] = useState(false);
  function handleChangeInput(e: ChangeEvent<HTMLInputElement>, index: number) {
    setIceBreakers((prev) => ({
      ...prev,
      profileButtons: {
        items: prev.profileButtons.items.map((x) =>
          prev.profileButtons.items.indexOf(x) !== index
            ? x
            : {
                ...x,
                title: e.target.value,
              }
        ),
      },
    }));
  }
  function handleChangeTextArea(
    e: ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) {
    setIceBreakers((prev) => ({
      ...prev,
      profileButtons: {
        items: prev.profileButtons.items.map((x) =>
          prev.profileButtons.items.indexOf(x) !== index
            ? x
            : {
                ...x,
                response: e.target.value,
              }
        ),
      },
    }));
  }
  async function handleDeletePrompt(index: number) {
    setIceBeakerUpdateLoading(true);
    const newList = iceBreakers.profileButtons.items.filter(
      (x) => iceBreakers.profileButtons.items.indexOf(x) !== index
    );
    try {
      const res = await GetServerResult<IProfileButtons[], boolean>(
        MethodType.post,
        session,
        "Instagramer/Message/UpdateIceBreaker",
        iceBreakers.profileButtons.items
      );
      if (res.succeeded) {
        if (iceBreakers.profileButtons.items[index].specialPayload !== null) {
          setSpecialPayloadInfoForIce((prev) => [
            ...prev,
            specialPayLoadArr.find(
              (x) =>
                x.specialPayload ===
                iceBreakers.profileButtons.items[index].specialPayload
            )!,
          ]);
        }
        setIceBreakers((prev) => ({
          ...prev,
          profileButtons: {
            items: newList,
          },
        }));
        setIceBeakerUpdateLoading(false);
        internalNotify(
          InternalResponseType.deleteIceBreaker,
          NotifType.Success
        );
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  //-----------Ice Breaker----------------------//
  //-----------persistent Menu----------------------//
  const [persistentMenusUpdateLoading, setPersistentMenusUpdateLoading] =
    useState(false);
  const [persistentMenus, setPersistentMenus] = useState<IIceBreaker>({
    isActive: true,
    profileButtons: { items: [] },
    updateTime: 0,
  });
  function handleChangeInputPersistentMenu(
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    setPersistentMenus((prev) => ({
      ...prev,
      profileButtons: {
        items: prev.profileButtons.items.map((x) =>
          prev.profileButtons.items.indexOf(x) !== index
            ? x
            : {
                ...x,
                title: e.target.value,
              }
        ),
      },
    }));
  }
  function handleChangeTextAreaPersistentMenu(
    e: ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) {
    setPersistentMenus((prev) => ({
      ...prev,
      profileButtons: {
        items: prev.profileButtons.items.map((x) =>
          prev.profileButtons.items.indexOf(x) !== index
            ? x
            : {
                ...x,
                response: e.target.value,
              }
        ),
      },
    }));
  }
  async function handleDeletePromptPersistentMenu(index: number) {
    setPersistentMenusUpdateLoading(true);
    const newList = persistentMenus.profileButtons.items.filter(
      (x) => persistentMenus.profileButtons.items.indexOf(x) !== index
    );
    try {
      const res = await GetServerResult<IProfileButtons[], boolean>(
        MethodType.post,
        session,
        "Instagramer/Message/UpdatePersistentMenu",
        newList
      );
      if (res.succeeded) {
        if (
          persistentMenus.profileButtons.items[index].specialPayload !== null
        ) {
          setSpecialPayloadInfoForPersistent((prev) => [
            ...prev,
            specialPayLoadArr.find(
              (x) =>
                x.specialPayload ===
                persistentMenus.profileButtons.items[index].specialPayload
            )!,
          ]);
        }
        setPersistentMenus((prev) => ({
          ...prev,
          profileButtons: { items: newList },
        }));
        setPersistentMenusUpdateLoading(false);
        internalNotify(
          InternalResponseType.deleteIceBreaker,
          NotifType.Success
        );
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
    // setPersistentMenus((prev) => ({
    //   ...prev,
    //   profileButtons: {
    //     items: prev.profileButtons.items.filter(
    //       (x) => prev.profileButtons.items.indexOf(x) !== index
    //     ),
    //   },
    // }));
  }
  //-----------persistent Menu----------------------//
  //-----------Message panel----------------------//
  const [messagePanel, setMessagePanel] = useState<IMessagePanel>({
    followTemplate: { isActive: true, content: "", title: "" },
    language: Language.English,
    likeReplyStory: true,
    robotReply: true,
  });
  async function handleHideRobotReply(e: ChangeEvent<HTMLInputElement>) {
    try {
      const toggle = e.target.checked;
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer/Message/ToggleHideCommentAutoReply",
        null,
        [{ key: "isHide", value: toggle.toString() }]
      );
      if (res.succeeded) {
        setMessagePanel((prev) => ({
          ...prev,
          robotReply: toggle,
        }));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleLikeRobotReply(e: ChangeEvent<HTMLInputElement>) {
    try {
      const toggle = e.target.checked;
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer/Message/ToggleLikeReplyAutoReply",
        null,
        [{ key: "isLike", value: toggle.toString() }]
      );
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
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer/Message/ToggleCheckFollowerTemplate",
        null,
        [{ key: "isEnable", value: toggle.toString() }]
      );
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
      const res = await GetServerResult<IMessagePanel, boolean>(
        MethodType.post,
        session,
        "Instagramer/Message/UpdateCheckFollowerTemplate",
        {
          title: messagePanel.followTemplate.title,
          buttonText: messagePanel.followTemplate.content,
        }
      );
      if (res.succeeded)
        internalNotify(
          InternalResponseType.SaveFollowTemplate,
          NotifType.Success
        );
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
      const res = await GetServerResult<IMessagePanel, boolean>(
        MethodType.get,
        session,
        "Instagramer/Message/SetDefaultLanguage",
        null,
        [{ key: "language", value: messagePanel.language.toString() }]
      );
      if (res.succeeded)
        internalNotify(InternalResponseType.SelectLanguage, NotifType.Success);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setMessagePanel((prev) => ({ ...prev, language: prevLng }));
    }
  }
  //-----------Message panel----------------------//
  //-----------General Message----------------------//
  const [autoReplies, setAutoReplies] = useState<IGeneralAutoReply[]>([]);
  const [showIndexAutoReply, setShowIndexAutoReply] = useState<string | null>(
    null
  );
  async function handleSaveAutoReply(autoReply: ICreateGeneralAutoReply) {
    console.log("autoReplyyyyyyy", autoReply);
    try {
      const res = await GetServerResult<
        ICreateGeneralAutoReply,
        IGeneralAutoReply
      >(
        MethodType.post,
        session,
        "Instagramer/Message/CreateGeneralAutoReply",
        autoReply
      );
      console.log("CreateGeneralAutoReply res", res);
      if (res.succeeded && autoReply.id !== "") {
        setAutoReplies((prev) =>
          prev.map((x) => (x.id !== res.value.id ? x : res.value))
        );
      } else if (res.succeeded && autoReply.id === "") {
        setAutoReplies((prev) => [res.value, ...prev]);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setShowIndexAutoReply(null);
    }
  }
  async function handleActiveAutoReply(
    e: ChangeEvent<HTMLInputElement>,
    id: string
  ) {
    try {
      const toggle = e.target.checked;
      console.log("Toggle:", toggle);
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer" +
          `/Message/${
            toggle ? "ResumeGeneralAutoReply" : "PauseGeneralAutoReply"
          }`,
        null,
        [{ key: "id", value: id.toString() }]
      );
      if (res.succeeded) {
        setAutoReplies((prev) =>
          prev.map((x) =>
            x.id !== id
              ? x
              : {
                  ...x,
                  pauseTime: toggle ? null : Date.now(),
                }
          )
        );
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleGeneralActiveAutoreply(on: boolean) {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer" +
          `/Message/${
            on ? "ResumeAllGeneralAutoReplies" : "PauseAllGeneralAutoReplies"
          }`
      );
      if (res.succeeded) {
        setAutoReplies((prev) =>
          prev.map((x) => ({
            ...x,
            pauseTime: on ? null : Date.now(),
          }))
        );
        internalNotify(
          on
            ? InternalResponseType.AutoGeneralOn
            : InternalResponseType.AutoGeneralOff,
          NotifType.Success
        );
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleGetNextAutoreply(nexMaxId: string) {
    try {
      const res = await GetServerResult<boolean, IGeneralAutoReply[]>(
        MethodType.get,
        session,
        "Instagramer/Message/GetGeneralAutoReplies",
        null,
        [{ key: "nextMaxId", value: nexMaxId.toString() }]
      );
      if (res.succeeded) {
        setAutoReplies((prev) => [...prev, ...res.value]);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  //-----------General Message----------------------//
  function removeMask() {
    changePositionToRelative();
    setIsPopupCOMMENT(false);
    setIsPopupDirect(false);
    setShowSpecialPayLoad(false);
  }
  function handleShowSpecialPayLoad(type: IceOrPersistent) {
    setType(type);
    changePositionToFixed();
    setShowSpecialPayLoad(true);
  }
  async function fetchData() {
    if (
      !session ||
      !LoginStatus(session) ||
      !RoleAccess(session, PartnerRole.Message)
    ) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const [iceRes, persistentRes, replySettingRes, generalMsgRes] =
        await Promise.all([
          GetServerResult<boolean, IIceBreaker>(
            MethodType.get,
            session,
            "Instagramer/Message/GetIceBreaker"
          ),
          GetServerResult<boolean, IIceBreaker>(
            MethodType.get,
            session,
            "Instagramer/Message/GetPersistentMenu"
          ),
          GetServerResult<boolean, IAutoReplySetting>(
            MethodType.get,
            session,
            "Instagramer/Message/GetAutoReplySetting"
          ),
          GetServerResult<boolean, IGeneralAutoReply[]>(
            MethodType.get,
            session,
            "Instagramer/Message/GetGeneralAutoReplies"
          ),
        ]);
      if (iceRes.succeeded) {
        setIceBreakers(iceRes.value);
        setSpecialPayloadInfoForPersistent(
          specialPayLoadArr.filter((x) =>
            persistentRes.value.profileButtons.items.every(
              (y) => y.specialPayload !== x.specialPayload
            )
          )
        );
      }
      if (persistentRes.succeeded) {
        setPersistentMenus(persistentRes.value);
        setSpecialPayloadInfoForIce(
          specialPayLoadArr.filter((x) =>
            iceRes.value.profileButtons.items.every(
              (y) => y.specialPayload !== x.specialPayload
            )
          )
        );
      }
      if (replySettingRes.succeeded) {
        setMessagePanel({
          followTemplate: {
            isActive:
              replySettingRes.value.checkFollowerTemplate !== null &&
              replySettingRes.value.checkFollowerTemplate.isActive,
            content: replySettingRes.value.checkFollowerTemplate
              ? replySettingRes.value.checkFollowerTemplate.buttonText
              : "",
            title: replySettingRes.value.checkFollowerTemplate
              ? replySettingRes.value.checkFollowerTemplate.title
              : "",
          },
          language: replySettingRes.value.language,
          likeReplyStory: replySettingRes.value.autoReplyCustomAction.likeReply,
          robotReply: replySettingRes.value.autoReplyCustomAction.hideComment,
        });
      }
      if (generalMsgRes.succeeded) {
        setAutoReplies(generalMsgRes.value);
      }

      setIsDataLoaded(true);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingStaus(false);
      isFetchingRef.current = false;
    }
  }
  async function handleSaveSpecialPayLoad(addNewObj: IUpdateProfileButton) {
    console.log("addNewObj", addNewObj);
    removeMask();
    if (type === IceOrPersistent.PersistentMenu) {
      setPersistentMenusUpdateLoading(true);
      const newList = [...persistentMenus.profileButtons.items, addNewObj];
      try {
        const res = await GetServerResult<IUpdateProfileButton[], boolean>(
          MethodType.post,
          session,
          "Instagramer/Message/UpdatePersistentMenu",
          newList
        );
        if (res.succeeded) {
          internalNotify(
            InternalResponseType.SaveIceBreaker,
            NotifType.Success
          );
          try {
            const res = await GetServerResult<boolean, IIceBreaker>(
              MethodType.get,
              session,
              "Instagramer/Message/GetPersistentMenu"
            );
            if (res.succeeded) setPersistentMenus(res.value);
            else notify(res.info.responseType, NotifType.Warning);
          } catch (error) {
            notify(ResponseType.Unexpected, NotifType.Error);
          }
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setPersistentMenusUpdateLoading(false);
      }
    } else {
      setIceBeakerUpdateLoading(true);
      const newList2 = [...iceBreakers.profileButtons.items, addNewObj];
      try {
        const res = await GetServerResult<IProfileButtons[], boolean>(
          MethodType.post,
          session,
          "Instagramer/Message/UpdateIceBreaker",
          newList2
        );
        if (res.succeeded) {
          internalNotify(
            InternalResponseType.SaveIceBreaker,
            NotifType.Success
          );
          try {
            const res = await GetServerResult<boolean, IIceBreaker>(
              MethodType.get,
              session,
              "Instagramer/Message/GetIceBreaker"
            );
            if (res.succeeded) setIceBreakers(res.value);
            else notify(res.info.responseType, NotifType.Warning);
          } catch (error) {
            notify(ResponseType.Unexpected, NotifType.Error);
          }
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setIceBeakerUpdateLoading(false);
      }
    }
  }
  async function handleTogglePersistentMenu(e: ChangeEvent<HTMLInputElement>) {
    try {
      const toggle = e.target.checked;
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer/Message/TogglePersistentMenu",
        null,
        [{ key: "isEnabled", value: toggle.toString() }]
      );
      if (res.succeeded) {
        setPersistentMenus((prev) => ({
          ...prev,
          isActive: toggle,
        }));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleToggleIceBreaker(e: ChangeEvent<HTMLInputElement>) {
    try {
      const toggle = e.target.checked;
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer/Message/ToggleIceBreaker",
        null,
        [{ key: "isEnabled", value: toggle.toString() }]
      );
      if (res.succeeded) {
        setIceBreakers((prev) => ({
          ...prev,
          isActive: toggle,
        }));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
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
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
          />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Properties)}</title>
          <meta
            name="description"
            content="Advanced Instagram post management tool"
          />
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
        {!RoleAccess(session, PartnerRole.Message) && <NotAllowed />}
        {loadingStatus && <Loading />}
        {!LoginStatus(session) && (
          <main className="pinContainer">
            <IceBreaker
              iceBeakerUpdateLoading={false}
              iceBreakers={{
                isActive: false,
                profileButtons: { items: [] },
                updateTime: 0,
              }}
              handleShowSpecialPayLoad={() => {}}
              handleActiveIceBreaker={() => {}}
              handleDeletePrompt={() => {}}
            />
            <PersistentMenu
              updateLoading={false}
              persiatantMenus={{
                isActive: false,
                profileButtons: { items: [] },
                updateTime: 0,
              }}
              handleDeletePrompt={() => {}}
              handleActivePersistentMenu={() => {}}
              handleShowSpecialPayLoad={() => {}}
            />
            <AutoReply
              autoReplies={[]}
              handleShowEditAutoreply={() => {}}
              handleGeneralActiveAutoreply={() => {}}
              handleGetNextAutoreply={() => {}}
            />
            <MessagePanel
              messagePanel={{
                followTemplate: { isActive: false, content: "", title: "" },
                language: Language.English,
                likeReplyStory: false,
                robotReply: false,
              }}
              handleHideRobotReply={() => {}}
              handleLikeRobotReply={() => {}}
              handleToggleFollowTemplate={() => {}}
              handleChangeTitle={() => {}}
              handleChangeContent={() => {}}
              handleSaveFollowerTemplate={() => {}}
              handleChangeDragDrop={() => {}}
              handleSaveLanguage={() => {}}
            />
            {/* <GhostFollower /> */}
          </main>
        )}
        {!loadingStatus && LoginStatus(session) && (
          <main className="pinContainer">
            {/* <WelcomeMessage /> */}
            {/* <BusinessFilter /> */}
            {/* <AutomaticReply /> delete */}
            <IceBreaker
              iceBeakerUpdateLoading={iceBeakerUpdateLoading}
              iceBreakers={iceBreakers}
              handleShowSpecialPayLoad={handleShowSpecialPayLoad}
              handleActiveIceBreaker={handleToggleIceBreaker}
              handleDeletePrompt={handleDeletePrompt}
            />
            <PersistentMenu
              updateLoading={persistentMenusUpdateLoading}
              persiatantMenus={persistentMenus}
              handleDeletePrompt={handleDeletePromptPersistentMenu}
              handleActivePersistentMenu={handleTogglePersistentMenu}
              handleShowSpecialPayLoad={handleShowSpecialPayLoad}
            />
            <AutoReply
              autoReplies={autoReplies}
              handleShowEditAutoreply={setShowIndexAutoReply}
              handleGeneralActiveAutoreply={handleGeneralActiveAutoreply}
              handleGetNextAutoreply={handleGetNextAutoreply}
            />
            <MessagePanel
              messagePanel={messagePanel}
              handleHideRobotReply={handleHideRobotReply}
              handleLikeRobotReply={handleLikeRobotReply}
              handleToggleFollowTemplate={handleToggleFollowTemplate}
              handleChangeTitle={handleChangeFollowTempTitle}
              handleChangeContent={handleChangeFollowTempContent}
              handleSaveFollowerTemplate={handleSaveFollowerTemplate}
              handleChangeDragDrop={handleChangeDragDrop}
              handleSaveLanguage={handleSaveLanguage}
            />
            {/* <GhostFollower /> */}
          </main>
        )}

        <Modal
          closePopup={removeMask}
          classNamePopup={"popup"}
          showContent={isPopupCOMMENT}>
          <PopupComment onClose={removeMask} />
        </Modal>
        <Modal
          closePopup={removeMask}
          classNamePopup={"popup"}
          showContent={isPopupDirect}>
          <PopupDirect onClose={removeMask} />
        </Modal>
        <Modal
          closePopup={removeMask}
          classNamePopup={"popup"}
          showContent={showSpecialPayLoad}>
          <SpecialPayLoadComp
            specialPayloads={
              type === IceOrPersistent.PersistentMenu
                ? specialPayloadInfoForPersistent
                : specialPayloadInfoForIce
            }
            removeMask={removeMask}
            handleSaveSpecialPayLoad={handleSaveSpecialPayLoad}
          />
        </Modal>
        <Modal
          closePopup={() => setShowIndexAutoReply(null)}
          classNamePopup={"popup"}
          showContent={showIndexAutoReply !== null}>
          <EditAutoReply
            setShowQuickReplyPopup={setShowIndexAutoReply}
            handleSaveAutoReply={handleSaveAutoReply}
            handleActiveAutoReply={handleActiveAutoReply}
            autoReply={
              autoReplies.find((x) => x.id === showIndexAutoReply) || {
                id: showIndexAutoReply || "",
                items: [],
                pauseTime: null,
                productType: MediaProductType.AllMedia,
                response: "",
                sendCount: 0,
                sendPr: false,
                shouldFollower: false,
                automaticType: AutoReplyPayLoadType.KeyWord,
                masterFlowId: null,
                promptId: null,
                masterFlow: null,
                prompt: null,
                title: "",
                replySuccessfullyDirected: false,
                customRepliesSuccessfullyDirected: [],
              }
            }
          />
        </Modal>
      </>
    )
  );
};

export default Properties;
