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
export async function GetServerResultWIthAccessToken<T, J>(
  methodType: MethodType,
  accessToken: string | undefined | null,
  subUrl: string,
  data?: T | any,
  queries: StringDitionaryItem[] = [],
  onUploadProgress: (numb: number) => void = () => {},
): Promise<IResult<J>> {
  console.log("accessToken ", accessToken);
  console.log("queries ", queries);
  console.log("dataaaaaaaaaaaaa123 ", data);
  console.log("instagraaaaaaaaaaaaaaaaaaaaaaaaammmmmmmmmmerLogin", accessToken);
  var axiosRes = await GetAxiosresponseWithAccessToken<T>(
    methodType,
    accessToken,
    subUrl,
    data,
    queries,
    onUploadProgress,
  );
  console.log("url", subUrl);
  let iresult: IResult<J> = axiosRes?.data;
  console.log("url", iresult);
  try {
    iresult.statusCode = axiosRes ? axiosRes.status : 500;
    iresult.errorMessage = axiosRes ? axiosRes.statusText : "";
  } catch (e) {
    iresult = {
      statusCode: axiosRes?.status ?? 500,
      errorMessage: axiosRes?.data as string,
      value: null as J,
      info: {} as ResultInfo,
      succeeded: false,
    };
    console.log("fault", e);
    // notify(ResponseType.Network, NotifType.Error);
  }
  console.log(" ✅ Console ⋙ iresult", iresult);
  return iresult;
}
async function GetAxiosresponseWithAccessToken<T>(
  methodType: MethodType,
  accessToken: string | undefined | null,
  subUrl: string,
  data: T | any,
  queries: StringDitionaryItem[] = [],
  onUploadProgress: (numb: number) => void = () => {},
) {
  var now = Date.now();
  let response: AxiosResponse | null | undefined = null;
  var url = "https://api.brancy.app/" + subUrl;

  let newQueries = queries.filter((x) => x.value != undefined);
  for (let i = 0; i < newQueries.length; i = i + 1) {
    if (i == 0) {
      url += "?";
    }
    const item = newQueries[i];
    if (i == 0) {
      url += item.key + "=" + encodeURIComponent(item.value!);
    } else {
      url += "&" + item.key + "=" + encodeURIComponent(item.value!);
    }
  }
  try {
    console.log(" ✅ Console ⋙ accessToken", accessToken);
  } catch (error) {}
  switch (methodType) {
    case MethodType.get:
      try {
        response = await axios.get(url, {
          headers: {
            "Content-Type": "",
            Authorization: accessToken != null && accessToken != undefined ? accessToken : "",
            instagramerId: "-1",
          },
        });
        console.log("GetAxiosresponseWithAccessTokenResponse", response);
        if (response?.status === ResponseType.PackageRequiredInThisTime) {
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(" ✅# Console ⋙ Error", "GetAxiosresponseWithAccessToken", error.response?.data.info);
          response = error.response;
        }
      }
      break;
    case MethodType.post:
      try {
        response = await axios.post(url, data, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(progress);
            }
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken != null && accessToken != undefined ? accessToken : "NULL",
            instagramerId: "-1",
          },
          timeout: 120000,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          response = error.response;
        }
      }
      break;
  }
  var now2 = Date.now();
  console.log(" ✅ Console ⋙ URL(" + (now2 - now) + ")", url);
  console.log(response);
  return response;
}
async function GetAxiosresponse<T>(
  methodType: MethodType,
  accessToken: Session | undefined | null,
  subUrl: string,
  data: T | any,
  queries: StringDitionaryItem[] = [],
  onUploadProgress: (numb: number) => void = () => {},
) {
  var now = Date.now();
  let response: AxiosResponse | null | undefined = null;
  var url = "https://api.brancy.app/" + subUrl;

  let newQueries = queries.filter((x) => x.value != undefined);
  for (let i = 0; i < newQueries.length; i = i + 1) {
    if (i == 0) {
      url += "?";
    }
    const item = newQueries[i];
    if (i == 0) {
      url += item.key + "=" + encodeURIComponent(item.value!);
    } else {
      url += "&" + item.key + "=" + encodeURIComponent(item.value!);
    }
  }
  // console.log(" ✅ Console ⋙ accessToken", accessToken);
  switch (methodType) {
    case MethodType.get:
      try {
        response = await axios.get(url, {
          headers: {
            "Content-Type": "",
            Authorization:
              accessToken != null && accessToken != undefined && accessToken.user != null
                ? accessToken.user.accessToken
                : "",
            instagramerId:
              accessToken != null && accessToken != undefined && accessToken.user != null
                ? accessToken.user.instagramerIds[accessToken.user.currentIndex]
                : "-1",
          },
        });
        console.log("ressssssssssssssssssssssss", response);
        if (response?.status === ResponseType.PackageRequiredInThisTime) {
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          response = error.response;
          console.log(" ✅# Console ⋙ Error", error.response?.data.info);
        }
      }
      break;
    case MethodType.post:
      try {
        response = await axios.post(url, data, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(progress);
            }
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken != null && accessToken != undefined ? accessToken.user.accessToken : "NULL",
            instagramerId:
              accessToken != null && accessToken != undefined
                ? accessToken.user.instagramerIds[accessToken.user.currentIndex]
                : "-1",
          },
          timeout: 120000,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          response = error.response;
        }
      }
      break;
  }
  var now2 = Date.now();
  console.log(" ✅ Console ⋙ URL(" + (now2 - now) + ")", url);
  console.log(response);
  return response;
}
export async function GetServerResult<T, J>(
  methodType: MethodType,
  accessToken: Session | undefined | null,
  subUrl: string,
  data?: T | any,
  queries: StringDitionaryItem[] = [],
  onUploadProgress: (numb: number) => void = () => {},
): Promise<IResult<J>> {
  if (accessToken) console.log("accessToken ", accessToken.user.accessToken);
  console.log("queries ", queries);
  console.log("dataaaaaaaaaaaaa123 ", data);
  var axiosRes = await GetAxiosresponse<T>(methodType, accessToken, subUrl, data, queries, onUploadProgress);
  console.log("url", subUrl);
  let iresult: IResult<J> = axiosRes?.data;
  console.log("url", iresult);
  try {
    console.log("header", subUrl, accessToken?.user.instagramerIds[accessToken.user.currentIndex]);
  } catch (error) {}
  try {
    if (axiosRes?.status === 401) {
      signOut({ callbackUrl: "/" });
      iresult.statusCode = axiosRes ? axiosRes.status : 500;
    } else {
      iresult.statusCode = axiosRes ? axiosRes.status : 500;
    }
    iresult.errorMessage = axiosRes ? axiosRes.statusText : "";
  } catch (e) {
    iresult = {
      statusCode: axiosRes?.status ?? 500,
      errorMessage: axiosRes?.data as string,
      value: null as J,
      info: {} as ResultInfo,
      succeeded: false,
    };
    console.log("fault", e);
    // notify(ResponseType.Network, NotifType.Error);
  }
  console.log(" ✅ Console ⋙ iresult", iresult);
  return iresult;
}
export async function UploadFile(
  accessToken: Session | null | undefined,
  file: File,
  onUploadProgress?: (progress: number) => void,
): Promise<IMediaResponse> {
  console.log("filllll upload", file);
  try {
    const formData = new FormData();
    formData.append("file", file);

    // اگر callback برای progress داده شده، از XMLHttpRequest استفاده کن
    if (onUploadProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const obj = JSON.parse(xhr.responseText);
              resolve({ showUrl: obj.showUrl, fileName: obj.fileName });
            } catch (error) {
              internalNotify(InternalResponseType.UploadMedia, NotifType.Warning);
              resolve({ showUrl: "", fileName: "" });
            }
          } else {
            internalNotify(InternalResponseType.UploadMedia, NotifType.Warning);
            resolve({ showUrl: "", fileName: "" });
          }
        });

        xhr.addEventListener("error", () => {
          notify(ResponseType.Unexpected, NotifType.Error);
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "https://uupload.brancy.app/file");
        xhr.setRequestHeader("Authorization", accessToken?.user.accessToken!);
        xhr.send(formData);
      });
    }

    // اگر callback نیست، از fetch استفاده کن (روش قبلی)
    const response = await fetch("https://uupload.brancy.app/file", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: accessToken?.user.accessToken!,
      },
    });
    console.log("uploaaaaaaaaaaaaaaaad", response);
    if (response.ok) {
      const res = await response.text();
      console.log("uploaaaaaaaaaaaaaaaad", res);
      const obj = JSON.parse(res);
      return { showUrl: obj.showUrl, fileName: obj.fileName };
    } else {
      internalNotify(InternalResponseType.UploadMedia, NotifType.Warning);
      return { showUrl: "", fileName: "" };
    }
  } catch (error) {
    notify(ResponseType.Unexpected, NotifType.Error);
    return { showUrl: "", fileName: "" };
  }
}
export enum MethodType {
  get = 0,
  post = 1,
}
export const SubUrls = {
  //#region User
  //#region Login
  SignIn: "user/signin",
  VerifyCode: "user/verifyCode",
  //#endregion login
  //#endregion
};
export interface IMediaResponse {
  showUrl: string;
  fileName: string;
}
