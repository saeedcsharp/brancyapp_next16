import CheckBoxButton from "brancy/components/design/checkBoxButton/checkBoxButton";
import InputBox from "brancy/components/design/inputBox/inputBox";
import Modal from "brancy/components/design/modal";
import ToggleCheckBoxButton from "brancy/components/design/switchButton/switchButton";
import TextArea from "brancy/components/design/textArea/textArea";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import AIPromptBox from "brancy/components/messages/aiflow/aiPromptBox";
import Flow from "brancy/components/messages/aiflow/flow";
import { LiveTestModal } from "brancy/components/messages/aiflow/flowNode";
import { TutorialModalContent } from "brancy/components/messages/aiflow/flowNode/NodeTutorials";
import { SettingModal } from "brancy/components/messages/aiflow/flowNode/settingmodal";
import AIToolsSettings from "brancy/components/messages/aiflow/popup/AIToolsSettings";
import ConnectAutomationToPost, {
  PostAutomation,
} from "brancy/components/messages/aiflow/popup/connectAutomationToPost";
import LiveChat from "brancy/components/messages/aiflow/popup/liveChat";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import NotFeature from "brancy/components/notOk/notFeature";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import {
  IAITools,
  ICreatePrompt,
  IMasterFlow,
  IPrompts,
  ITool,
  ITotalMasterFlow,
  ITotalPrompt,
} from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import router, { useRouter } from "next/router";
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AutomationDashboard, { AutomationSort, automationIdentity } from "./automationDashboard";
import { useAutomationPosts } from "./useAutomationPosts";
import styles from "./flowAndAIIBox.module.css";

type NewFlowSettings = NonNullable<ComponentProps<typeof Flow>["initialSettings"]> & {
  editorState?: ComponentProps<typeof Flow>["initialEditorState"];
};
type AutomationPage = { items: PostAutomation[]; nextMaxId: string | null };
type AutomationTab = ToggleOrder.FirstToggle | ToggleOrder.SecondToggle;
type SettingsPayload = Omit<ComponentProps<typeof SettingModal>, "updateFlow" | "cancelSave">;
type GetEditorState = Parameters<NonNullable<ComponentProps<typeof Flow>["onRegisterGetEditorState"]>>[0];

class InboxRequestError extends Error {
  constructor(public responseType: ResponseType) {
    super("Unable to load automation data");
  }
}

function reportInboxError(error: unknown) {
  notify(error instanceof InboxRequestError ? error.responseType : ResponseType.Unexpected, NotifType.Error);
}

function mergeAutomations(previous: PostAutomation[], incoming: PostAutomation[]) {
  return [...new Map([...previous, ...incoming].map((item) => [automationIdentity(item), item])).values()];
}

