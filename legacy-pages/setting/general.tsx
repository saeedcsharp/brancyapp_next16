import Compressor from "compressorjs";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "saeed/components/design/modal";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import AdminChatBox from "saeed/components/setting/general/popup/adminChatBox";
import CreateTicket from "saeed/components/setting/general/popup/createTicket";
import Profile from "saeed/components/setting/general/profile";
import Support from "saeed/components/setting/general/Support";
import System from "saeed/components/setting/general/system";
import { LoginStatus, packageStatus } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { MethodType, UploadFile } from "saeed/helper/api";
import { StatusReplied } from "saeed/models/messages/enum";
import { PlatformTicketItemType } from "saeed/models/setting/enums";
import {
  ICreateMedia,
  ICreatePlatform,
  IPlatform,
  IPlatformItem,
  IPlatformTicket,
  ITicketInsights,
} from "saeed/models/setting/general";
import { ISendTicketMessage } from "saeed/models/userPanel/message";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

const General = () => {
  const { t } = useTranslation();

  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showRespondedTicket, setShowRespondedTicket] = useState<number | null>(null);
  const [sendingMessages, setSendingMessages] = useState<ISendTicketMessage[]>([]);
  const [platform, setPlatform] = useState<IPlatform>({
    nextMaxId: null,
    ownerInbox: {
      accountType: 0,
      followerCount: 0,
      followsCount: 0,
      igId: null,
      mediaCount: 0,
      name: "",
      profilePic: "",
      userId: "0",
      username: "",
    },
    tickets: [],
  });
  const [ticketInsights, setTicketInsights] = useState<ITicketInsights[]>([]);
  const handleCloseCreateTicket = useCallback(() => {
    setShowCreateTicket(false);
  }, []);

  const handleCreateTicket = async (ticketData: ICreatePlatform) => {
    console.log("Creating ticket with data:", ticketData);
    try {
      const res = await clientFetchApi<ICreatePlatform, IPlatformTicket>("/api/ticket/CreatePlatformTicket", {
        methodType: MethodType.post,
        session: session,
        data: ticketData,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setPlatform((prev) => ({
          ...prev,
          tickets: [res.value, ...prev.tickets],
        }));
        setTicketInsights((prev) => {
          const hasJustCreated = prev.some((insight) => insight.actionStatus === StatusReplied.JustCreated);

          if (hasJustCreated) {
            return prev.map((insight) => {
              if (insight.actionStatus === StatusReplied.JustCreated) {
                return { ...insight, count: insight.count + 1 };
              }
              return insight;
            });
          } else {
            return [...prev, { actionStatus: StatusReplied.JustCreated, count: 1 }];
          }
        });
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setShowCreateTicket(false);
    }
  };
  const handleOpenCreateTicket = useCallback(() => {
    setShowCreateTicket(true);
  }, []);
  async function handleGetMorePlatformTickets() {
    // console.log("Loading more platform tickets...", platform.nextMaxId);
    try {
      if (!platform.nextMaxId) return;
      setIsLoadingMore(true);
      const res = await clientFetchApi<StatusReplied[], IPlatform>("/api/ticket/GetPlatformTicketInbox", {
        methodType: MethodType.post,
        session: session,
        data: [
          StatusReplied.TimerClosed,
          StatusReplied.InstagramerClosed,
          StatusReplied.UserReplied,
          StatusReplied.InstagramerReplied,
          StatusReplied.JustCreated,
        ],
        queries: [{ key: "nextMaxId", value: platform.nextMaxId ?? "" }],
        onUploadProgress: undefined,
      });
      if (res.succeeded)
        setPlatform((prev) => ({
          ...res.value,
          tickets: [...prev.tickets, ...res.value.tickets],
          nextMaxId: res.value.nextMaxId,
        }));
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsLoadingMore(false);
    }
  }
  async function fetchData(statusRepled: StatusReplied[]) {
    try {
      setIsDataLoaded(true);
      const [platformRes, insightRes] = await Promise.all([
        await clientFetchApi<StatusReplied[], IPlatform>("/api/ticket/GetPlatformTicketInbox", {
          methodType: MethodType.post,
          session: session,
          data: statusRepled,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        await clientFetchApi<boolean, ITicketInsights[]>("/api/ticket/GetPlatformTicketInsight", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);
      if (platformRes.succeeded) setPlatform(platformRes.value);
      else notify(platformRes.info.responseType, NotifType.Warning);
      if (insightRes.succeeded) setTicketInsights(insightRes.value);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsDataLoaded(false);
    }
  }
  const handleSendTicketMessage = async (message: ISendTicketMessage) => {
    if (!showRespondedTicket) return;
    console.log("IIsSendingMessage", message);
    setSendingMessages((prev) => [...prev, message]);
    var uploadId = "";
    if (message.itemType === PlatformTicketItemType.Image) {
      const compressedFile = await new Promise<File>((resolve, reject) => {
        new Compressor(message.file!, {
          quality: 0.95,
          maxWidth: 700,
          maxHeight: 700,
          success(result) {
            resolve(new File([result], message.file!.name, { type: result.type }));
          },
          error(err) {
            reject(err);
          },
        });
      });
      const upload = await UploadFile(session, compressedFile);
      uploadId = upload.fileName;
    }
    const createMessage: ICreateMedia = {
      imageUrl: uploadId,
      itemType: message.itemType as PlatformTicketItemType,
      text: message.text ?? "",
    };
    try {
      const res = await clientFetchApi<ICreateMedia, IPlatformItem>("/api/ticket/UpdatePlatformTicket", {
        methodType: MethodType.post,
        session: session,
        data: createMessage,
        queries: [{ key: "ticketId", value: message.ticketId.toString() }],
        onUploadProgress: undefined,
      });

      if (res.succeeded) {
        // Update the ticket with the new message item
        const myTicket = platform.tickets.find((x) => x.ticketId === message.ticketId);
        if (!myTicket) return;
        setPlatform((prev) => ({
          ...prev,
          tickets: prev.tickets.map((ticket) =>
            ticket.ticketId === message.ticketId
              ? {
                  ...ticket,
                  items: [res.value, ...ticket.items],
                  actionTime: Date.now(),
                  actionStatus:
                    myTicket.actionStatus === StatusReplied.InstagramerReplied
                      ? StatusReplied.UserReplied
                      : ticket.actionStatus,
                }
              : ticket,
          ),
        }));

        // Update ticketInsights if status changed from InstagramerReplied to UserReplied
        if (myTicket.actionStatus === StatusReplied.InstagramerReplied) {
          setTicketInsights((prev) => {
            const hasUserReplied = prev.some((insight) => insight.actionStatus === StatusReplied.UserReplied);

            const updatedInsights = prev.map((insight) => {
              if (insight.actionStatus === StatusReplied.InstagramerReplied) {
                return { ...insight, count: Math.max(0, insight.count - 1) };
              }
              if (insight.actionStatus === StatusReplied.UserReplied) {
                return { ...insight, count: insight.count + 1 };
              }
              return insight;
            });

            // If UserReplied doesn't exist, add it
            if (!hasUserReplied) {
              return [...updatedInsights, { actionStatus: StatusReplied.UserReplied, count: 1 }];
            }

            return updatedInsights;
          });
        }
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setSendingMessages((prev) =>
        prev.filter((x) => x.ticketId !== message.ticketId && x.clientContext !== message.clientContext),
      );
    }
  };
  async function handleGetPlatformTicket(ticketId: number, nextMaxId: string | null) {
    if (nextMaxId === null) return;
    try {
      const res = await clientFetchApi<boolean, IPlatformTicket>("/api/ticket/GetPlatformTicket", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          { key: "ticketId", value: ticketId.toString() },
          { key: "nextMaxId", value: nextMaxId },
        ],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        console.log("Fetched more ticket items:", res.value.nextMaxId);
        setPlatform((prev) => ({
          ...prev,
          tickets: prev.tickets.map((ticket) =>
            ticket.ticketId === ticketId
              ? {
                  ...ticket,
                  nextMaxId: res.value.nextMaxId,
                  items: [...res.value.items, ...ticket.items],
                }
              : ticket,
          ),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handlePinTicket(ticketId: number) {
    const isPinned = platform.tickets.find((t) => t.ticketId === ticketId)?.isPin;
    const res = await clientFetchApi<boolean, boolean>("/api/ticket/UpdatePlatformTicketPinStatus", {
      methodType: MethodType.get,
      session: session,
      data: null,
      queries: [
        { key: "ticketId", value: ticketId.toString() },
        {
          key: "isPin",
          value: (!isPinned).toString(),
        },
      ],
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      setPlatform((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) => (t.ticketId === ticketId ? { ...t, isPin: !isPinned } : t)),
      }));
    } else notify(res.info.responseType, NotifType.Warning);
  }
  async function handleCloseTicket(ticketId: number) {
    const closedTicket = platform.tickets.find((t) => t.ticketId === ticketId);
    if (!closedTicket || closedTicket.isClosed) return;
    const res = await clientFetchApi<boolean, boolean>("/api/ticket/ClosePlatformTicket", {
      methodType: MethodType.get,
      session: session,
      data: null,
      queries: [{ key: "ticketId", value: ticketId.toString() }],
      onUploadProgress: undefined,
    });
    if (res.succeeded) {
      setPlatform((prev) => ({
        ...prev,
        tickets: prev.tickets.filter((t) => t.ticketId !== ticketId),
      }));
      setTicketInsights((prev) =>
        prev.map((insight) => {
          // Increase count for InstagramerClosed
          if (insight.actionStatus === StatusReplied.InstagramerClosed) {
            return { ...insight, count: insight.count + 1 };
          }
          // Decrease count only for the ticket's current status
          if (insight.actionStatus === closedTicket.actionStatus) {
            return { ...insight, count: Math.max(0, insight.count - 1) };
          }
          return insight;
        }),
      );
    } else notify(res.info.responseType, NotifType.Warning);
  }
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
    if (!session || !LoginStatus(session)) router.push("/");
    if (!session || !packageStatus(session)) router.push("/upgrade");
    fetchData([StatusReplied.UserReplied]);
  }, [session]);

  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.navbar_General)}</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="Manage your Bran.cy account settings, preferences, and profile information" />
        <meta name="theme-color" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta
          name="keywords"
          content="brancy settings, account settings, profile settings, instagram management, user preferences"
        />
        <meta name="author" content="Bran.cy Team" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.brancy.app/setting/general" aria-label="Canonical link" />
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Bran.cy Settings" />
        <meta property="og:description" content="Manage your Bran.cy account settings and preferences" />
        <meta property="og:site_name" content="Bran.cy" />
        <meta property="og:url" content="https://www.brancy.app/setting/general" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:alt" content="Bran.cy Settings Page" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bran.cy Settings" />
        <meta name="twitter:site" content="@brancyapp" />
        <meta name="twitter:description" content="Manage your Bran.cy account settings and preferences" />
        <meta name="twitter:image:alt" content="Bran.cy Settings Page" />
      </Head>
      {/* head for SEO */}

      <div className="pinContainer">
        <Profile />
        <System />
        <Support
          platform={platform}
          ticketInsights={ticketInsights}
          isDataLoaded={isDataLoaded}
          onOpenCreateTicket={handleOpenCreateTicket}
          onOpenRespondedTicket={(ticketId) => setShowRespondedTicket(ticketId)}
          onLoadMore={handleGetMorePlatformTickets}
          pinTicket={handlePinTicket}
          closeTicket={handleCloseTicket}
          changeStatusRepled={fetchData}
          hasMore={!isLoadingMore}
        />
      </div>
      <Modal showContent={showCreateTicket} closePopup={handleCloseCreateTicket} classNamePopup={"popup"}>
        <CreateTicket removeMask={handleCloseCreateTicket} handleCreateTicket={handleCreateTicket} />
      </Modal>
      <Modal
        showContent={showRespondedTicket !== null}
        closePopup={() => setShowRespondedTicket(null)}
        classNamePopup={"popup"}>
        <AdminChatBox
          chatBox={
            platform.tickets.find((t) => t.ticketId === showRespondedTicket) ?? {
              actionStatus: StatusReplied.JustCreated,
              fbId: "",
              isClosed: false,
              isHide: false,
              isPin: false,
              adminLastSeenUnix: 0,
              createdTime: 0,
              actionTime: 0,
              fbLastSeenUnix: 0,
              nextMaxId: "",
              rate: 0,
              subject: "",
              ticketId: 0,
              type: 0,
              unreadCount: 0,
              items: [],
            }
          }
          ownerInbox={platform.ownerInbox}
          sendingMessages={sendingMessages}
          fetchItemData={handleGetPlatformTicket}
          handleSendTicketMessage={handleSendTicketMessage}
          handleCloseTicket={async (ticketId: number) => {
            await handleCloseTicket(ticketId);
            setShowRespondedTicket(null);
          }}
        />
        {/* <SupportChat
          promptInfo={{
            title: "",
            reNewForThread: false,
            shouldFollower: false,
            prompt: "",
            promptAnalysis: null,
          }}
          setShowLiveChatPopup={() => setShowRespondedTicket(null)}
        /> */}
      </Modal>
    </>
  );
};

export default General;
