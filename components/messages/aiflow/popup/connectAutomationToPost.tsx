import RingLoader from "brancy/components/design/loader/ringLoder";
import Modal from "brancy/components/design/modal";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import SelectPost from "brancy/components/page/tools/popups/lottery/selectPost";
import { MethodType } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { AutoReplyPayLoadType, PartnerRole } from "brancy/models/enums";
import {
  IAutomaticReply,
  IDetailsPost,
  IMediaUpdateAutoReply,
  IShortPostInfo,
  ITotalMasterFlow,
  ITotalPrompt,
} from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./connectAutomationToPost.module.css";

export type PostAutomation =
  | { type: "flow"; flow: ITotalMasterFlow }
  | { type: "ai"; prompt: ITotalPrompt };

export default function ConnectAutomationToPost(props: { automation: PostAutomation; onClose: () => void }) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const isFlow = props.automation.type === "flow";
  const flowId = props.automation.type === "flow" ? props.automation.flow.masterFlowId : null;
  const promptId = props.automation.type === "ai" ? props.automation.prompt.promptId : null;
  const automationTitle = props.automation.type === "flow" ? props.automation.flow.title : props.automation.prompt.title;
  const [flowStatus, setFlowStatus] = useState<"loading" | "ready" | "incompatible" | "error">(
    isFlow ? "loading" : "ready",
  );
  const [selectedPost, setSelectedPost] = useState<IShortPostInfo | null>(null);
  const [autoReply, setAutoReply] = useState<IAutomaticReply | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionSaved, setConnectionSaved] = useState(false);
  const busyRef = useRef(false);
  const mountedRef = useRef(false);
  const hasAccess =
    RoleAccess(session, PartnerRole.Automatics) &&
    RoleAccess(session, PartnerRole.Comment) &&
    !!session?.user.commentPermission &&
    (!isFlow || !!session?.user.messagePermission) &&
    (isFlow ? !!flowId && flowId !== "newFlow" : !!promptId);

  const checkFlow = useCallback(async (id: string) => {
    try {
      const result = await clientFetchApi<boolean, { privateReplyCompability: boolean }>("/api/flow/GetMasterFlow", {
        methodType: MethodType.get,
        session,
        data: null,
        queries: [{ key: "id", value: id }],
        onUploadProgress: undefined,
      });
      if (!mountedRef.current) return;
      if (!result.succeeded) {
        notify(result.info.responseType, NotifType.Error);
        setFlowStatus("error");
        return;
      }
      setFlowStatus(result.value.privateReplyCompability ? "ready" : "incompatible");
    } catch {
      if (mountedRef.current) {
        notify(ResponseType.Unexpected, NotifType.Error);
        setFlowStatus("error");
      }
    }
  }, [session]);

  useEffect(() => {
    mountedRef.current = true;
    if (hasAccess && flowId) void checkFlow(flowId);
    return () => {
      mountedRef.current = false;
    };
  }, [checkFlow, flowId, hasAccess]);

  async function selectPost(post: IShortPostInfo) {
    if (busyRef.current || !hasAccess) return;
    busyRef.current = true;
    setLoadingPost(true);
    try {
      const result = await clientFetchApi<boolean, IDetailsPost>("/api/post/GetPostInfo", {
        methodType: MethodType.get,
        session,
        data: null,
        queries: [{ key: "postId", value: post.postId.toString() }],
        onUploadProgress: undefined,
      });
      if (!mountedRef.current) return;
      if (!result.succeeded) {
        notify(result.info.responseType, NotifType.Error);
        return;
      }
      setAutoReply(result.value.commentMedia?.automaticCommentReply ?? null);
      setConnectionSaved(false);
      setSelectedPost(post);
    } catch {
      if (mountedRef.current) notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setLoadingPost(false);
    }
  }

  async function connectPost() {
    if (busyRef.current || !selectedPost || !hasAccess || flowStatus !== "ready") return;
    busyRef.current = true;
    setSaving(true);
    try {
      let savedReply = autoReply;
      // Activation is separate from configuration in the existing post API.
      if (!connectionSaved) {
        const sendPr = !isFlow && !!session?.user.messagePermission && !!autoReply?.sendPr;
        const payload: IMediaUpdateAutoReply = {
          automaticType: isFlow ? AutoReplyPayLoadType.Flow : AutoReplyPayLoadType.AI,
          masterFlowId: flowId,
          promptId,
          productId: null,
          response: null,
          sendPr,
          shouldFollower: false,
          keys: autoReply?.items.map((item) => item.text) ?? [],
          isContain: autoReply?.isContain ?? true,
          replySuccessfullyDirected: (isFlow || sendPr) && (autoReply?.replySuccessfullyDirected ?? false),
          customRepliesSuccessfullyDirected: isFlow || sendPr ? autoReply?.customRepliesSuccessfullyDirected ?? [] : [],
        };
        const result = await clientFetchApi<IMediaUpdateAutoReply, IAutomaticReply>("/api/post/UpdateAutoReply", {
          methodType: MethodType.post,
          session,
          data: payload,
          queries: [{ key: "postId", value: selectedPost.postId.toString() }],
          onUploadProgress: undefined,
        });
        if (!result.succeeded) {
          notify(result.info.responseType, NotifType.Error);
          return;
        }
        savedReply = result.value;
        if (mountedRef.current) {
          setAutoReply(result.value);
          setConnectionSaved(true);
        }
      }
      if (!savedReply || savedReply.pauseTime !== null) {
        const result = await clientFetchApi<boolean, boolean>("/api/post/ResumeAutoReply", {
          methodType: MethodType.get,
          session,
          data: null,
          queries: [{ key: "postId", value: selectedPost.postId.toString() }],
          onUploadProgress: undefined,
        });
        if (!result.succeeded || !result.value) {
          if (!result.succeeded) notify(result.info.responseType, NotifType.Error);
          else notify(ResponseType.Unexpected, NotifType.Error);
          return;
        }
      }
      internalNotify(InternalResponseType.Ok, NotifType.Success);
      if (mountedRef.current) props.onClose();
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }

  return (
    <Modal closePopup={props.onClose} classNamePopup="popup" showContent>
      {!hasAccess ? (
        <div className="explain">
          {t(isFlow ? LanguageKey.AIFlow_connect_post_access : LanguageKey.AIPrompt_connect_post_access)}
        </div>
      ) : flowStatus === "loading" || loadingPost ? (
        <RingLoader />
      ) : flowStatus === "error" ? (
        <button
          type="button"
          className="cancelButton"
          onClick={() => {
            if (flowId) {
              setFlowStatus("loading");
              void checkFlow(flowId);
            }
          }}>
          {t(LanguageKey.AIFlow_retry)}
        </button>
      ) : flowStatus === "incompatible" ? (
        <div className="explain">{t(LanguageKey.AIFlow_connect_post_incompatible)}</div>
      ) : !selectedPost ? (
        <SelectPost
          removeMask={props.onClose}
          backToNormalPicker={props.onClose}
          saveSelectPost={(post) => void selectPost(post)}
          title={t(LanguageKey.AIFlow_connect_post)}
        />
      ) : (
        <>
          <div id="modal-title" className="title">{t(LanguageKey.AIFlow_connect_post)}</div>
          <div className={styles.selection}>
            <img src={getClientMediaBaseUrl() + selectedPost.thumbnailMediaUrl} alt={`#${selectedPost.postId}`} />
            <div className="headerandinput">
              <div className="title2">{automationTitle}</div>
              <div className="explain">#{selectedPost.postId}</div>
            </div>
          </div>
          <div className="explain">
            {t(
              isFlow
                ? connectionSaved ? LanguageKey.AIFlow_connect_post_resume : LanguageKey.AIFlow_connect_post_confirm
                : connectionSaved ? LanguageKey.AIPrompt_connect_post_resume : LanguageKey.AIPrompt_connect_post_confirm,
            )}
          </div>
          <div className="ButtonContainer">
            <button
              type="button"
              className="cancelButton"
              disabled={saving}
              onClick={() => connectionSaved ? props.onClose() : setSelectedPost(null)}>
              {t(connectionSaved ? LanguageKey.close : LanguageKey.back)}
            </button>
            <button type="button" className={saving ? "disableButton" : "saveButton"} disabled={saving} onClick={() => void connectPost()}>
              {saving ? <RingLoader /> : t(connectionSaved ? LanguageKey.activate : LanguageKey.AIFlow_connect_post)}
            </button>
          </div>
        </>
      )}
      {(!hasAccess || flowStatus !== "ready" || loadingPost) && (
        <button type="button" className="cancelButton" onClick={props.onClose}>
          {t(LanguageKey.close)}
        </button>
      )}
    </Modal>
  );
}