function NewFlowModal(props: { open: boolean; onClose: () => void; onContinue: (settings: NewFlowSettings) => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("Flow_1");
  const [checkFollower, setCheckFollower] = useState(false);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(false);
  const [panningBoundaryEnabled, setPanningBoundaryEnabled] = useState(false);
  const [editorState, setEditorState] = useState<NewFlowSettings["editorState"]>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported.nodes) || !Array.isArray(imported.connections)) throw new Error("Invalid flow");
      setEditorState({
        nodes: imported.nodes,
        connections: imported.connections,
        scale: typeof imported.scale === "number" ? imported.scale : 1,
        pan: imported.pan || { x: 0, y: 0 },
      });
    } catch {
      notify(ResponseType.Unexpected, NotifType.Warning);
    } finally {
      event.target.value = "";
    }
  }

  return (
    <Modal closePopup={props.onClose} classNamePopup="popup" showContent={props.open}>
      <div className="title">{t(LanguageKey.CreateAutomationFlow)}</div>
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.flowtitle)}</div>
        <InputBox
          id="new-flow-title"
          name="new-flow-title"
          className="textinputbox"
          placeHolder={t(LanguageKey.pageToolspopup_typehere)}
          dangerOnEmpty
          handleInputChange={(event) => setTitle(event.target.value)}
          value={title}
        />
      </div>
      <div className="headerandinput">
        <div className="headerparent">
          <div className="title2">{t(LanguageKey.shouldFollower)}</div>
          <ToggleCheckBoxButton
            title={t(LanguageKey.shouldFollower)}
            name="new-flow-check-follower"
            role="switch"
            handleToggle={(event) => setCheckFollower(event.currentTarget.checked)}
            checked={checkFollower}
          />
        </div>
        <div className="explain" style={{ color: "var(--color-dark-yellow)" }}>
          {t(LanguageKey.flowProperties_notworking_privateReply)}
        </div>
      </div>
      <div className="headerandinput">
        <CheckBoxButton
          value={snapToGridEnabled}
          handleToggle={() => setSnapToGridEnabled((value) => !value)}
          textlabel={t(LanguageKey.snapGrid)}
          name="new-flow-snap-grid"
          title={t(LanguageKey.snapGrid)}
        />
        <CheckBoxButton
          value={panningBoundaryEnabled}
          handleToggle={() => setPanningBoundaryEnabled((value) => !value)}
          textlabel={t(LanguageKey.PanningBoundary)}
          name="new-flow-panning-boundary"
          title={t(LanguageKey.PanningBoundary)}
        />
      </div>
      <div className="headerparent">
        <div className="title">{t(LanguageKey.Data_Management)}</div>
        <button type="button" className="cancelButton" onClick={() => fileInputRef.current?.click()}>
          {t(LanguageKey.importJSON)}
        </button>
        <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleImport} />
      </div>
      {editorState && <div className="explain">{t(LanguageKey.Data_Management_explain)}</div>}
      <div className="ButtonContainer">
        <button
          type="button"
          className={title.trim() ? "saveButton" : "disableButton"}
          disabled={!title.trim()}
          onClick={() =>
            props.onContinue({
              title: title.trim(),
              checkFollower,
              snapToGridEnabled,
              panningBoundaryEnabled,
              editorState,
            })
          }>
          {t(LanguageKey.Continue)}
        </button>
        <button type="button" className="cancelButton" onClick={props.onClose}>
          {t(LanguageKey.cancel)}
        </button>
      </div>
    </Modal>
  );
}

const emptyPage = (): AutomationPage => ({ items: [], nextMaxId: null });

