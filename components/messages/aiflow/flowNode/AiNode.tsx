import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { MethodType } from "brancy/helper/api";
import { IPrompts, ITotalPrompt } from "brancy/models/interfaces";
import styles from "./AiNode.module.css";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";

const MAX_PAGES = 10;

export const AiNode: React.FC<BaseNodeProps> = ({ node, updateNodeData }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [prompts, setPrompts] = useState<ITotalPrompt[]>([]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const all: ITotalPrompt[] = [];
      let nextMaxId: string | null = null;
      try {
        for (let page = 0; page < MAX_PAGES; page++) {
          const cursor: string | undefined = nextMaxId ?? undefined;
          const res: { succeeded: boolean; value: IPrompts } = await clientFetchApi<boolean, IPrompts>(
            "/api/ai/GetPrompts",
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
      if (!cancelled) setPrompts(all);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <div className={styles.container}>
      <DragDrop
        data={[
          <div key="" id="">
            {t(LanguageKey.New_Flow_ai_select)}
          </div>,
          ...(node.data?.promptId && !prompts.some((p) => p.promptId === node.data.promptId)
            ? [
                <div key={node.data.promptId} id={node.data.promptId}>
                  {node.data.promptTitle || node.data.promptId}
                </div>,
              ]
            : []),
          ...prompts.map((p) => (
            <div key={p.promptId} id={p.promptId}>
              {p.title}
            </div>
          )),
        ]}
        handleOptionSelect={(id: string) => {
          const selected = prompts.find((p) => p.promptId === id);
          updateNodeData(node.id, { promptId: selected?.promptId ?? "", promptTitle: selected?.title ?? "" });
        }}
      />
    </div>
  );
};

export const getAiNodeHeight = (node: NodeData): number => 60;

export const aiNodeClassName = styles.nodeContainer;
