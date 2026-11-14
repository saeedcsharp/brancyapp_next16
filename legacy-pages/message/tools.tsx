import Modal from "brancy/components/design/modal";
import EditAutoReply from "brancy/components/messages/popups/editAutoReply";
import SelectProduct from "brancy/components/messages/popups/selectProduct";
import SpecialPayLoadComp from "brancy/components/messages/popups/specialPayLoad";
import AutoReply from "brancy/components/messages/properties/autoreply";
import IceBreaker from "brancy/components/messages/properties/iceBreaker";
import PersistentMenu from "brancy/components/messages/properties/persistentMenu";
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
import { changePositionToFixed, changePositionToRelative } from "brancy/helper/changeMarketAdsStyle";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LoginStatus, packageStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { AutoReplyPayLoadType, IceOrPersistent, MediaProductType, SpecialPayLoad } from "brancy/models/enums";
import {
  ICreateGeneralAutoReply,
  IGeneralAutoReply,
  IIceBreaker,
  IProduct_FullProduct,
  IProduct_ShortProduct,
  IProfileButtons,
  ISpecialPayload,
  IUpdateProfileButton,
} from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MessageTools = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const [loadingStatus, setLoadingStaus] = useState(true);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct_ShortProduct | null>(null);
  useEffect(() => {
    if (session && !packageStatus(session)) router.push("/upgrade");
    if (session && !LoginStatus(session)) {
      router.push("/");
    }
  }, [session, router]);

  const fetchDataCallback = useCallback(fetchData, [session]);

  useEffect(() => {
    if (session && LoginStatus(session) && !isDataLoaded) {
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
    {
      specialPayload: SpecialPayLoad.ViewShop,
      description: "ViewShop",
    },
    ...(session?.user.isShopper
      ? [
          {
            specialPayload: SpecialPayLoad.ViewWebsite,
            description: "ViewWebsite",
          },
        ]
      : []),
  ];
  const [showSpecialPayLoad, setShowSpecialPayLoad] = useState(false);
  const [specialPayloadInfoForIce, setSpecialPayloadInfoForIce] = useState<ISpecialPayload[]>(specialPayLoadArr);
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
  async function handleDeletePrompt(index: number) {
    setIceBeakerUpdateLoading(true);
    const newList = iceBreakers.profileButtons.items.filter(
      (x) => iceBreakers.profileButtons.items.indexOf(x) !== index,
    );
    try {
      const res = await clientFetchApi<IProfileButtons[], boolean>("/api/message/UpdateIceBreaker", {
        methodType: MethodType.post,
        session: session,
        data: newList,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        if (iceBreakers.profileButtons.items[index].specialPayload !== null) {
          setSpecialPayloadInfoForIce((prev) => [
            ...prev,
            specialPayLoadArr.find((x) => x.specialPayload === iceBreakers.profileButtons.items[index].specialPayload)!,
          ]);
        }
        setIceBreakers((prev) => ({
          ...prev,
          profileButtons: {
            items: newList,
          },
        }));
        setIceBeakerUpdateLoading(false);
        internalNotify(InternalResponseType.deleteIceBreaker, NotifType.Success);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  //-----------Ice Breaker----------------------//
  //-----------persistent Menu----------------------//
  const [persistentMenusUpdateLoading, setPersistentMenusUpdateLoading] = useState(false);
  const [persistentMenus, setPersistentMenus] = useState<IIceBreaker>({
    isActive: true,
    profileButtons: { items: [] },
    updateTime: 0,
  });
  async function handleDeletePromptPersistentMenu(index: number) {
    setPersistentMenusUpdateLoading(true);
    const newList = persistentMenus.profileButtons.items.filter(
      (x) => persistentMenus.profileButtons.items.indexOf(x) !== index,
    );
    try {
      const res = await clientFetchApi<IProfileButtons[], boolean>("/api/message/UpdatePersistentMenu", {
        methodType: MethodType.post,
        session: session,
        data: newList,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        if (persistentMenus.profileButtons.items[index].specialPayload !== null) {
          setSpecialPayloadInfoForPersistent((prev) => [
            ...prev,
            specialPayLoadArr.find(
              (x) => x.specialPayload === persistentMenus.profileButtons.items[index].specialPayload,
            )!,
          ]);
        }
        setPersistentMenus((prev) => ({
          ...prev,
          profileButtons: { items: newList },
        }));
        setPersistentMenusUpdateLoading(false);
        internalNotify(InternalResponseType.deleteIceBreaker, NotifType.Success);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleShowQuickReply(index: string | null, productId?: string) {
    if (productId && productId !== "") {
      const selectedAutoReply = autoReplies.find((x) => x.id === index);
      if (selectedAutoReply && selectedAutoReply.automaticType === AutoReplyPayLoadType.ConnectProduct) {
        try {
          const res = await clientFetchApi<boolean, IProduct_FullProduct>("/api/product/getFullProduct", {
            methodType: MethodType.get,
            session: session,
            queries: [{ key: "productId", value: productId }],
          });
          if (res.succeeded) {
            setSelectedProduct(res.value.shortProduct);
          } else notify(res.info.responseType, NotifType.Warning);
        } catch (error) {
          notify(ResponseType.Unexpected, NotifType.Error);
        }
      }
    }
    setShowIndexAutoReply(index);
  }
  //-----------persistent Menu----------------------//
  //-----------General Message----------------------//
  const [autoReplies, setAutoReplies] = useState<IGeneralAutoReply[]>([]);
  const [showIndexAutoReply, setShowIndexAutoReply] = useState<string | null>(null);
  async function handleSaveAutoReply(autoReply: ICreateGeneralAutoReply) {
    try {
      const res = await clientFetchApi<ICreateGeneralAutoReply, IGeneralAutoReply>(
        "/api/message/CreateGeneralAutoReply",
        {
          methodType: MethodType.post,
          session: session,
          data: autoReply,
          queries: undefined,
          onUploadProgress: undefined,
        },
      );
      if (res.succeeded && autoReply.id !== "") {
        setAutoReplies((prev) => prev.map((x) => (x.id !== res.value.id ? x : res.value)));
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
  async function handleActiveAutoReply(e: ChangeEvent<HTMLInputElement>, id: string) {
    try {
      const toggle = e.target.checked;
      const res = await clientFetchApi<boolean, boolean>(
        "Instagramer" + `/Message/${toggle ? "ResumeGeneralAutoReply" : "PauseGeneralAutoReply"}`,
        {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [{ key: "id", value: id.toString() }],
          onUploadProgress: undefined,
        },
      );
      if (res.succeeded) {
        setAutoReplies((prev) =>
          prev.map((x) =>
            x.id !== id
              ? x
              : {
                  ...x,
                  pauseTime: toggle ? null : Date.now(),
                },
          ),
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
      const res = await clientFetchApi<boolean, boolean>(
        "Instagramer" + `/Message/${on ? "ResumeAllGeneralAutoReplies" : "PauseAllGeneralAutoReplies"}`,
        {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        },
      );
      if (res.succeeded) {
        setAutoReplies((prev) =>
          prev.map((x) => ({
            ...x,
            pauseTime: on ? null : Date.now(),
          })),
        );
        internalNotify(
          on ? InternalResponseType.AutoGeneralOn : InternalResponseType.AutoGeneralOff,
          NotifType.Success,
        );
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleGetNextAutoreply(nexMaxId: string) {
    try {
      const res = await clientFetchApi<boolean, IGeneralAutoReply[]>("/api/message/GetGeneralAutoReplies", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "nextMaxId", value: nexMaxId.toString() }],
        onUploadProgress: undefined,
      });
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
    setShowSpecialPayLoad(false);
  }
  function handleShowSpecialPayLoad(type: IceOrPersistent) {
    setType(type);
    changePositionToFixed();
    setShowSpecialPayLoad(true);
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
      const [iceRes, persistentRes, generalMsgRes] = await Promise.all([
        clientFetchApi<boolean, IIceBreaker>("/api/message/GetIceBreaker", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IIceBreaker>("/api/message/GetPersistentMenu", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IGeneralAutoReply[]>("/api/message/GetGeneralAutoReplies", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);
      if (iceRes.succeeded) {
        setIceBreakers(iceRes.value);
        setSpecialPayloadInfoForPersistent(
          specialPayLoadArr.filter((x) =>
            persistentRes.value.profileButtons.items.every((y) => y.specialPayload !== x.specialPayload),
          ),
        );
      }
      if (persistentRes.succeeded) {
        setPersistentMenus(persistentRes.value);
        setSpecialPayloadInfoForIce(
          specialPayLoadArr.filter((x) =>
            iceRes.value.profileButtons.items.every((y) => y.specialPayload !== x.specialPayload),
          ),
        );
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
    removeMask();
    if (type === IceOrPersistent.PersistentMenu) {
      setPersistentMenusUpdateLoading(true);
      const newList = [...persistentMenus.profileButtons.items, addNewObj];
      try {
        const res = await clientFetchApi<IUpdateProfileButton[], boolean>("/api/message/UpdatePersistentMenu", {
          methodType: MethodType.post,
          session: session,
          data: newList,
          queries: undefined,
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          internalNotify(InternalResponseType.SaveIceBreaker, NotifType.Success);
          try {
            const res = await clientFetchApi<boolean, IIceBreaker>("/api/message/GetPersistentMenu", {
              methodType: MethodType.get,
              session: session,
              data: undefined,
              queries: undefined,
              onUploadProgress: undefined,
            });
            if (res.succeeded) {
              setPersistentMenus(res.value);
              setSpecialPayloadInfoForPersistent(
                specialPayLoadArr.filter((x) =>
                  res.value.profileButtons.items.every((y) => y.specialPayload !== x.specialPayload),
                ),
              );
            } else notify(res.info.responseType, NotifType.Warning);
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
        const res = await clientFetchApi<IProfileButtons[], boolean>("/api/message/UpdateIceBreaker", {
          methodType: MethodType.post,
          session: session,
          data: newList2,
          queries: undefined,
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          internalNotify(InternalResponseType.SaveIceBreaker, NotifType.Success);
          try {
            const res = await clientFetchApi<boolean, IIceBreaker>("/api/message/GetIceBreaker", {
              methodType: MethodType.get,
              session: session,
              data: undefined,
              queries: undefined,
              onUploadProgress: undefined,
            });
            if (res.succeeded) {
              setIceBreakers(res.value);
              setSpecialPayloadInfoForIce(
                specialPayLoadArr.filter((x) =>
                  res.value.profileButtons.items.every((y) => y.specialPayload !== x.specialPayload),
                ),
              );
            } else notify(res.info.responseType, NotifType.Warning);
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
      const res = await clientFetchApi<boolean, boolean>("/api/message/TogglePersistentMenu", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "isEnabled", value: toggle.toString() }],
        onUploadProgress: undefined,
      });
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
      const res = await clientFetchApi<boolean, boolean>("/api/message/ToggleIceBreaker", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "isEnabled", value: toggle.toString() }],
        onUploadProgress: undefined,
      });
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
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.navbarTools)}</title>
          <meta name="description" content="Advanced Instagram message automation tools" />
          <meta name="robots" content="index, follow" />
        </Head>
        {loadingStatus && <Loading />}
        {!LoginStatus(session) && (
          <main className="pinContainer">
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
            <AutoReply
              autoReplies={[]}
              handleShowEditAutoreply={() => {}}
              handleGeneralActiveAutoreply={() => {}}
              handleGetNextAutoreply={() => {}}
            />
          </main>
        )}
        {!loadingStatus && LoginStatus(session) && (
          <main className="pinContainer">
            <PersistentMenu
              updateLoading={persistentMenusUpdateLoading}
              persiatantMenus={persistentMenus}
              handleDeletePrompt={handleDeletePromptPersistentMenu}
              handleActivePersistentMenu={handleTogglePersistentMenu}
              handleShowSpecialPayLoad={handleShowSpecialPayLoad}
            />
            <IceBreaker
              iceBeakerUpdateLoading={iceBeakerUpdateLoading}
              iceBreakers={iceBreakers}
              handleShowSpecialPayLoad={handleShowSpecialPayLoad}
              handleActiveIceBreaker={handleToggleIceBreaker}
              handleDeletePrompt={handleDeletePrompt}
            />
            <AutoReply
              autoReplies={autoReplies}
              handleShowEditAutoreply={handleShowQuickReply}
              handleGeneralActiveAutoreply={handleGeneralActiveAutoreply}
              handleGetNextAutoreply={handleGetNextAutoreply}
            />
          </main>
        )}

        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showSpecialPayLoad}>
          <SpecialPayLoadComp
            specialPayloads={
              type === IceOrPersistent.PersistentMenu ? specialPayloadInfoForPersistent : specialPayloadInfoForIce
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
            selectedProduct={selectedProduct}
            setShowProductPopup={() => setShowProductPopup(true)}
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
                productId: "",
              }
            }
          />
        </Modal>
        <Modal closePopup={() => setShowProductPopup(false)} classNamePopup={"popup"} showContent={showProductPopup}>
          <SelectProduct
            backToAutoreply={() => {
              setShowProductPopup(false);
              setShowIndexAutoReply(null);
            }}
            removeMask={() => setShowProductPopup(false)}
            saveSelectProduct={(product) => {
              setShowProductPopup(false);
              setSelectedProduct(product);
            }}
          />
        </Modal>
      </>
    )
  );
};

export default MessageTools;