export default function FlowAndAIInbox() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push("/");
    },
  });
  const { t } = useTranslation();
  const routerHook = useRouter();
  const [loading, setLoading] = useState(true);
  const [toggleOrder, setToggleOrder] = useState<AutomationTab>(ToggleOrder.FirstToggle);
  const [pages, setPages] = useState<Record<AutomationTab, AutomationPage>>({
    [ToggleOrder.FirstToggle]: emptyPage(),
    [ToggleOrder.SecondToggle]: emptyPage(),
  });
  const [failedTabs, setFailedTabs] = useState<Record<AutomationTab, boolean>>({
    [ToggleOrder.FirstToggle]: false,
    [ToggleOrder.SecondToggle]: false,
  });
  const [searchbox, setSearchbox] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPage, setSearchPage] = useState<AutomationPage>(emptyPage);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [searchRevision, setSearchRevision] = useState(0);
  const [sort, setSort] = useState<AutomationSort>("newest");
  const [loadingMore, setLoadingMore] = useState(false);
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [showNewFlowModal, setShowNewFlowModal] = useState(false);
  const [newFlowSettings, setNewFlowSettings] = useState<NewFlowSettings | null>(null);
  const [newFlowDraft, setNewFlowDraft] = useState<ITotalMasterFlow | null>(null);
  const [connectingAutomation, setConnectingAutomation] = useState<PostAutomation | null>(null);
  const [aiTools, setAITools] = useState<IAITools[]>([]);
  const [showAIToolsSettings, setShowAIToolsSettings] = useState(false);
  const [selectedAITool, setSelectedAITool] = useState<IAITools | null>(null);
  const [aiPromptTools, setAIPromptTools] = useState<ITool[]>([]);
  const [aiToolParamValues, setAIToolParamValues] = useState<Record<string, Record<string, string>>>({});
  const [showLiveChatPopup, setShowLiveChatPopup] = useState(false);
  const [promptInfo, setPromptInfo] = useState<ICreatePrompt | null>(null);
  const [showPromptAnalysisModal, setShowPromptAnalysisModal] = useState(false);
  const [promptAnalysisText, setPromptAnalysisText] = useState("");
  const [settingModalVisible, setSettingModalVisible] = useState(false);
  const [settingModalProps, setSettingModalProps] = useState<SettingsPayload | null>(null);
  const [liveTestVisible, setLiveTestVisible] = useState(false);
  const [liveTestState, setLiveTestState] = useState<ReturnType<GetEditorState> | null>(null);
  const [tutorialModal, setTutorialModal] = useState<{ visible: boolean; nodeType: string | null }>({
    visible: false,
    nodeType: null,
  });
  const [showNotFeature, setShowNotFeature] = useState(false);
  const promptAnalysisAcceptRef = useRef<((text: string) => void) | null>(null);
  const promptAnalysisCloseRef = useRef<(() => void) | null>(null);
  const addToPromptRef = useRef<((text: string) => void) | null>(null);
  const addToolRef = useRef<((tool: ITool) => void) | null>(null);
  const getEditorStateRef = useRef<GetEditorState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const moreRequestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const handledDeepLink = useRef<string | null>(null);
  const posts = useAutomationPosts(session);
  const searchMode = searchbox.trim().length > 0;
  const activePage = searchMode ? searchPage : pages[toggleOrder];
  const listFailed = searchMode ? searchFailed : failedTabs[toggleOrder];
  const requestedId = Array.isArray(routerHook.query.id) ? routerHook.query.id[0] : routerHook.query.id;
  const legacyFlowId = Array.isArray(routerHook.query.flowId) ? routerHook.query.flowId[0] : routerHook.query.flowId;

  const requestPage = useCallback(
    async (order: ToggleOrder, cursor: string | null, query: string, signal?: AbortSignal): Promise<AutomationPage> => {
      const queries = [
        { key: "query", value: query || undefined },
        { key: "nextMaxId", value: cursor || undefined },
      ];
      if (order === ToggleOrder.FirstToggle) {
        const result = await clientFetchApi<boolean, IMasterFlow>("/api/flow/GetMasterFlows", {
          methodType: MethodType.get,
          session,
          queries,
          signal,
        });
        if (!result.succeeded) throw new InboxRequestError(result.info.responseType);
        return { items: result.value.items.map((flow) => ({ type: "flow", flow })), nextMaxId: result.value.nextMaxId };
      }
      const result = await clientFetchApi<boolean, IPrompts>("/api/ai/GetPrompts", {
        methodType: MethodType.get,
        session,
        queries,
        signal,
      });
      if (!result.succeeded) throw new InboxRequestError(result.info.responseType);
      return { items: result.value.items.map((prompt) => ({ type: "ai", prompt })), nextMaxId: result.value.nextMaxId };
    },
    [session],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      moreRequestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!routerHook.isReady || !LoginStatus(session)) return;
    const controller = new AbortController();
    setLoading(true);
    setUserSelectedId(null);
    setNewFlowDraft(null);
    handledDeepLink.current = null;
    async function loadInitial() {
      await Promise.all(
        [ToggleOrder.FirstToggle, ToggleOrder.SecondToggle].map(async (order) => {
          try {
            const page = await requestPage(order, null, "", controller.signal);
            if (controller.signal.aborted) return;
            setPages((previous) => ({ ...previous, [order]: page }));
            setFailedTabs((previous) => ({ ...previous, [order]: false }));
          } catch (error) {
            if (controller.signal.aborted) return;
            reportInboxError(error);
            setPages((previous) => ({ ...previous, [order]: emptyPage() }));
            setFailedTabs((previous) => ({ ...previous, [order]: true }));
          }
        }),
      );
      if (!controller.signal.aborted) setLoading(false);
    }
    void loadInitial();
    void clientFetchApi<boolean, IAITools[]>("/api/ai/GetTools", {
      methodType: MethodType.get,
      session,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.succeeded) setAITools(result.value);
        else notify(result.info.responseType, NotifType.Warning);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) reportInboxError(error);
      });
    return () => controller.abort();
  }, [session, routerHook.isReady, requestPage]);

  useEffect(() => {
    if (loading) return;
    const id = requestedId || legacyFlowId;
    if (!id || handledDeepLink.current === id) return;
    if (failedTabs[ToggleOrder.FirstToggle]) return;
    handledDeepLink.current = id;
    const matching = pages[ToggleOrder.FirstToggle].items.some((item) => automationIdentity(item) === id);
    if (matching || (!requestedId && legacyFlowId)) {
      setToggleOrder(ToggleOrder.FirstToggle);
      setUserSelectedId(id);
    }
  }, [loading, requestedId, legacyFlowId, pages, failedTabs]);

  useEffect(() => {
    if (!searchMode || !LoginStatus(session)) {
      setSearchLoading(false);
      return;
    }
    const controller = new AbortController();
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const page = await requestPage(toggleOrder, null, searchbox.trim(), controller.signal);
        if (!controller.signal.aborted) {
          setSearchPage(page);
          setSearchFailed(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          reportInboxError(error);
          setSearchFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchbox, searchMode, session, toggleOrder, requestPage, searchRevision]);

  useEffect(() => {
    moreRequestRef.current?.abort();
    moreRequestRef.current = null;
    setLoadingMore(false);
  }, [searchbox, toggleOrder, session]);

  const loadMore = useCallback(
    async (retryInitial = false) => {
      if (moreRequestRef.current || loading || searchLoading || userSelectedId !== null) return;
      const cursor = retryInitial ? null : activePage.nextMaxId;
      if (!cursor && !retryInitial) return;
      const controller = new AbortController();
      moreRequestRef.current = controller;
      setLoadingMore(true);
      try {
        const page = await requestPage(toggleOrder, cursor, searchMode ? searchbox.trim() : "", controller.signal);
        if (controller.signal.aborted) return;
        const merged = retryInitial ? page.items : mergeAutomations(activePage.items, page.items);
        const advanced = retryInitial || (merged.length > activePage.items.length && page.nextMaxId !== cursor);
        const next = { items: merged, nextMaxId: advanced ? page.nextMaxId : null };
        if (searchMode) {
          setSearchPage(next);
          setSearchFailed(false);
        } else {
          setPages((previous) => ({ ...previous, [toggleOrder]: next }));
          setFailedTabs((previous) => ({ ...previous, [toggleOrder]: false }));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          reportInboxError(error);
          if (searchMode) setSearchFailed(true);
          else setFailedTabs((previous) => ({ ...previous, [toggleOrder]: true }));
        }
      } finally {
        if (moreRequestRef.current === controller) {
          moreRequestRef.current = null;
          if (mountedRef.current) setLoadingMore(false);
        }
      }
    },
    [activePage, loading, searchLoading, userSelectedId, requestPage, toggleOrder, searchMode, searchbox],
  );

  useEffect(() => {
    if (
      loading ||
      searchLoading ||
      listFailed ||
      !activePage.nextMaxId ||
      userSelectedId !== null ||
      !loadMoreRef.current
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { root: containerRef.current, rootMargin: "0px 0px 160px 0px" },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, searchLoading, loadingMore, listFailed, activePage.nextMaxId, userSelectedId, loadMore]);

  function showUserList() {
    setUserSelectedId(null);
    setSettingModalVisible(false);
    setLiveTestVisible(false);
    setShowLiveChatPopup(false);
    getEditorStateRef.current = null;
  }

  function handleToggleChange(order: ToggleOrder) {
    if (order !== ToggleOrder.FirstToggle && order !== ToggleOrder.SecondToggle) {
      notify(ResponseType.Unexpected, NotifType.Error);
      return;
    }
    moreRequestRef.current?.abort();
    setToggleOrder(order);
    setSearchbox("");
    setSearchPage(emptyPage());
    setSearchFailed(false);
    setSearchLoading(false);
    containerRef.current?.scrollTo({ top: 0 });
  }

  function handleSearch(query: string) {
    setSearchbox(query);
    setSearchPage(emptyPage());
    setSearchFailed(false);
    setSearchLoading(query.trim().length > 0);
    containerRef.current?.scrollTo({ top: 0 });
  }

  function handleUpdateFlow(masterFlow: ITotalMasterFlow) {
    const automation: PostAutomation = { type: "flow", flow: masterFlow };
    setPages((previous) => ({
      ...previous,
      [ToggleOrder.FirstToggle]: {
        ...previous[ToggleOrder.FirstToggle],
        items: mergeAutomations(
          [automation],
          previous[ToggleOrder.FirstToggle].items.filter(
            (item) => automationIdentity(item) !== masterFlow.masterFlowId,
          ),
        ),
      },
    }));
    setSearchPage((previous) => ({
      ...previous,
      items: previous.items.map((item) => (automationIdentity(item) === masterFlow.masterFlowId ? automation : item)),
    }));
    localStorage.removeItem(
      `flowEditor_autoSave_${userSelectedId === "newFlow" ? "newFlow" : masterFlow.masterFlowId}`,
    );
    setNewFlowDraft(null);
    setUserSelectedId(masterFlow.masterFlowId);
    setSettingModalVisible(false);
  }

  function updateAIPrompt(prompt: ITotalPrompt) {
    const automation: PostAutomation = { type: "ai", prompt };
    setPages((previous) => ({
      ...previous,
      [ToggleOrder.SecondToggle]: {
        ...previous[ToggleOrder.SecondToggle],
        items: mergeAutomations(
          [automation],
          previous[ToggleOrder.SecondToggle].items.filter((item) => automationIdentity(item) !== prompt.promptId),
        ),
      },
    }));
    setSearchPage((previous) => ({
      ...previous,
      items: previous.items.map((item) => (automationIdentity(item) === prompt.promptId ? automation : item)),
    }));
    setUserSelectedId(prompt.promptId);
  }

  function closePromptAnalysis() {
    setShowPromptAnalysisModal(false);
    promptAnalysisCloseRef.current?.();
    promptAnalysisAcceptRef.current = null;
    promptAnalysisCloseRef.current = null;
  }

  const existingFlows = pages[ToggleOrder.FirstToggle].items.flatMap((item) =>
    item.type === "flow" ? [item.flow] : [],
  );
  const displayedItems =
    newFlowDraft && toggleOrder === ToggleOrder.FirstToggle && !searchMode
      ? [{ type: "flow" as const, flow: newFlowDraft }, ...activePage.items]
      : activePage.items;

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className={`pincontainerMSG translate ${styles.workspace}`}>
          {userSelectedId === null ? (
            <AutomationDashboard
              toggleOrder={toggleOrder}
              onToggle={handleToggleChange}
              items={displayedItems}
              hasMore={!!activePage.nextMaxId}
              fetching={searchLoading}
              failed={listFailed}
              onRetry={() => {
                if (searchMode && !searchPage.items.length) setSearchRevision((value) => value + 1);
                else void loadMore(!activePage.items.length);
              }}
              query={searchbox}
              onSearch={handleSearch}
              searchOpen={searchOpen}
              onSearchOpen={setSearchOpen}
              sort={sort}
              onSort={setSort}
              onNew={() => {
                if (toggleOrder === ToggleOrder.FirstToggle) setShowNewFlowModal(true);
                else {
                  setAIPromptTools([]);
                  setPromptInfo(null);
                  setUserSelectedId("");
                }
              }}
              onOpen={(automation) => {
                if (automation.type === "ai") setAIPromptTools([]);
                setUserSelectedId(automationIdentity(automation));
              }}
              onConnect={setConnectingAutomation}
              canConnect={(automation) =>
                posts.allowed && (automation.type === "ai" || !!session?.user.messagePermission)
              }
              connections={posts.connections}
              connectionStatus={posts.status}
              canReadConnections={posts.allowed}
              onRetryConnections={posts.retry}
              containerRef={containerRef}
              loadingMore={loadingMore}
              loadMoreRef={loadMoreRef}
            />
          ) : toggleOrder === ToggleOrder.FirstToggle ? (
            <div className={styles.right}>
              <Flow
                key={userSelectedId}
                flowId={userSelectedId}
                showUserList={showUserList}
                onOpenSettings={(payload: SettingsPayload) => {
                  setSettingModalProps(payload);
                  setSettingModalVisible(true);
                }}
                onSaveSuccess={(masterFlow, flowStr) => {
                  if (masterFlow && flowStr) handleUpdateFlow(masterFlow);
                }}
                onOpenLiveTest={() => {
                  const state = getEditorStateRef.current?.();
                  if (state) {
                    setLiveTestState(state);
                    setLiveTestVisible(true);
                  } else notify(ResponseType.Unexpected, NotifType.Warning);
                }}
                onOpenTutorial={(nodeType) => setTutorialModal({ visible: true, nodeType })}
                onRegisterGetEditorState={(fn) => {
                  getEditorStateRef.current = fn;
                }}
                existingFlows={existingFlows}
                initialSettings={userSelectedId === "newFlow" ? (newFlowSettings ?? undefined) : undefined}
                initialEditorState={userSelectedId === "newFlow" ? newFlowSettings?.editorState : undefined}
              />
            </div>
          ) : (
            <div className={styles.rightAI}>
              <AIPromptBox
                key={userSelectedId}
                aiTools={aiTools}
                userSelectId={userSelectedId}
                showUserList={showUserList}
                updateAIPrompt={updateAIPrompt}
                showAIToolsSettings={showAIToolsSettings}
                setShowAIToolsSettings={setShowAIToolsSettings}
                selectedAITool={selectedAITool}
                setSelectedAITool={setSelectedAITool}
                onAddToPromptRef={addToPromptRef}
                onAddToolRef={addToolRef}
                showLiveChatPopup={showLiveChatPopup}
                setShowLiveChatPopup={setShowLiveChatPopup}
                promptInfo={promptInfo}
                setPromptInfo={setPromptInfo}
                tools={aiPromptTools}
                setTools={setAIPromptTools}
                setShowNotFeature={setShowNotFeature}
                openPromptAnalysisModal={(text, accept, close) => {
                  setPromptAnalysisText(text);
                  promptAnalysisAcceptRef.current = accept;
                  promptAnalysisCloseRef.current = close;
                  setShowPromptAnalysisModal(true);
                }}
              />
            </div>
          )}
        </div>
      )}
      <Modal
        closePopup={() => setShowAIToolsSettings(false)}
        classNamePopup="popup"
        showContent={showAIToolsSettings && toggleOrder === ToggleOrder.SecondToggle && !loading}>
        <AIToolsSettings
          onClose={() => setShowAIToolsSettings(false)}
          aiTools={aiTools}
          selectedAITool={selectedAITool}
          existingTools={aiPromptTools}
          paramValues={aiToolParamValues}
          setParamValues={setAIToolParamValues}
          onAddToPrompt={(text) => addToPromptRef.current?.(text)}
          onAddTool={(tool) => addToolRef.current?.(tool)}
        />
      </Modal>
      {connectingAutomation && (
        <ConnectAutomationToPost
          key={`${connectingAutomation.type}-${automationIdentity(connectingAutomation)}`}
          automation={connectingAutomation}
          onClose={() => setConnectingAutomation(null)}
          onConnected={posts.onConnected}
        />
      )}
      <NewFlowModal
        open={showNewFlowModal && toggleOrder === ToggleOrder.FirstToggle && !loading}
        onClose={() => setShowNewFlowModal(false)}
        onContinue={(settings) => {
          setNewFlowSettings(settings);
          setNewFlowDraft({
            fbId: "",
            masterFlowId: "newFlow",
            createdTime: Date.now(),
            initialFlowId: "",
            title: settings.title,
            checkFollower: settings.checkFollower,
            initalFlow: null,
            onMessagePosition: null,
          });
          setShowNewFlowModal(false);
          setUserSelectedId("newFlow");
        }}
      />
      <Modal
        closePopup={closePromptAnalysis}
        classNamePopup="popup"
        showContent={showPromptAnalysisModal && toggleOrder === ToggleOrder.SecondToggle && !loading}>
        <div className="headerandinput">
          <div className="title">{t(LanguageKey.promptanalysis)}</div>
          <div className="explain">{t(LanguageKey.promptanalysisExplain)}</div>
          <TextArea
            className="TextArea"
            handleInputChange={(event) => setPromptAnalysisText(event.target.value)}
            value={promptAnalysisText}
            title={t(LanguageKey.promptanalysis)}
            autoExpandOnFocus
            initialHeight={300}
            placeholder={t(LanguageKey.promptanalysisplaceholder)}
          />
        </div>
        <div className="ButtonContainer">
          <button type="button" className="cancelButton" onClick={closePromptAnalysis}>
            {t(LanguageKey.close)}
          </button>
          <button
            type="button"
            className={promptAnalysisText.length > 20 ? "saveButton" : "disableButton"}
            disabled={promptAnalysisText.length <= 20}
            onClick={() => {
              if (promptAnalysisText.length <= 20) return;
              promptAnalysisAcceptRef.current?.(promptAnalysisText);
              setShowPromptAnalysisModal(false);
              promptAnalysisAcceptRef.current = null;
              promptAnalysisCloseRef.current = null;
            }}>
            {t(LanguageKey.accept)}
          </button>
        </div>
      </Modal>
      {settingModalProps && (
        <Modal
          closePopup={() => setSettingModalVisible(false)}
          classNamePopup="popup"
          showContent={settingModalVisible && toggleOrder === ToggleOrder.FirstToggle && !loading}>
          <SettingModal
            {...settingModalProps}
            updateFlow={handleUpdateFlow}
            cancelSave={() => setSettingModalVisible(false)}
          />
        </Modal>
      )}
      {showLiveChatPopup && promptInfo && toggleOrder === ToggleOrder.SecondToggle && !loading && (
        <Modal closePopup={() => setShowLiveChatPopup(false)} classNamePopup="popup" showContent>
          <LiveChat promptInfo={promptInfo} />
        </Modal>
      )}
      {liveTestVisible && liveTestState && (
        <LiveTestModal
          isOpen={liveTestVisible}
          onClose={() => setLiveTestVisible(false)}
          editorState={liveTestState}
          title={liveTestState.title}
        />
      )}
      {tutorialModal.visible && tutorialModal.nodeType && (
        <Modal
          closePopup={() => setTutorialModal({ visible: false, nodeType: null })}
          classNamePopup="popup"
          showContent>
          <TutorialModalContent
            nodeType={tutorialModal.nodeType}
            onClose={() => setTutorialModal({ visible: false, nodeType: null })}
          />
        </Modal>
      )}
      <Modal closePopup={() => setShowNotFeature(false)} classNamePopup="popupSendFile" showContent={showNotFeature}>
        <NotFeature onClose={() => setShowNotFeature(false)} upgradeQuery={{ section: "ai" }} />
      </Modal>
    </>
  );
}
