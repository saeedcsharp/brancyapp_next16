import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { MethodType } from "brancy/helper/api";
import { IMasterFlow, ITotalMasterFlow } from "brancy/models/interfaces";
import styles from "./MasterFlowNode.module.css";

const MAX_PAGES = 10;

export const MasterFlowNode: React.FC<BaseNodeProps & { currentFlowId?: string }> = ({
  node,
  updateNodeData,
  currentFlowId,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [flows, setFlows] = useState<ITotalMasterFlow[]>([]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const all: ITotalMasterFlow[] = [];
      let nextMaxId: string | null = null;
      try {
        for (let page = 0; page < MAX_PAGES; page++) {
          const cursor: string | undefined = nextMaxId ?? undefined;
          const res: { succeeded: boolean; value: IMasterFlow } = await clientFetchApi<boolean, IMasterFlow>(
            "/api/flow/GetMasterFlows",
            {
              methodType: MethodType.get,
              session: session,
              data: null,
              queries: [{ key: "nextMaxId", value: cursor }],
              onUploadProgress: undefined,
            },
          );
          if (!res.succeeded || !res.value) break;
          all.push(...res.value.items);
          nextMaxId = res.value.nextMaxId;
          if (!nextMaxId) break;
        }
      } catch {
        // list stays partial/empty
      }
      if (!cancelled) setFlows(all.filter((f) => f.masterFlowId !== currentFlowId));
    })();
    return () => {
      cancelled = true;
    };
  }, [session, currentFlowId]);

  return (
    <div className={styles.container}>
      <select
        className={styles.select}
        value={node.data?.masterFlowId ?? ""}
        onChange={(e) => {
          const selected = flows.find((f) => f.masterFlowId === e.target.value);
          updateNodeData(node.id, {
            masterFlowId: selected?.masterFlowId ?? "",
            flowTitle: selected?.title ?? "",
          });
        }}>
        <option value="">{t(LanguageKey.New_Flow_masterflow_select)}</option>
        {node.data?.masterFlowId && !flows.some((f) => f.masterFlowId === node.data.masterFlowId) && (
          <option value={node.data.masterFlowId}>{node.data.flowTitle || node.data.masterFlowId}</option>
        )}
        {flows.map((f) => (
          <option key={f.masterFlowId} value={f.masterFlowId}>
            {f.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export const getMasterFlowNodeHeight = (node: NodeData): number => 60;

export const masterflowNodeClassName = styles.nodeContainer;
