import { Session } from "next-auth";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "../components/notifications/notificationBox";

const UPLOAD_BASE_URL = "https://uupload.brancy.app/file";

export interface IResult<T> {
  succeeded: boolean;
  value: T;
  info: ResultInfo;
  statusCode: number;
  errorMessage: string;
}

export interface ResultInfo {
  exception: {
    Message: string;
  } | null;
  message: string;
  needsChallenge: boolean;
  actionBlockEnd: number | null;
  responseType: ResponseType;
}

export interface StringDitionaryItem {
  key: string;
  value?: string;
}

export interface IMediaResponse {
  showUrl: string;
  fileName: string;
}

export enum MethodType {
  get = 0,
  post = 1,
}

function getSessionAccessToken(session: Session | null | undefined): string {
  return (session?.user as any)?.accessToken ?? "";
}

export async function UploadFile(
  accessToken: Session | null | undefined,
  file: File,
  onUploadProgress?: (progress: number) => void,
): Promise<IMediaResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (onUploadProgress) {
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (!event.lengthComputable) return;
          const progress = Math.round((event.loaded * 100) / event.total);
          onUploadProgress(progress);
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const obj = JSON.parse(xhr.responseText) as IMediaResponse;
              resolve({ showUrl: obj.showUrl, fileName: obj.fileName });
            } catch {
              internalNotify(InternalResponseType.UploadMedia, NotifType.Warning);
              resolve({ showUrl: "", fileName: "" });
            }
            return;
          }

          internalNotify(InternalResponseType.UploadMedia, NotifType.Warning);
          resolve({ showUrl: "", fileName: "" });
        });

        xhr.addEventListener("error", () => {
          notify(ResponseType.Unexpected, NotifType.Error);
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", UPLOAD_BASE_URL);
        xhr.setRequestHeader("Authorization", getSessionAccessToken(accessToken));
        xhr.send(formData);
      });
    }

    const response = await fetch(UPLOAD_BASE_URL, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: getSessionAccessToken(accessToken),
      },
    });

    if (!response.ok) {
      internalNotify(InternalResponseType.UploadMedia, NotifType.Warning);
      return { showUrl: "", fileName: "" };
    }

    const obj = (await response.json()) as IMediaResponse;
    return { showUrl: obj.showUrl, fileName: obj.fileName };
  } catch {
    notify(ResponseType.Unexpected, NotifType.Error);
    return { showUrl: "", fileName: "" };
  }
}
