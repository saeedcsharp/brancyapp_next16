import { useSession } from "next-auth/react";
import Head from "next/head";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/api";
import { ILinkInsight } from "saeed/models/market/statistics";
import MultiChart from "../../../design/chart/Chart_month";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

type State = {
  insightGraph: ILinkInsight;
  loading: boolean;
  error: ResponseType | null;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: ILinkInsight }
  | { type: "FETCH_ERROR"; payload: ResponseType };

const initialState: State = {
  insightGraph: { id: "", insight: [], title: "" },
  loading: true,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, insightGraph: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const StatisticsLinks = (props: { linkId: number; removeMask: () => void }) => {
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);
  const closeButtonRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!session) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    dispatch({ type: "FETCH_START" });

    try {
      const res = await clientFetchApi<boolean, ILinkInsight>("/api/link/GetLinkInsight", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "linkId", value: props.linkId.toString() }], onUploadProgress: undefined });

      if (abortControllerRef.current?.signal.aborted) return;

      if (res.succeeded) {
        dispatch({ type: "FETCH_SUCCESS", payload: res.value });
      } else {
        notify(res.info.responseType, NotifType.Warning);
        dispatch({ type: "FETCH_ERROR", payload: res.info.responseType });
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        notify(ResponseType.Unexpected, NotifType.Error);
        dispatch({ type: "FETCH_ERROR", payload: ResponseType.Unexpected });
      }
    }
  }, [session, props.linkId]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.removeMask();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [props.removeMask]);

  const handleCloseKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        props.removeMask();
      }
    },
    [props.removeMask]
  );

  const { t } = useTranslation();
  const { insightGraph, loading } = state;

  return (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.navbar_Statistics)}</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      {loading && <Loading />}
      {!loading && (
        <>
          <div className="headerandinput">
            <h2 id="statistics-title" className="title">
              {t(LanguageKey.navbar_Statistics)}
            </h2>

            <MultiChart
              id={insightGraph.id}
              name={insightGraph.title}
              seriesData={
                insightGraph.insight
                  ? [
                      {
                        id: `${insightGraph.id}_series`,
                        name: insightGraph.title,
                        data: insightGraph.insight,
                      },
                    ]
                  : []
              }
              displayShow={true}
              unshowContent={true}
            />
          </div>
          <div className="ButtonContainer">
            <div
              ref={closeButtonRef}
              className="cancelButton"
              onClick={props.removeMask}
              role="button"
              tabIndex={0}
              onKeyDown={handleCloseKeyDown}
              aria-label={t(LanguageKey.close)}>
              {t(LanguageKey.close)}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StatisticsLinks;
