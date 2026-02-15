import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MouseEvent, useCallback, useEffect, useId, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "saeed/components/design/dotMenu/dotMenu";
import DotLoaders from "saeed/components/design/loader/dotLoaders";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { calculateSummary } from "saeed/helper/numberFormater";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IStory, IStoryContent } from "saeed/models/page/story/stories";
import ScheduledStory from "../scheduledStory/scheduledStory";
import styles from "./storyContent.module.css";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

type StoryState = {
  stories: IStoryContent[] | null;
  hasMore: boolean;
  nextTime: number;
  loadingStatus: boolean;
};

type StoryAction =
  | {
      type: "INIT_STORIES";
      payload: { stories: IStoryContent[]; hasMore: boolean; nextTime: number };
    }
  | {
      type: "ADD_STORIES";
      payload: { stories: IStoryContent[]; hasMore: boolean; nextTime: number };
    }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: StoryState = {
  stories: null,
  hasMore: false,
  nextTime: -1,
  loadingStatus: true,
};

function storyReducer(state: StoryState, action: StoryAction): StoryState {
  switch (action.type) {
    case "INIT_STORIES":
      return {
        ...state,
        stories: action.payload.stories,
        hasMore: action.payload.hasMore,
        nextTime: action.payload.nextTime,
        loadingStatus: false,
      };
    case "ADD_STORIES":
      return {
        ...state,
        stories: state.stories ? [...state.stories, ...action.payload.stories] : action.payload.stories,
        hasMore: action.payload.hasMore,
        nextTime: action.payload.nextTime,
      };
    case "SET_LOADING":
      return {
        ...state,
        loadingStatus: action.payload,
      };
    default:
      return state;
  }
}

