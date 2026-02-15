import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "saeed/components/design/modal";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import AddPartner from "saeed/components/setting/general/popup/addPartner";
import DeletePartner from "saeed/components/setting/general/popup/deletePartner";
import DeleteSession from "saeed/components/setting/general/popup/deleteSession";
import ActivityHistory from "saeed/components/setting/subAdmin/activityHistory";
import Partners from "saeed/components/setting/subAdmin/partner";
import { LoginStatus, packageStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { ICreatePartner, IPartner, ISession, IUpdatePartner } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";

const SubAdmin = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const { t } = useTranslation();

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const [sessions, setSessions] = useState<ISession[] | null>(null);
  const [showDeleteSession, setShowDeleteSession] = useState<ISession | null>(null);
  const [showAddPartner, setShowAddPartner] = useState<IPartner | null>(null);
  const [partners, setPartners] = useState<IPartner[] | null>(null);
  const [showDeletePartner, setShowDeletePartner] = useState<IPartner | null>(null);

  const fetchDataCallback = useCallback(fetchData, [session]);

  useEffect(() => {
    if (session && LoginStatus(session) && !isDataLoaded) {
      fetchDataCallback();
    }
  }, [session, fetchDataCallback, isDataLoaded]);

  async function fetchData() {
    if (!session || !LoginStatus(session)) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const [sessionRes, partnerRes] = await Promise.all([
        GetServerResult<boolean, ISession[]>(MethodType.get, session, "User/Session/GetSessions"),
        RoleAccess(session)
          ? GetServerResult<boolean, IPartner[]>(MethodType.get, session, "Instagramer/Account/GetPartners")
          : Promise.resolve({
              succeeded: false,
              value: null,
              info: { responseType: ResponseType.Unexpected },
            }),
      ]);
      console.log("partnerRes", partnerRes);
      if (sessionRes.succeeded) setSessions(sessionRes.value);
      if (partnerRes.succeeded) setPartners(partnerRes.value);
      if (!sessionRes.succeeded) notify(sessionRes.info.responseType, NotifType.Warning);

      setIsDataLoaded(true);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      isFetchingRef.current = false;
    }
  }

  async function handleGetNextSession(nextMaxId: number) {
    try {
      const res = await GetServerResult<boolean, ISession[]>(
        MethodType.get,
        session,
        "User/Session/GetSessions",
        null,
        [{ key: "nextMaxId", value: nextMaxId.toString() }]
      );
      if (res.succeeded && nextMaxId === undefined) setSessions(res.value);
      else if (res.succeeded && nextMaxId !== undefined) {
        setSessions((prev) => [...prev!, ...res.value]);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  async function handleDeleteSession(sessionId: string) {
    try {
      const res = await GetServerResult<boolean, boolean>(MethodType.get, session, "User/Session/DeleteSession", null, [
        { key: "sessionId", value: sessionId },
      ]);
      if (res.succeeded) {
        setSessions(sessions!.filter((x) => x.sessionId !== sessionId));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setShowDeleteSession(null);
    }
  }

  async function handleSavePartner(addNewObj: ICreatePartner): Promise<void> {
    try {
      const res = await GetServerResult<ICreatePartner, IPartner>(
        MethodType.post,
        session,
        "Instagramer/Account/CreatePartner",
        addNewObj
      );

      if (res.succeeded) {
        console.log("create partner", res.value);
        setPartners((prev) => (prev ? [...prev, res.value] : [res.value]));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setShowAddPartner(null);
    }
  }

  async function handleUpdatePartner(addNewObj: IUpdatePartner): Promise<void> {
    try {
      const res = await GetServerResult<ICreatePartner, IPartner>(
        MethodType.post,
        session,
        "Instagramer/Account/UpdatePartner",
        addNewObj
      );
      if (res.succeeded) {
        setPartners((prev) => prev!.map((x) => (x.userId === res.value.userId ? res.value : x)));
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setShowAddPartner(null);
    }
  }

  async function handleDeletePartner(userId: number) {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer/Account/RemovePartner",
        null,
        [{ key: "userId", value: userId.toString() }]
      );
      if (res.succeeded) {
        setPartners((prev) => prev!.filter((x) => x.userId !== userId));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setShowDeletePartner(null);
      setShowAddPartner(null);
    }
  }

  const handleGetNextSessionCallback = useCallback(handleGetNextSession, [session]);
  const handleDeleteSessionCallback = useCallback(handleDeleteSession, [session, sessions]);
  const handleSavePartnerCallback = useCallback(handleSavePartner, [session]);
  const handleUpdatePartnerCallback = useCallback(handleUpdatePartner, [session]);
  const handleDeletePartnerCallback = useCallback(handleDeletePartner, [session]);
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !packageStatus(session)) router.push("/upgrade");
  }, [session]);

  return (
    session &&
    session.user.currentIndex !== -1 && (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_General)}</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="description" content="Manage sub-admins and access settings for Instagram pages in Bran.cy" />
          <meta name="theme-color" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
          <meta
            name="keywords"
            content="sub admin, admin management, instagram, access control, brancy, instagram page management"
          />
          <meta name="author" content="Bran.cy Team" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.brancy.app/setting/subadmin" aria-label="Canonical link" />
        </Head>
        <div className="pinContainer">
          <ActivityHistory
            sessions={sessions}
            handleShowDeleteSession={setShowDeleteSession}
            handleGetNextSessions={handleGetNextSessionCallback}
          />
          <Partners
            partners={partners}
            handleShowEditPartner={(partner: IPartner) => {
              setShowAddPartner(partner);
            }}
            handleShowAddPartner={() => {
              setShowAddPartner({
                approved: false,
                createdTime: 0,
                updateTime: 0,
                userId: 0,
                instagramerId: 0,
                pk: "",
                id: "",
                expireTime: Date.now() * 1e3 + 3960000,
                roles: [],
                phoneNumber: "",
                countryCode: "",
                rejected: false,
              });
            }}
            handleDeletePartner={handleDeletePartnerCallback}
          />
        </div>

        <Modal
          closePopup={() => setShowDeleteSession(null)}
          classNamePopup={"popupSendFile"}
          showContent={showDeleteSession !== null}>
          <DeleteSession
            session={showDeleteSession!}
            removeMask={() => setShowDeleteSession(null)}
            handleDeleteSession={handleDeleteSessionCallback}
          />
        </Modal>
        <Modal
          closePopup={() => setShowAddPartner(null)}
          classNamePopup={"popup"}
          showContent={showAddPartner !== null}>
          <AddPartner
            partner={showAddPartner!}
            removeMask={() => setShowAddPartner(null)}
            handleSavePartner={handleSavePartnerCallback}
            handleShowDeletePartner={(partner: IPartner) => setShowDeletePartner(partner)}
            handleUpdatePartner={handleUpdatePartnerCallback}
          />
        </Modal>
        <Modal
          closePopup={() => setShowDeletePartner(null)}
          classNamePopup={"popup"}
          showContent={showDeletePartner !== null}>
          <DeletePartner
            partner={showDeletePartner!}
            removeMask={() => setShowDeletePartner(null)}
            handleDeletePartner={handleDeletePartnerCallback}
          />
        </Modal>
      </>
    )
  );
};

export default SubAdmin;
