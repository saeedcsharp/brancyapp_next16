import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "brancy/components/design/modal";
import DomainManager from "brancy/components/market/properties/domainManager";
import Features from "brancy/components/market/properties/features";
import Link from "brancy/components/market/properties/link";
import AddNewLink from "brancy/components/market/properties/popups/addNewLink";
import DeleteLink from "brancy/components/market/properties/popups/deletLink";
import EditLink from "brancy/components/market/properties/popups/editLink";
import FeaturePopUp from "brancy/components/market/properties/popups/featurePopup";
import StatisticsLinks from "brancy/components/market/properties/popups/statisticsLink";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import { changePositionToFixed, changePositionToRelative } from "brancy/helper/changeMarketAdsStyle";
import { LoginStatus, packageStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { InstagramerAccountInfo } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import {
  ILink,
  IOrderFeatures,
  ISaveLink,
  IUpdateFeatureOrder,
  IUpdateLink,
  IUpdateOrderLink,
} from "brancy/models/market/properties";

const Properties = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [showAddNewLink, setShowAddNewLink] = useState(false);
  const [showFeatureBox, setShowFeatureBox] = useState(false);
  const [showLinkBox, setShowLinkBox] = useState(false);
  const [featureId, setFeatureId] = useState(0);
  const [linkId, setLinkId] = useState(1000);
  const [showDeleteLink, setShowDeleteLink] = useState(false);
  const [showEditLink, setSshowEditLink] = useState(false);
  const [linkInfos, setLinkInfos] = useState<ILink[] | null>(null);
  const [features, setFeatures] = useState<IOrderFeatures | null>(null);
  const [instagramerInfo, setInstagramerInfo] = useState<InstagramerAccountInfo | null>(null);
  function handleShowFeatureBox(featureId: number) {
    changePositionToFixed();
    setFeatureId(featureId);
    setShowFeatureBox(true);
  }
  function handleShowDotIcons(e: MouseEvent) {
    e.stopPropagation();
    const index = parseInt(e.currentTarget.id);
    if (linkId === index) {
      setLinkId(1000);
      return;
    }
    setLinkId(index);
  }
  function handleClickOnIcon(e: MouseEvent) {
    e.stopPropagation();
    const icon = e.currentTarget.id;
    switch (icon) {
      case t(LanguageKey.edit):
        setSshowEditLink(true);
        break;
      case t(LanguageKey.navbar_Statistics):
        setShowLinkBox(true);
        break;
      case t(LanguageKey.delete):
        setShowDeleteLink(true);
        break;
    }
  }
  function handleRemoveMask() {
    changePositionToRelative();
    setShowFeatureBox(false);
    setShowLinkBox(false);
    setShowAddNewLink(false);
    setShowDeleteLink(false);
    setSshowEditLink(false);
  }
  async function handleAddNewLink(newLink: ISaveLink) {
    const instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    if (!instagramerId) return;
    var res = await clientFetchApi<ISaveLink, boolean>("/api/link/CreateLink", {
      methodType: MethodType.post,
      session: session,
      data: newLink,
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.value) {
      fetchData();
    }
    console.log("Add New Link", newLink);
  }
  async function handleUpdateLink(updatedLink: IUpdateLink) {
    console.log("updatedLink", updatedLink);
    try {
      var res = await clientFetchApi<ISaveLink, boolean>("/api/link/UpdateLink", {
        methodType: MethodType.post,
        session: session,
        data: updatedLink,
        queries: [{ key: "linkId", value: updatedLink.linkId.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        fetchData();
      } else notify(res.info.responseType, NotifType.Error);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }

    console.log(updatedLink);
  }
  async function handleDeleteLink(linkId: number) {
    const instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    if (!instagramerId) return;
    var res = await clientFetchApi<string, boolean>("/api/link/deleteLink", {
      methodType: MethodType.get,
      session: session,
      data: null,
      queries: [{ key: "id", value: linkId.toString() }],
      onUploadProgress: undefined,
    });
    if (res.value) setLinkInfos((prev) => prev?.filter((x) => x.id !== linkId)!);
    handleRemoveMask();
  }
  async function handleUpdateOrderLinks(orderLinks: IUpdateOrderLink) {
    var res = await clientFetchApi<IUpdateOrderLink, boolean>("/api/link/UpdateOrders", {
      methodType: MethodType.post,
      session: session,
      data: orderLinks,
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.value) {
      //fetchData();
    }
    console.log("orderLinks", orderLinks);
  }
  async function handleUpdatefeatures(updateFeatures: IUpdateFeatureOrder) {
    console.log("updateFeatures", updateFeatures);
    var res = await clientFetchApi<IUpdateFeatureOrder, boolean>("/api/bio/UpdateOrderItems", {
      methodType: MethodType.post,
      session: session,
      data: updateFeatures,
      queries: undefined,
      onUploadProgress: undefined,
    });
    // setFeatures(updateFeatures);
    if (res.value) {
      //fetchData();
    }
    console.log("updateFeatures", updateFeatures);
  }
  const fetchData = async () => {
    try {
      const [links, orderItems, accountInfo] = await Promise.all([
        clientFetchApi<string, ILink[]>("/api/link/GetAllLinks", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<string, IOrderFeatures>("/api/bio/GetOrderItems", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, InstagramerAccountInfo>("/api/account/GetInfo", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);
      if (links.succeeded) setLinkInfos(links.value);
      else notify(links.info.responseType, NotifType.Error);
      if (orderItems.succeeded) setFeatures(orderItems.value);
      else notify(orderItems.info.responseType, NotifType.Error);
      if (accountInfo.succeeded) setInstagramerInfo(accountInfo.value);
      else notify(accountInfo.info.responseType, NotifType.Error);
    } catch (error) {
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    }
  };
  useEffect(() => {
    if (!session) return;
    if (session && !packageStatus(session)) router.push("/upgrade");
    if (!LoginStatus(session)) router.push("/");
    fetchData();
  }, [session]);
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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

        <div onClick={() => setLinkId(1000)} className="pinContainer">
          <DomainManager instagramerInfo={instagramerInfo} />
          <Features showMask={handleShowFeatureBox} features={features} handleUpdateFeature={handleUpdatefeatures} />
          <Link
            data={linkInfos}
            addNewLink={() => {
              setShowAddNewLink(true);
              changePositionToFixed();
            }}
            handleShowDotIcons={handleShowDotIcons}
            handleClickOnIcon={handleClickOnIcon}
            handleUpdateOrderLinks={handleUpdateOrderLinks}
            dotIconIndex={linkId}
          />
        </div>
        <Modal closePopup={handleRemoveMask} classNamePopup={"popup"} showContent={showFeatureBox}>
          <FeaturePopUp removeMask={handleRemoveMask} featureId={featureId} handleAddNewLink={handleAddNewLink} />
        </Modal>

        <Modal closePopup={handleRemoveMask} classNamePopup={"popup"} showContent={showAddNewLink}>
          <AddNewLink removeMask={handleRemoveMask} handleAddNewLink={handleAddNewLink} />
        </Modal>

        <Modal closePopup={handleRemoveMask} classNamePopup={"popup"} showContent={showLinkBox}>
          <StatisticsLinks removeMask={handleRemoveMask} linkId={linkId} />
        </Modal>

        <Modal closePopup={handleRemoveMask} classNamePopup={"popupSendFile"} showContent={showDeleteLink}>
          <DeleteLink linkId={linkId} removeMask={handleRemoveMask} handleDeleteLink={handleDeleteLink} />
        </Modal>

        <Modal closePopup={handleRemoveMask} classNamePopup={"popup"} showContent={showEditLink}>
          <EditLink
            removeMask={handleRemoveMask}
            handleUpdateLink={handleUpdateLink}
            info={linkInfos?.find((x) => x.id === linkId)!}
          />
        </Modal>
      </>
    )
  );
};

export default Properties;
