import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
import { IRelatedAutomation, IRelatedAutomationGeneral, IShortPostInfo } from "brancy/models/interfaces";
import { Session } from "next-auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AutomationType = "flow" | "ai";

export interface AutomationPost {
  post: Pick<IShortPostInfo, "postId" | "thumbnailMediaUrl">;
  type: AutomationType;
  automationId: string;
}

const relatedEndpoints: Record<AutomationType, string> = {
  flow: "/api/flow/GetRelatedMasterFlows",
  ai: "/api/ai/GetRelatedPrompts",
};

export function useAutomationPosts(session: Session | null, flowIds: string[], promptIds: string[]) {
  const allowed =
    LoginStatus(session) &&
    !!session?.user.commentPermission &&
    RoleAccess(session, PartnerRole.Automatics) &&
    RoleAccess(session, PartnerRole.Comment);
  const [related, setRelated] = useState<Record<string, AutomationPost[]>>({});
  const [generals, setGenerals] = useState<Record<string, IRelatedAutomationGeneral[]>>({});
  const [saved, setSaved] = useState(() => new Map<number, AutomationPost>());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [revision, setRevision] = useState(0);
  const loaded = useRef(new Set<string>());
  const accountId = session?.user.instagramerIds?.[session.user.currentIndex];
  const previousAccount = useRef(accountId);
  const flowKey = flowIds.join(",");
  const promptKey = promptIds.join(",");

  useEffect(() => {
    if (previousAccount.current !== accountId) {
      previousAccount.current = accountId;
      loaded.current.clear();
      setRelated({});
      setGenerals({});
      setSaved(new Map());
    }
    if (!allowed) return;
    const groups = (
      [
        ["flow", flowKey],
        ["ai", promptKey],
      ] as const
    )
      .map(([type, key]) => ({
        type,
        ids: [...new Set(key.split(","))].filter((id) => id && !loaded.current.has(`${type}:${id}`)),
      }))
      .filter((group) => group.ids.length > 0);
    if (!groups.length) {
      setStatus("ready");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");

    async function load() {
      const results = await Promise.all(
        groups.map(({ type, ids }) =>
          clientFetchApi<string[], IRelatedAutomation[]>(relatedEndpoints[type], {
            session,
            signal: controller.signal,
            methodType: MethodType.post,
            data: ids,
          }),
        ),
      );
      if (controller.signal.aborted) return;
      const next: Record<string, AutomationPost[]> = {};
      const nextGenerals: Record<string, IRelatedAutomationGeneral[]> = {};
      let failure: ResponseType | null = null;
      results.forEach((result, index) => {
        const { type, ids } = groups[index];
        if (!result.succeeded || !Array.isArray(result.value)) {
          failure ??= result.succeeded ? ResponseType.Unexpected : result.info.responseType;
          return;
        }
        for (const id of ids) {
          next[`${type}:${id}`] = [];
          nextGenerals[`${type}:${id}`] = [];
        }
        for (const item of result.value) {
          nextGenerals[`${type}:${item.id}`] = item.relatedGenerals ?? [];
          next[`${type}:${item.id}`] = (item.relatedMedias ?? [])
            .filter((media) => media.postId > 0)
            .map((media) => ({
              type,
              automationId: item.id,
              post: { postId: media.postId, thumbnailMediaUrl: media.thumbnailMediaUrl },
            }));
        }
      });
      Object.keys(next).forEach((key) => loaded.current.add(key));
      setRelated((previous) => ({ ...previous, ...next }));
      setGenerals((previous) => ({ ...previous, ...nextGenerals }));
      if (failure !== null) {
        notify(failure, NotifType.Error);
        setStatus("error");
      } else setStatus("ready");
    }
    load().catch(() => {
      if (controller.signal.aborted) return;
      notify(ResponseType.Unexpected, NotifType.Error);
      setStatus("error");
    });
    return () => controller.abort();
  }, [session, accountId, allowed, flowKey, promptKey, revision]);

  const connections = useMemo(
    () =>
      allowed
        ? [
            ...Object.values(related)
              .flat()
              .filter((connection) => !saved.has(connection.post.postId)),
            ...saved.values(),
          ]
        : [],
    [allowed, related, saved],
  );

  const onConnected = useCallback((connection: AutomationPost) => {
    setSaved((previous) => new Map(previous).set(connection.post.postId, connection));
  }, []);

  return {
    connections,
    generals: allowed ? generals : {},
    status,
    allowed,
    retry: () => setRevision((value) => value + 1),
    onConnected,
  };
}
