import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { InitialSetupState } from "saeed/models/homeIndex/home";
import { MethodType } from "saeed/helper/api";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import { useTutorial } from "./hooks/useTutorial";
import InitialSetup from "./initialSetup/initialSetup";
import { tutorialConfigs, TutorialPageKey } from "./tutorialConfigs";
import TutorialDesktop from "./tutorialDesktop";
import TutorialMobile from "./tutorialMobile";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

interface TutorialWrapperProps {
  pageKey: TutorialPageKey;
}

const TutorialWrapper: React.FC<TutorialWrapperProps> = ({ pageKey }) => {
  const { showTutorial, showInitialSetup, screenType, completeTutorial, completeInitialSetup } = useTutorial({
    pageKey,
  });
  const { data: session } = useSession();
  const router = useRouter();
  const [exsistedIntialSetup, setExsistedInitialSetup] = useState<InitialSetupState | null>(null);
  const [initialSetupLoading, setInitialSetupLoading] = useState<boolean>(true);

  // API function: fetch existing initial setup based on current session
  const fetchInitialSetupFromApi = async (currentSession: Session | null): Promise<InitialSetupState | null> => {
    if (!currentSession) return null;
    try {
      const res = await clientFetchApi<boolean, string>("/api/uisetting/Get", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });

      if (!res.statusCode) {
        notify(res.info.responseType, NotifType.Warning);
        return null;
      } else {
        if (res.value === null) return null;
        const data = await JSON.parse(res.value);
        const result: InitialSetupState = {
          language: data?.language ?? "",
          calendar: data?.calendar ?? "",
          theme: data?.theme ?? "",
        };
        // if (!result.language && !result.calendar && !result.theme) return null;
        localStorage.setItem("language", result.language);
        localStorage.setItem("calendar", result.calendar);
        localStorage.setItem("theme", result.theme);
        localStorage.setItem("brancy_initial_setup_completed", "true");
        // If already on /home, force a reload; otherwise navigate to /home
        if (router.pathname === "/home") {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        } else {
          router.push("/home");
        }
        return result;
      }
    } catch (err) {
      notify(ResponseType.Unexpected, NotifType.Error);
      return null;
    }
  };

  // فقط وقتی showInitialSetup = true است، API را بزن
  useEffect(() => {
    let cancelled = false;

    if (!showInitialSetup) {
      setInitialSetupLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setInitialSetupLoading(true);

    (async () => {
      const setup = await fetchInitialSetupFromApi(session ?? null);
      if (!cancelled) {
        setExsistedInitialSetup(setup);
        setInitialSetupLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, showInitialSetup]);

  // اول تنظیمات اولیه را نمایش بده - اگر API نال برگرداند و لودینگ تمام شده باشد
  if (showInitialSetup && !exsistedIntialSetup && !initialSetupLoading) {
    return <InitialSetup onComplete={completeInitialSetup} />;
  }
  // بعد توتریال را نمایش بده
  if (showTutorial && !exsistedIntialSetup) {
    const tutorialConfig = tutorialConfigs[pageKey];
    const steps = screenType === "desktop" ? tutorialConfig.desktop : tutorialConfig.mobile;
    if (screenType === "desktop") {
      return <TutorialDesktop onComplete={completeTutorial} tutorialSteps={steps} />;
    }
    return <TutorialMobile onComplete={completeTutorial} tutorialSteps={steps} />;
  }
  return null;
};
export default TutorialWrapper;
