import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { AutoReplyPayLoadType, PartnerRole } from "brancy/models/enums";
import { IAutomaticReply, IDetailsPost, IShortPostInfo } from "brancy/models/interfaces";
import { Session } from "next-auth";
import { useCallback, useEffect, useRef, useState } from "react";

export interface AutomationPost {
  post: IShortPostInfo;
  type: "flow" | "ai";
  automationId: string;
}

export function getAutomationPost(post: IShortPostInfo, reply: IAutomaticReply | null): AutomationPost | null {
  if (reply?.automaticType === AutoReplyPayLoadType.Flow && reply.masterFlowId) {
    return { post, type: "flow", automationId: reply.masterFlowId };
  }
  if (reply?.automaticType === AutoReplyPayLoadType.AI && reply.promptId) {
    return { post, type: "ai", automationId: reply.promptId };
  }
  return null;
}

export function useAutomationPosts(session: Session | null) {
  const allowed =
    LoginStatus(session) &&
    !!session?.user.commentPermission &&
    RoleAccess(session, PartnerRole.Automatics) &&
    RoleAccess(session, PartnerRole.Comment);
  const [connections, setConnections] = useState<AutomationPost[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [revision, setRevision] = useState(0);
  const savedPosts = useRef(new Map<number, AutomationPost>());
  const accountId = session?.user.instagramerIds?.[session.user.currentIndex];
  const previousAccount = useRef(accountId);

  useEffect(() => {
    const controller = new AbortController();
    if (previousAccount.current !== accountId) {
      savedPosts.current.clear();
      previousAccount.current = accountId;
    }
    setConnections(allowed ? [...savedPosts.current.values()] : []);
    setStatus("loading");
    if (!allowed) return () => controller.abort();

    async function load() {
      const seenPosts = new Set<number>();
      const found = new Map<number, AutomationPost>();
      let nextTime: number | undefined;
      let reportedFailure = false;
      try {
        while (!controller.signal.aborted) {
          const page = await clientFetchApi<boolean, IShortPostInfo[]>("/api/post/GetPostCards", {
            session,
            signal: controller.signal,
            methodType: MethodType.get,
            queries: nextTime === undefined ? undefined : [{ key: "nextTimeUnix", value: String(nextTime) }],
          });
          if (controller.signal.aborted) return;
          if (!page.succeeded) {
            reportedFailure = true;
            notify(page.info.responseType, NotifType.Error);
            throw new Error("Unable to load automation posts");
          }
          if (page.value.length === 0) break;
          const posts = page.value.filter((post) => !seenPosts.has(post.postId));
          // A repeated non-empty page cannot prove that the account scan is complete.
          if (posts.length === 0) throw new Error("Post pagination did not advance");
          for (let offset = 0; offset < posts.length; offset += 4) {
            const batch = posts.slice(offset, offset + 4);
            const details = await Promise.all(
              batch.map((post) =>
                clientFetchApi<boolean, IDetailsPost>("/api/post/GetPostInfo", {
                  session,
                  signal: controller.signal,
                  methodType: MethodType.get,
                  queries: [{ key: "postId", value: String(post.postId) }],
                }),
              ),
            );
            if (controller.signal.aborted) return;
            details.forEach((detail, index) => {
              if (!detail.succeeded) {
                if (!reportedFailure) notify(detail.info.responseType, NotifType.Error);
                reportedFailure = true;
                throw new Error("Unable to read post automation");
              }
              const post = batch[index];
              seenPosts.add(post.postId);
              const connection = getAutomationPost(post, detail.value.commentMedia?.automaticCommentReply ?? null);
              if (connection) found.set(post.postId, connection);
            });
            setConnections([...new Map([...found, ...savedPosts.current]).values()]);
          }
          const cursor = page.value[page.value.length - 1].createdTime;
          if (cursor === nextTime) throw new Error("Post pagination cursor did not advance");
          nextTime = cursor;
        }
        if (!controller.signal.aborted) setStatus("ready");
      } catch {
        if (controller.signal.aborted) return;
        if (!reportedFailure) notify(ResponseType.Unexpected, NotifType.Error);
        setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [session, accountId, allowed, revision]);

  const onConnected = useCallback((connection: AutomationPost) => {
    savedPosts.current.set(connection.post.postId, connection);
    setConnections((previous) => [
      ...previous.filter((item) => item.post.postId !== connection.post.postId),
      connection,
    ]);
  }, []);

  return { connections, status, allowed, retry: () => setRevision((value) => value + 1), onConnected };
}