const StoryContent = (props: {
  data: IStory;
  handleStoryShowDotIcons: (e: MouseEvent) => void;
  showDotIcons: number;
  handleClickOnIcon: (e: MouseEvent, value: string) => void;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const uniqueId = useId();

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [state, dispatch] = useReducer(storyReducer, initialState);
  const [openMenuStoryId, setOpenMenuStoryId] = useState<number | null>(null);

  const { stories, hasMore, nextTime, loadingStatus } = state;

  const hasAccess = useMemo(() => LoginStatus(session) && RoleAccess(session, PartnerRole.PageView), [session]);

  const handleMenuToggle = useCallback((storyId: number) => {
    setOpenMenuStoryId((prev) => (prev === storyId ? null : storyId));
  }, []);

  const handleStoryClick = useCallback(
    (storyId: number) => {
      router.push(`/page/stories/storyinfo/${storyId}`);
    },
    [router],
  );

  const handleCreateStory = useCallback(() => {
    router.push("/page/stories/createstory?newschedulestory=false");
  }, [router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  }, []);

  const { containerRef, isLoadingMore } = useInfiniteScroll<IStoryContent>({
    hasMore,
    fetchMore: async () => {
      if (nextTime <= 0) return [];
      const res = await GetServerResult<boolean, IStoryContent[]>(
        MethodType.get,
        session,
        "Instagramer/Story/GetNextStories",
        undefined,
        [
          {
            key: "lastStoryCreatedTime",
            value: nextTime.toString(),
          },
        ],
      );

      if (!res.succeeded || !res.value || !Array.isArray(res.value)) {
        return [];
      }

      if (res.value.length === 0) {
        dispatch({
          type: "ADD_STORIES",
          payload: {
            stories: [],
            hasMore: false,
            nextTime: 0,
          },
        });
      }

      return res.value;
    },
    onDataFetched: (newStories, hasMoreData) => {
      dispatch({
        type: "ADD_STORIES",
        payload: {
          stories: newStories,
          hasMore: hasMoreData,
          nextTime: newStories.length > 0 ? newStories[newStories.length - 1].createdTime : nextTime,
        },
      });
    },
    getItemId: (story) => story.storyId,
    currentData: stories || [],
    isLoading: loadingStatus,
    threshold: 200,
    minItemsForMore: 18,
  });

  useEffect(() => {
    if (props.data.storyContents && hasAccess) {
      const stories = props.data.storyContents;
      dispatch({
        type: "INIT_STORIES",
        payload: {
          stories,
          hasMore: stories.length >= 10,
          nextTime: stories.length > 0 ? stories[stories.length - 1].createdTime : -1,
        },
      });
    }
  }, [props.data.storyContents, hasAccess]);

  const renderDraftItem = useCallback((draft: any, index: number, isError: boolean = false) => {
    const draftItemStyle =
      isError && draft.statusCreatedTime > index
        ? {
            border: "1px solid var(--color-dark-red)",
            borderRadius: "var(--br10)",
            cursor: "pointer",
          }
        : {};

    return (
      <div className={styles.draftpreview} key={draft.draftId} title={`🔗 Draft No.${index + 1}`}>
        <Link
          href={`/page/stories/createstory?newschedulestory=false&draftId=${draft.draftId}`}
          aria-label={`Edit draft ${draft.draftId}`}
          tabIndex={0}>
          <div style={draftItemStyle}>
            <img
              className={styles.draftpreviewimage}
              src={basePictureUrl + draft.thumbnailMediaUrl}
              alt={`Draft preview ${index + 1}`}
            />
          </div>
        </Link>
      </div>
    );
  }, []);

  const errorDraftsToRender = useMemo(() => props.data.errorDrafts.slice(0, 6), [props.data.errorDrafts]);
  const draftsToRender = useMemo(() => props.data.drafts?.slice(0, 6) || [], [props.data.drafts]);

  return (
    <>
      <div className={styles.storiesContainer} ref={containerRef} role="region" aria-label="Stories content">
        <ScheduledStory data={props.data.scheduledStory} totalCount={props.data.preStoryTotalCount} />
        {loadingStatus && <Loading />}
        {!hasAccess && (
          <section className={`${styles.frameContainer} translate`} role="complementary">
            <div className={styles.story} role="button" tabIndex={0} aria-label="Create new story">
              <div className={styles.cardbackground} />
              <div className={styles.storyinfo}>
                <div className={styles.newstory}>
                  <svg viewBox="0 0 550 560" width="25%" aria-hidden="true">
                    <path
                      fill="var(--text-h2)"
                      d="M458 80c-6-46-45-80-91-80H92C42 0 0 41 0 92v275c0 42 30 80 70 90v3c0 52 43 95 95 95h286c52 0 95-43 95-95V174c0-50-39-91-88-95ZM92 425a60 60 0 0 1-60-60V93a60 60 0 0 1 60-60h275a60 60 0 0 1 60 60v275a60 60 0 0 1-60 60H92Zm421 35c0 34-28 62-62 62H165a62 62 0 0 1-62-62v-1h264c50 0 92-41 92-92V112c30 4 54 30 54 62zM358 230c0 10-8 17-17 17h-94v94a18 18 0 1 1-35 0v-94h-94a18 18 0 1 1 0-35h94v-94a18 18 0 1 1 35 0v94h94c10 0 17 8 17 17Z"
                    />
                  </svg>
                  {t("pageStory_CreateNewStory")}
                  <div className={styles.createpostid}>{0}</div>
                </div>
              </div>
            </div>
          </section>
        )}
        {!hasAccess && <NotAllowed />}

        {!loadingStatus && stories && (
          <section className={`${styles.frameContainer} translate`} role="main">
            {errorDraftsToRender.length > 0 && (
              <div className={styles.draft} role="article" aria-label="Error drafts section">
                <div className={styles.cardbackground} />
                <div className={styles.draftinfo}>
                  <div className={styles.newstory}>
                    <div className={styles.drafttitle}>
                      {t("publishError")} ({errorDraftsToRender.length})
                    </div>
                    <div className={styles.draftpreviewall} role="list" aria-label="Error drafts list">
                      {errorDraftsToRender.map((draft, index) => renderDraftItem(draft, index, true))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {draftsToRender.length > 0 && (
              <div className={styles.draft} role="article" aria-label="Drafts section">
                <div className={styles.cardbackground} />
                <div className={styles.draftinfo}>
                  <div className={styles.newstory}>
                    <div className={styles.drafttitle}>
                      {t("StoryDraft")} ({draftsToRender.length}/6)
                    </div>
                    <div className={styles.draftpreviewall} role="list" aria-label="Drafts list">
                      {draftsToRender.map((draft, index) => renderDraftItem(draft, index, false))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div
              className={styles.story}
              onClick={handleCreateStory}
              onKeyDown={(e) => handleKeyDown(e, handleCreateStory)}
              role="button"
              tabIndex={0}
              aria-label="Create new story">
              <div className={styles.cardbackground} />
              <div className={styles.storyinfo}>
                <div className={styles.newstory}>
                  <svg viewBox="0 0 550 560" width="25%" aria-hidden="true">
                    <path
                      fill="var(--text-h2)"
                      d="M458 80c-6-46-45-80-91-80H92C42 0 0 41 0 92v275c0 42 30 80 70 90v3c0 52 43 95 95 95h286c52 0 95-43 95-95V174c0-50-39-91-88-95ZM92 425a60 60 0 0 1-60-60V93a60 60 0 0 1 60-60h275a60 60 0 0 1 60 60v275a60 60 0 0 1-60 60H92Zm421 35c0 34-28 62-62 62H165a62 62 0 0 1-62-62v-1h264c50 0 92-41 92-92V112c30 4 54 30 54 62zM358 230c0 10-8 17-17 17h-94v94a18 18 0 1 1-35 0v-94h-94a18 18 0 1 1 0-35h94v-94a18 18 0 1 1 35 0v94h94c10 0 17 8 17 17Z"
                    />
                  </svg>
                  {t("pageStory_CreateNewStory")}
                  <div className={styles.createpostid}>{stories.length > 0 ? stories[0].tempId + 1 : ""}</div>
                </div>
              </div>
            </div>

            {stories.length !== 0 &&
              stories.map((v) => {
                const isActive = v.expireTime > Date.now() / 1000;
                return (
                  <div
                    className={styles.story}
                    onClick={() => handleStoryClick(v.storyId)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleStoryClick(v.storyId))}
                    key={`${uniqueId}-story-${v.storyId}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Story ${v.tempId}, ${isActive ? "active" : "inactive"}`}>
                    <div className={styles.cardbackground} />
                    <div className={styles.storyinfo}>
                      <img
                        className={styles.storyimage}
                        alt={`Story ${v.tempId} preview`}
                        src={basePictureUrl + v.thumbnailMediaUrl}
                      />
                      <div className={styles.filter} />
                      <div className={styles.menuandinfo}>
                        <div className={styles.storyidandmenu}>
                          <div
                            className={isActive ? styles.activestory : styles.inactivestory}
                            aria-label={`Story number ${v.tempId}, ${isActive ? "active" : "inactive"}`}>
                            {v.tempId}
                          </div>
                          <Dotmenu
                            showSetting={openMenuStoryId === v.storyId}
                            onToggle={() => handleMenuToggle(v.storyId)}
                            data={[
                              {
                                icon: "/share.svg",
                                value: t("linkURL"),
                                onClick: () => {
                                  const fakeEvent = {
                                    stopPropagation: () => {},
                                    preventDefault: () => {},
                                    currentTarget: { id: t("linkURL") },
                                  } as unknown as MouseEvent;
                                  props.handleClickOnIcon(fakeEvent, v.instaShareLink);
                                  setOpenMenuStoryId(null);
                                },
                              },
                            ]}
                          />
                        </div>

                        <div className={styles.engagmentinfo}>
                          <Tooltip
                            tooltipValue={v.viewCount > 0 ? v.viewCount.toLocaleString() : "0"}
                            position="top"
                            onHover={true}>
                            <div className={styles.counter}>
                              <img className={styles.icon} alt="" src="/icon-view.svg" aria-hidden="true" />
                              <span aria-label={`${v.viewCount} views`}>
                                {calculateSummary(v.viewCount > 0 ? v.viewCount : 0)}
                              </span>
                            </div>
                          </Tooltip>

                          <Tooltip
                            tooltipValue={v.replyCount > 0 ? v.replyCount.toLocaleString() : "0"}
                            position="top"
                            onHover={true}>
                            <div className={styles.counter}>
                              <img className={styles.icon} alt="" src="/icon-comment.svg" aria-hidden="true" />
                              <span aria-label={`${v.replyCount} replies`}>
                                {calculateSummary(v.replyCount > 0 ? v.replyCount : 0)}
                              </span>
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </section>
        )}
        {isLoadingMore && hasMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}>
            <DotLoaders />
          </div>
        )}
      </div>
    </>
  );
};

export default StoryContent;
