import { internalNotify, InternalResponseType, NotifType } from "saeed/components/notifications/notificationBox";

export function handleCopyLink(uriLink: string) {
  navigator.clipboard.writeText(uriLink);
  internalNotify(InternalResponseType.CopyLink, NotifType.Info);
}
