import axios, { AxiosResponse } from "axios";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";

const API_BASE_URL = "https://api.brancy.app/";
const UPLOAD_BASE_URL = "https://uupload.brancy.app/file";
const REQUEST_TIMEOUT = 120000;

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

export const SubUrls = {
  SignIn: "user/signin",
  VerifyCode: "user/verifyCode",
};

function buildUrl(subUrl: string, queries: StringDitionaryItem[] = []): string {
  const url = new URL(subUrl, API_BASE_URL);
  for (const item of queries) {
    if (item.value !== undefined) {
      url.searchParams.append(item.key, item.value);
    }
  }
  return url.toString();
}

function getSessionAccessToken(session: Session | null | undefined): string {
  return (session?.user as any)?.accessToken ?? "";
}

function getSessionInstagramerId(session: Session | null | undefined): string {
  const user = session?.user as any;
  const currentIndex = Number(user?.currentIndex ?? -1);
  const instagramerIds = Array.isArray(user?.instagramerIds) ? user.instagramerIds : [];
  if (currentIndex >= 0 && currentIndex < instagramerIds.length) {
    return String(instagramerIds[currentIndex]);
  }
  return "-1";
}

async function requestApi<T>(
  methodType: MethodType,
  url: string,
  data: T | undefined,
  headers: Record<string, string>,
  onUploadProgress: (numb: number) => void,
): Promise<AxiosResponse | null | undefined> {
  try {
    return await axios.request({
      url,
      method: methodType === MethodType.get ? "get" : "post",
      data: methodType === MethodType.post ? data : undefined,
      headers,
      timeout: REQUEST_TIMEOUT,
      onUploadProgress:
        methodType === MethodType.post
          ? (progressEvent) => {
              if (!progressEvent.total) return;
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(progress);
            }
          : undefined,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
}

function normalizeResult<J>(axiosRes: AxiosResponse | null | undefined): IResult<J> {
  const raw = axiosRes?.data as Partial<IResult<J>> | undefined;
  return {
    succeeded: raw?.succeeded ?? false,
    value: (raw?.value ?? null) as J,
    info: (raw?.info ?? {
      exception: null,
      message: "",
      needsChallenge: false,
      actionBlockEnd: null,
      responseType: ResponseType.Unexpected,
    }) as ResultInfo,
    statusCode: axiosRes?.status ?? 500,
    errorMessage: axiosRes?.statusText ?? "",
  };
}

export async function GetServerResultWIthAccessToken<T, J>(
  methodType: MethodType,
  accessToken: string | undefined | null,
  subUrl: string,
  data?: T,
  queries: StringDitionaryItem[] = [],
  onUploadProgress: (numb: number) => void = () => {},
): Promise<IResult<J>> {
  const url = buildUrl(subUrl, queries);
  const axiosRes = await requestApi(
    methodType,
    url,
    data,
    {
      "Content-Type": methodType === MethodType.post ? "application/json" : "",
      Authorization: accessToken ?? "",
      instagramerId: "-1",
    },
    onUploadProgress,
  );

  return normalizeResult<J>(axiosRes);
}

export async function GetServerResult<T, J>(
  methodType: MethodType,
  accessToken: Session | undefined | null,
  subUrl: string,
  data?: T,
  queries: StringDitionaryItem[] = [],
  onUploadProgress: (numb: number) => void = () => {},
): Promise<IResult<J>> {
  const url = buildUrl(subUrl, queries);
  const axiosRes = await requestApi(
    methodType,
    url,
    data,
    {
      "Content-Type": methodType === MethodType.post ? "application/json" : "",
      Authorization: getSessionAccessToken(accessToken),
      instagramerId: getSessionInstagramerId(accessToken),
    },
    onUploadProgress,
  );

  if (axiosRes?.status === 401) {
    signOut({ callbackUrl: "/" });
  }

  return normalizeResult<J>(axiosRes);
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
