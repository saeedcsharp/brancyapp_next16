import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import styles from "./notpermission.module.css";

export enum PermissionType {
  Comments = "Comments",
  Messages = "Messages",
  Content = "Content",
  Insights = "Insights",
}

export interface PermissionConfig {
  title: string;
  description: string;
}

interface NotPermissionProps {
  permissionType: PermissionType;
}

export default function NotPermission({ permissionType }: NotPermissionProps) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const permissionConfigs: Record<PermissionType, PermissionConfig> = {
    [PermissionType.Comments]: {
      title: t(LanguageKey.AccessAndManageComments),
      description: t(LanguageKey.AccessAndManageCommentsExplain),
    },
    [PermissionType.Messages]: {
      title: t(LanguageKey.AccessAndManageMessages),
      description: t(LanguageKey.AccessAndManageMessagesExplain),
    },
    [PermissionType.Content]: {
      title: t(LanguageKey.AccessAndPublishContent),
      description: t(LanguageKey.AccessAndPublishContentExplain),
    },
    [PermissionType.Insights]: {
      title: t(LanguageKey.AccessAndManageInsights),
      description: t(LanguageKey.AccessAndManageInsightsExplain),
    },
  };
  const config = permissionConfigs[permissionType];

  async function redirectToInstagram() {
    try {
      const response = await GetServerResult<boolean, string>(
        MethodType.get,
        session,
        "PreInstagramer/GetInstagramRedirect"
      );
      if (response.succeeded) {
        router.push(response.value);
      } else {
        console.error(`${config.title}: ${response.info.responseType}`);
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      console.error(`${config.title}: Permission request failed`);
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  return (
    <>
      <div className="dialogBg" style={{ zIndex: 98 }}>
        <div className="popup">
          <div className="headerandinput">
            <h2 className="title">{config.title}</h2>
            <p className="explain">{config.description}</p>
          </div>
          <img
            onClick={redirectToInstagram}
            className={styles.imageContainer}
            alt="Permission Request"
            title="ℹ️ permission"
            src="/permission.png"
          />

          <button onClick={redirectToInstagram} className="saveButton">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" fill="#FFF" viewBox="0 0 24 24">
              <path opacity=".4" d="M1.3 12c0-3.7 3-6.7 6.7-6.7h8a6.8 6.8 0 0 1 0 13.5H8c-3.7 0-6.7-3-6.7-6.8" />
              <path d="M12.3 12a3.7 3.7 0 1 1 7.4 0 3.7 3.7 0 0 1-7.4 0" />
            </svg>
            {t(LanguageKey.EnablePermission)}
          </button>
        </div>
      </div>
    </>
  );
}
