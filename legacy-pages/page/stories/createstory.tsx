import ImageCompressor from "compressorjs";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import SetTimeAndDate from "saeed/components/dateAndTime/setTimeAndDate";
import ConstantCounterDown from "saeed/components/design/counterDown/constantCounterDown";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";

import Modal from "saeed/components/design/modal";
import ProgressBar from "saeed/components/design/progressBar/progressBar";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import NotAllowed from "saeed/components/notOk/notAllowed";
import NotPermission, { PermissionType } from "saeed/components/notOk/notPermission";
import DeleteDraft from "saeed/components/page/popup/deleteDraft";
import ErrorDraft from "saeed/components/page/popup/errorDraft";
import QuickStoryReplyPopup from "saeed/components/page/popup/quickStoryReply";
import SaveDraft from "saeed/components/page/popup/saveDraft";
import DeletePrePost from "saeed/components/page/scheduledPost/deletePrePost";
import { convertHeicToJpeg } from "saeed/helper/convertHeicToJPEG";
import { LoginStatus, packageStatus, RoleAccess } from "saeed/helper/loadingStatus";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { GetServerResult, MethodType, UploadFile } from "saeed/models/IResult";
import { AutoReplyPayLoadType, MediaProductType } from "saeed/models/messages/enum";
import { IAutomaticReply, IMediaUpdateAutoReply, IPublishLimit } from "saeed/models/page/post/posts";
import { IErrorPrePostInfo, IPostImageInfo, MediaType } from "saeed/models/page/post/preposts";
import {
  IPreStory,
  IPreStoryInfo,
  IStoryDraftInfo,
  IStoryImageInfo,
  IStoryVideoInfo,
} from "saeed/models/page/story/preStories";
import styles from "./createStory.module.css";
const CreateStory = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const { query } = router;
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isFetchingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputCoverRef = useRef<HTMLInputElement | null>(null);
  const inputReplaceRef = useRef<HTMLInputElement | null>(null);
  const [recommendedTime, setRecommendedTime] = useState<number[]>([
    Date.now() / 1000 + 172800,
    Date.now() / 1000 + 172800,
    Date.now() / 1000 + 172800,
    Date.now() / 1000 + 172800,
  ]);
  const [autoReply, setAutoReply] = useState<IAutomaticReply>({
    items: [],
    response: "",
    shouldFollower: false,
    automaticType: AutoReplyPayLoadType.KeyWord,
    masterFlow: null,
    masterFlowId: null,
    mediaId: "",
    pauseTime: Date.now(),
    productType: MediaProductType.Live,
    prompt: null,
    promptId: null,
    sendCount: 0,
    sendPr: false,
    replySuccessfullyDirected: false,
  });
  const [totalPrePostCount, settotalPrePostCount] = useState(0);
  const [tempId, setTempId] = useState(0);
  const [draftId, setDraftId] = useState(-1);
  const [preStoryId, setpreStoryId] = useState(-1);
  const [automaticPost, setAutomaticPost] = useState(query.newschedulestory === "true");
  const [showSetDateAndTime, setShowSetDateAndTime] = useState(false);
  const [dateAndTime, setDateAndTime] = useState<number>(Date.now() + 86400000);
  const [activeLimitTime, setActiveLimitTime] = useState(false);
  const [recTimeSelect, setRecTimeSelect] = useState(-1);
  const [showMedias, setShowMedias] = useState<IPreStory | null>(null);
  const [showDraft, setShowDraft] = useState<boolean>(false);
  const [showDeleteDraft, setShowDeleteDraft] = useState<boolean>(false);
  const [analizeProcessing, setAnalizeProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [QuickReply, setQuickReply] = useState(false);
  const [showQuickReplyPopup, setShowQuickReplyPopup] = useState(false);
  const [showDeletePreStory, setShowDeletePreStory] = useState(false);
  const [showDraftError, setshowDraftError] = useState<IErrorPrePostInfo | null>(null);

  const GetNextBestTimes = useCallback(async () => {
    var res = await GetServerResult<boolean, number[]>(
      MethodType.get,
      session,
      "Instagramer/Post/GetBestPublishTime",
      null
    );
    if (res.succeeded) {
      setRecommendedTime(res.value);
    }
  }, [session]);
  const HandleUpload = useCallback(
    async (isDraft: boolean) => {
      console.log("upload entry");
      console.log("showMedias:", showMedias);
      console.log("timeUnix", dateAndTime);
      console.log("QuickReply", QuickReply);
      setAnalizeProcessing(true);
      if (showMedias) {
        if (showMedias.mediaType === MediaType.Image) {
          var data: IStoryImageInfo = {
            draftId: draftId,
            uploadImage: {
              imageUri: showMedias.mediaUri ? showMedias.mediaUploadId : null,
              uploadImageUrl: !showMedias.mediaUri ? showMedias.mediaUploadId : null,
              userTags: [],
            },
            automaticMediaReply: QuickReply
              ? {
                  automaticType: autoReply.automaticType,
                  keys: autoReply.items.map((x) => x.text),
                  masterFlowId: autoReply.masterFlowId,
                  promptId: autoReply.promptId,
                  response: autoReply.response,
                  sendPr: autoReply.sendPr,
                  shouldFollower: autoReply.shouldFollower,
                  replySuccessfullyDirected: autoReply.replySuccessfullyDirected,
                }
              : null,
            preStoryId: preStoryId,
            uiParameters: null,
          };
          console.log("dataImage", data);
          var res = await GetServerResult<IStoryImageInfo, number>(
            MethodType.post,
            session,
            "Instagramer" + `/Story/PublishImage`,
            data,
            [
              { key: "isDraft", value: isDraft ? "true" : "false" },
              {
                key: "timeUnix",
                value: !automaticPost ? "0" : Math.floor(dateAndTime / 1e3).toString(),
              },
            ]
          );
          if (res.succeeded && res.value > 0) {
            setDraftId(res.value);
          }
        } else {
          var vData: IStoryVideoInfo = {
            draftId: draftId,
            preStoryId: preStoryId,
            uploadVideo: {
              videoUri: showMedias.mediaUri ? showMedias.mediaUploadId! : null, //it might be changed//
              uploadVideoUrl: !showMedias.mediaUri ? showMedias.mediaUploadId : null,
              userTags: [],
            },
            uploadCover:
              showMedias.coverId.length > 0
                ? {
                    imageUri: showMedias.coverUri ? showMedias.coverId : null,
                    uploadImageUrl: !showMedias.coverUri ? showMedias.coverId : null,
                  }
                : null,
            automaticDirectReply: QuickReply
              ? {
                  automaticType: autoReply.automaticType,
                  keys: autoReply.items.map((x) => x.text),
                  masterFlowId: autoReply.masterFlowId,
                  promptId: autoReply.promptId,
                  response: autoReply.response,
                  sendPr: autoReply.sendPr,
                  shouldFollower: autoReply.shouldFollower,
                  replySuccessfullyDirected: autoReply.replySuccessfullyDirected,
                }
              : null,
            uiParameters: null,
          };

          console.log("dataVideo", vData);
          var res = await GetServerResult<IPostImageInfo, number>(
            MethodType.post,
            session,
            "Instagramer" + `/Story/PublishVideo`,
            vData,
            [
              { key: "isDraft", value: isDraft ? "true" : "false" },
              {
                key: "timeUnix",
                value: !automaticPost ? "0" : Math.floor(dateAndTime / 1e3).toString(),
              },
            ]
          );
          if (res.succeeded && res.value > 0) {
            setDraftId(res.value);
          }
        }
      }
      setAnalizeProcessing(false);
      router.push("/page/stories/");
    },
    [session, showMedias, QuickReply, autoReply, draftId, preStoryId, automaticPost, dateAndTime, router]
  );
  const HandleDelete = useCallback(async () => {
    try {
      if (draftId > 0) {
        var res = await GetServerResult<boolean, boolean>(
          MethodType.get,
          session,
          "Instagramer" + "/Story/deleteDraft",
          null,
          [{ key: "id", value: draftId.toString() }]
        );
        if (res.succeeded) router.push("/page/stories");
        else notify(res.info.responseType, NotifType.Warning);
      } else if (preStoryId > 0) {
        var res = await GetServerResult<boolean, boolean>(
          MethodType.get,
          session,
          "Instagramer" + "/story/deletePreStory",
          null,
          [{ key: "preStoryId", value: preStoryId.toString() }]
        );
        if (res.succeeded) router.push("/page/stories");
        else notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, draftId, preStoryId, router]);
  const handleDeletePreStory = useCallback(async () => {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer" + "" + "/Story/DeletePreStory",
        null,
        [{ key: "preStoryId", value: preStoryId.toString() }]
      );
      if (res.succeeded) {
        router.push("/page/stories");
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, preStoryId, router]);
  const handleSelectAlbumMedia = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      setLoadingUpload(true);
      let file = await convertHeicToJpeg(e.target.files?.[0]!);
      console.log("Selected file:", file);
      if (file) {
        const extension = file.name.split(".").pop()?.toLowerCase();
        // For image files, compress using ImageCompressor
        if (file.type.startsWith("image/") || file.type.length === 0) {
          new ImageCompressor(file, {
            quality: 0.95,
            maxWidth: 700,
            maxHeight: 700,
            mimeType: "image/jpeg",
            success(result) {
              const reader = new FileReader();
              reader.onload = () => {
                const selectedMedia1 = reader.result as string;
                const img = new Image();
                img.onload = async () => {
                  const width = img.width;
                  const height = img.height;
                  if (!file) return;
                  if (!checkSpecImage(width, height, file.size)) return;
                  if (width / height < 0.8 || width / height > 1.91) {
                    // Crop the image to the allowed aspect ratio (0.8 - 1.91)
                    // We'll use a canvas to crop the image in the browser
                    const allowedMin = 0.8;
                    const allowedMax = 1.91;
                    let targetAspect = width / height < allowedMin ? allowedMin : allowedMax;
                    let newWidth = width;
                    let newHeight = height;

                    if (width / height < allowedMin) {
                      // Too tall, crop height
                      newWidth = width;
                      newHeight = Math.round(width / allowedMin);
                    } else if (width / height > allowedMax) {
                      // Too wide, crop width
                      newHeight = height;
                      newWidth = Math.round(height * allowedMax);
                    }

                    // Calculate cropping start points
                    const sx = Math.floor((width - newWidth) / 2);
                    const sy = Math.floor((height - newHeight) / 2);

                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(img, sx, sy, newWidth, newHeight, 0, 0, newWidth, newHeight);
                      const croppedDataUrl = canvas.toDataURL("image/jpeg");
                      // Now upload the cropped image
                      canvas.toBlob(async (blob) => {
                        if (!blob) return;
                        setLoadingUpload(true);
                        const croppedFile = new File([blob], file.name, {
                          type: "image/jpeg",
                        });
                        const res = await UploadFile(session, croppedFile);
                        setLoadingUpload(false);
                        setShowMedias({
                          mediaUri: null,
                          error: "",
                          mediaType: MediaType.Image,
                          media: croppedDataUrl,
                          cover: "",
                          mediaUploadId: res ? res.fileName : "",
                          coverId: "",
                          coverUri: null,
                        });
                      }, "image/jpeg");
                    }
                    return;
                  }
                  setLoadingUpload(true);
                  const res = await UploadFile(session, file!);
                  setLoadingUpload(false);
                  if (!res) return;
                  setShowMedias({
                    mediaUri: null,
                    error: "",
                    mediaType: MediaType.Image,
                    media: selectedMedia1,
                    cover: "",
                    mediaUploadId: res ? res.fileName : "",
                    coverId: "",
                    coverUri: null,
                  });
                };
                img.src = selectedMedia1;
              };
              reader.readAsDataURL(result);
            },
            error(err) {
              console.log(err);
              internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
            },
          });
        } else if (
          file.type === "video/mp4" ||
          file.type === "video/quicktime" ||
          extension === "mp4" ||
          extension === "mov"
        ) {
          // Video files: use FileReader directly without compression
          const reader = new FileReader();
          reader.onload = () => {
            const selectedMedia1 = reader.result as string;
            const video = document.createElement("video");
            video.onloadedmetadata = async () => {
              const width = video.videoWidth;
              const height = video.videoHeight;
              if (!file) return;
              if (!checkSpecVideo(width, height, video.duration, file.size)) return;
              setLoadingUpload(true);
              const res = await UploadFile(session, file!);
              setLoadingUpload(false);
              setShowMedias({
                mediaUri: null,
                error: "",
                mediaType: MediaType.Video,
                media: selectedMedia1,
                cover: "",
                mediaUploadId: res ? res.fileName : "",
                coverId: "",
                coverUri: null,
              });
            };
            video.src = selectedMedia1;
          };
          reader.readAsDataURL(file);
        } else {
          internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
        }

        if (inputRef.current) {
          inputRef.current.value = "";
        }
        setLoadingUpload(false);
      }
    },
    [session]
  );

  // const handleSelectCover = async (e: ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file && showMediaIndex === 0 && postType === PostType.Single) {
  //     if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
  //       internalNotify(
  //         InternalResponseType.NotPermittedMediaType,
  //         NotifType.Warning
  //       );
  //       return;
  //     }
  //     if (file.size > 8192000) {
  //       internalNotify(
  //         InternalResponseType.ExceedPermittedSizeOfImage,
  //         NotifType.Warning
  //       );
  //       return;
  //     }
  //     setLoadingUpload(true);
  //     const coverImgId = await UploadFile(session, file);
  //     setLoadingUpload(false);
  //     console.log("coverrrrrrrrrrrrr", coverImgId);
  //     if (!coverImgId) return;
  //     // You can display a preview of the selected image if needed.
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       var selectedMedia1 = reader.result as string;
  //       setShowMedias((prev) => {
  //         const updated = [...prev];
  //         if (updated[0]) {
  //           updated[0] = {
  //             ...updated[0],
  //             cover: selectedMedia1,
  //             coverId: coverImgId,
  //             coverUri: null,
  //           };
  //         }
  //         return updated;
  //       });
  //     };
  //     reader.readAsDataURL(file);
  //     if (inputCoverRef.current) {
  //       inputCoverRef.current.value = "";
  //     }
  //   }
  // };
  // const handleDeleteCover = () => {
  //   if (showMedias.length > 0 && showMedias[0].coverId.length === 0) return;
  //   setShowMedias((prev) => {
  //     const updated = [...prev];
  //     if (updated[0]) {
  //       updated[0] = {
  //         ...updated[0],
  //         cover: "",
  //         coverId: "",
  //         coverUri: null,
  //       };
  //     }
  //     return updated;
  //   });
  // };
  const handleReplaceMedia = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (preStoryId > 0) return;
      setLoadingUpload(true);
      let file = await convertHeicToJpeg(e.target.files?.[0]!);
      if (file) {
        // For image files, use ImageCompressor from "compressorjs"
        setLoadingUpload(true);
        file = await convertHeicToJpeg(file);
        if (file.type.startsWith("image/") || file.type.length === 0) {
          new ImageCompressor(file, {
            quality: 0.95,
            maxWidth: 700,
            maxHeight: 700,
            mimeType: "image/jpeg",
            success(result) {
              const reader = new FileReader();
              reader.onload = () => {
                const selectedMedia1 = reader.result as string;
                const img = new Image();
                img.onload = async () => {
                  const width = img.width;
                  const height = img.height;
                  if (!checkSpecImage(width, height, file!.size)) return;
                  if (width / height < 0.8 || width / height > 1.91) {
                    // Crop the image to the allowed aspect ratio (0.8 - 1.91)
                    // We'll use a canvas to crop the image in the browser
                    const allowedMin = 0.8;
                    const allowedMax = 1.91;
                    let targetAspect = width / height < allowedMin ? allowedMin : allowedMax;
                    let newWidth = width;
                    let newHeight = height;

                    if (width / height < allowedMin) {
                      // Too tall, crop height
                      newWidth = width;
                      newHeight = Math.round(width / allowedMin);
                    } else if (width / height > allowedMax) {
                      // Too wide, crop width
                      newHeight = height;
                      newWidth = Math.round(height * allowedMax);
                    }

                    // Calculate cropping start points
                    const sx = Math.floor((width - newWidth) / 2);
                    const sy = Math.floor((height - newHeight) / 2);

                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(img, sx, sy, newWidth, newHeight, 0, 0, newWidth, newHeight);
                      const croppedDataUrl = canvas.toDataURL("image/jpeg");
                      // Now upload the cropped image
                      canvas.toBlob(async (blob) => {
                        if (!blob) return;
                        setLoadingUpload(true);
                        const croppedFile = new File([blob], file.name, {
                          type: "image/jpeg",
                        });
                        const res = await UploadFile(session, croppedFile);
                        setLoadingUpload(false);
                        setShowMedias({
                          mediaUri: null,
                          error: "",
                          mediaType: MediaType.Image,
                          media: selectedMedia1,
                          cover: "",
                          mediaUploadId: res ? res.fileName : "",
                          coverId: "",
                          coverUri: null,
                        });
                      }, "image/jpeg");
                    }
                    return;
                  }
                  setLoadingUpload(true);
                  const res = await UploadFile(session, file!);
                  setLoadingUpload(false);
                  setShowMedias({
                    error: "",
                    mediaType: MediaType.Image,
                    media: selectedMedia1,
                    cover: "",
                    mediaUploadId: res ? res.fileName : "",
                    coverId: "",
                    mediaUri: null,
                    coverUri: null,
                  });
                };
                img.src = selectedMedia1;
              };
              reader.readAsDataURL(result);
            },
            error(err) {
              internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
            },
          });
        } else if (file.type === "video/mp4") {
          // Video files: use FileReader directly without compression
          const reader = new FileReader();
          reader.onload = () => {
            const selectedMedia1 = reader.result as string;
            const video = document.createElement("video");
            video.onloadedmetadata = async () => {
              const width = video.videoWidth;
              const height = video.videoHeight;
              if (!checkSpecVideo(width, height, video.duration, file!.size)) return;
              setLoadingUpload(true);
              const res = await UploadFile(session, file!);
              setLoadingUpload(false);
              setShowMedias({
                error: "",
                mediaType: MediaType.Video,
                media: selectedMedia1,
                cover: "",
                mediaUploadId: res ? res.fileName : "",
                coverId: "",
                mediaUri: null,
                coverUri: null,
              });
            };
            video.src = selectedMedia1;
          };
          reader.readAsDataURL(file);
        } else {
          internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
        }
      }
      if (inputReplaceRef.current) {
        inputReplaceRef.current.value = "";
      }
      setLoadingUpload(false);
    },
    [session, preStoryId]
  );

  const handleUploadImage = useCallback(() => {
    const uploadElement = document.getElementById("AddMedia");
    if (uploadElement) {
      uploadElement.click();
    }
  }, []);
  // const handleUploadCoverImage = () => {
  //   if (
  //     (showMedias.length > 0 &&
  //       showMediaIndex !== 0 &&
  //       showMedias[showMediaIndex].mediaType === MediaType.Video) ||
  //     (showMedias.length > 0 &&
  //       showMedias[showMediaIndex].mediaType === MediaType.Image)
  //   )
  //     return;
  //   // var medias = showMedias;
  //   // if (medias[showMediaIndex].mediaType !== MediaType.Video) return;
  //   if (inputCoverRef.current) {
  //     inputCoverRef.current.click();
  //   }
  // };
  const handleUploadRepalceMedia = useCallback(() => {
    if (preStoryId > 0) return;
    if (inputReplaceRef.current) {
      inputReplaceRef.current.click();
    }
  }, [preStoryId]);
  const removeMask = useCallback(() => {
    setShowSetDateAndTime(false);
    setShowDraft(false);
    setshowDraftError(null);
    setShowDeleteDraft(false);
  }, []);
  const saveDateAndTime = useCallback(
    (date: string | undefined) => {
      setRecTimeSelect(-1);
      if (date !== undefined) {
        let dateInt = parseInt(date);
        setDateAndTime(dateInt);
        removeMask();
      }
    },
    [removeMask]
  );
  const handleShowDraft = useCallback(() => {
    if (showMedias && preStoryId <= 0) setShowDraft(true);
    else router.push("/page/stories");
  }, [showMedias, preStoryId, router]);
  const handleShowDeleteDraft = useCallback(() => {
    console.log("drafttttttttt", draftId);
    if (draftId > 0) setShowDeleteDraft(true);
    else if (preStoryId > 0) setShowDeletePreStory(true);
    else router.push("/page/stories");
  }, [draftId, preStoryId, router]);
  const handleGetDraftStory = useCallback(
    async (draftId: string) => {
      try {
        console.log("draftId", draftId);
        let res = await GetServerResult<boolean, IStoryDraftInfo>(
          MethodType.get,
          session,
          "Instagramer" + "/Story/GetDraft",
          null,
          [{ key: "id", value: draftId }]
        );
        if (res.succeeded) {
          const draft = res.value;
          setDraftId(Number(draftId));
          if (draft.errorMessage) {
            const errorMsg: IErrorPrePostInfo = JSON.parse(draft.errorMessage);
            setshowDraftError(errorMsg);
          }
          setQuickReply(draft.automaticReplyInfo ? true : false);
          setAutoReply(
            draft.automaticReplyInfo
              ? {
                  items: draft.automaticReplyInfo.keys.map((x) => ({
                    id: "",
                    sendCount: 0,
                    text: x,
                  })),
                  response: draft.automaticReplyInfo.response,
                  shouldFollower: draft.automaticReplyInfo.shouldFollower,
                  automaticType: draft.automaticReplyInfo.automaticType,
                  masterFlow: null,
                  masterFlowId: draft.automaticReplyInfo.masterFlowId,
                  mediaId: "",
                  pauseTime: null,
                  productType: MediaProductType.Live,
                  prompt: null,
                  promptId: draft.automaticReplyInfo.promptId,
                  sendCount: 0,
                  sendPr: draft.automaticReplyInfo.sendPr,
                  replySuccessfullyDirected: draft.automaticReplyInfo.replySuccessfullyDirected,
                }
              : {
                  items: [],
                  response: "",
                  shouldFollower: false,
                  automaticType: AutoReplyPayLoadType.KeyWord,
                  masterFlow: null,
                  masterFlowId: null,
                  mediaId: "",
                  pauseTime: null,
                  productType: MediaProductType.Live,
                  prompt: null,
                  promptId: null,
                  sendCount: 0,
                  sendPr: false,
                  replySuccessfullyDirected: false,
                }
          );
          console.log("mediaType", draft.mediaType);
          if (draft.mediaType == MediaType.Image) {
            let media = {
              cover: "",
              error: "",
              mediaUri: basePictureUrl + draft.mediaUrl!,
              media: basePictureUrl + draft.mediaUrl!,
              mediaType: MediaType.Image,
              mediaUploadId: draft.mediaUrl!,
              coverId: "",
              coverUri: null,
            };

            console.log("media image", media);
            setShowMedias(media);
          } else if (draft.mediaType == MediaType.Video) {
            // setSharePreviewToFeed(draft.sendPreviewToFeed);
            let media = {
              coverUri: basePictureUrl + draft.thumbnailMediaUrl,
              error: "",
              mediaUri: basePictureUrl + draft.mediaUrl!,
              media: basePictureUrl + draft.mediaUrl!,
              cover: basePictureUrl + draft.thumbnailMediaUrl,
              mediaType: MediaType.Video,
              mediaUploadId: draft.mediaUrl!,
              coverId: draft.thumbnailMediaUrl,
            };

            setShowMedias(media);
            console.log("videoMedia", media);
          }
          console.log("draftId", draftId);
          console.log("draft from server", res.value);
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, basePictureUrl]
  );

  const handleGetPreStory = useCallback(
    async (preStoryId: string) => {
      try {
        console.log("preStoryId", preStoryId);
        let res = await GetServerResult<boolean, IPreStoryInfo>(
          MethodType.get,
          session,
          "Instagramer/Story/GetPreStory",
          null,
          [{ key: "id", value: preStoryId }]
        );
        if (res.succeeded) {
          const preStory = res.value;
          setpreStoryId(preStory.preStoryId);
          setDraftId(Number(draftId));
          setQuickReply(preStory.automaticMediaReply ? true : false);
          setAutoReply(
            preStory.automaticMediaReply
              ? {
                  items: preStory.automaticMediaReply.keys.map((x) => ({
                    id: "",
                    sendCount: 0,
                    text: x,
                  })),
                  response: preStory.automaticMediaReply.response,
                  shouldFollower: preStory.automaticMediaReply.shouldFollower,
                  automaticType: preStory.automaticMediaReply.automaticType,
                  masterFlow: null,
                  masterFlowId: preStory.automaticMediaReply.masterFlowId,
                  mediaId: "",
                  pauseTime: null,
                  productType: MediaProductType.Live,
                  prompt: null,
                  promptId: preStory.automaticMediaReply.promptId,
                  sendCount: 0,
                  sendPr: preStory.automaticMediaReply.sendPr,
                  replySuccessfullyDirected: preStory.automaticMediaReply.replySuccessfullyDirected,
                }
              : {
                  items: [],
                  response: "",
                  shouldFollower: false,
                  automaticType: AutoReplyPayLoadType.KeyWord,
                  masterFlow: null,
                  masterFlowId: null,
                  mediaId: "",
                  pauseTime: null,
                  productType: MediaProductType.Live,
                  prompt: null,
                  promptId: null,
                  sendCount: 0,
                  sendPr: false,
                  replySuccessfullyDirected: false,
                }
          );
          setAutomaticPost(true);
          setDateAndTime(preStory.upingTime * 1e3);
          console.log("mediaType", preStory.mediaType);
          if (preStory.mediaType == MediaType.Image) {
            let media = {
              cover: "",
              error: "",
              mediaUri: basePictureUrl + preStory.mediaUrl!,
              media: basePictureUrl + preStory.mediaUrl!,
              mediaType: MediaType.Image,
              mediaUploadId: preStory.mediaUrl!,
              coverId: "",
              coverUri: null,
            };

            console.log("media image", media);
            setShowMedias(media);
          } else if (preStory.mediaType == MediaType.Video) {
            // setSharePreviewToFeed(draft.sendPreviewToFeed);
            let media = {
              coverUri: basePictureUrl + preStory.thumbnailMediaUrl,
              error: "",
              mediaUri: basePictureUrl + preStory.mediaUrl!,
              media: basePictureUrl + preStory.mediaUrl!,
              cover: basePictureUrl + preStory.thumbnailMediaUrl,
              mediaType: MediaType.Video,
              mediaUploadId: preStory.mediaUrl!,
              coverId: preStory.thumbnailMediaUrl,
            };

            setShowMedias(media);
            console.log("videoMedia", media);
          }
          console.log("draftId", draftId);
          console.log("draft from server", res.value);
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, basePictureUrl]
  );

  const getPublishLimitContent = useCallback(async () => {
    try {
      var res = await GetServerResult<boolean, IPublishLimit>(
        MethodType.get,
        session,
        "Instagramer/Post/GetPublishLimitContent",
        null
      );
      if (res.succeeded) {
        if (res.value.total === res.value.usage) {
          setAutomaticPost(true);
          setActiveLimitTime(true);
        }
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session]);

  const checkSpecImage = useCallback((width: number, height: number, size: number) => {
    if (size > 8192000) {
      internalNotify(InternalResponseType.ExceedPermittedSizeOfImage, NotifType.Warning);
      return false;
    }
    return true;
  }, []);

  const checkSpecVideo = useCallback((width: number, height: number, duration: number, size: number) => {
    const SINGLE_CONSTRAINTS = {
      aspectRatioMin: 0.1,
      aspectRatioMax: 10,
      durationMin: 3,
      durationMax: 60,
      maxSizeBytes: 99 * 1024 * 1000, // 25M
    };
    const checkAspectRatio = (width: number, height: number, min: number, max: number) => {
      const ratio = width / height;
      return ratio >= min && ratio <= max;
    };
    if (!width || !height || !duration || isNaN(duration)) {
      internalNotify(InternalResponseType.InvalidMetaData, NotifType.Warning);
      return;
    }
    const checkDuration = (duration: number, min: number, max: number) => {
      return duration >= min && duration <= max;
    };
    const checkSize = (size: number, maxSize: number) => {
      return size <= maxSize;
    };
    const constraints = SINGLE_CONSTRAINTS;
    if (!checkAspectRatio(width, height, constraints.aspectRatioMin, constraints.aspectRatioMax)) {
      internalNotify(InternalResponseType.ExceedPermittedAspectRatioStory, NotifType.Warning);

      return false;
    }
    if (!checkDuration(duration, constraints.durationMin, constraints.durationMax)) {
      internalNotify(InternalResponseType.ExceedPermittedDurationOfVideoStory, NotifType.Warning);

      return false;
    }
    if (!checkSize(size, constraints.maxSizeBytes)) {
      internalNotify(InternalResponseType.ExceedPermittedSizeOfVideoStory, NotifType.Warning);

      return false;
    }
    if (width > 1920) {
      internalNotify(InternalResponseType.ExceedPermittedWidthOfVideo, NotifType.Warning);

      return false;
    }

    return true;
  }, []);
  function handleSaveAutoReply(sendAutoReply: IMediaUpdateAutoReply) {
    // setCreateAutoReply(sendAutoReply);
    setAutoReply({
      automaticType: sendAutoReply.automaticType,
      items: sendAutoReply.keys.map((x) => ({ id: "", sendCount: 0, text: x })),
      response: sendAutoReply.response,
      sendPr: sendAutoReply.sendPr,
      shouldFollower: sendAutoReply.shouldFollower,
      mediaId: "",
      pauseTime: Date.now(),
      productType: MediaProductType.Feed,
      prompt: null,
      promptId: sendAutoReply.promptId,
      masterFlow: null,
      masterFlowId: sendAutoReply.masterFlowId,
      sendCount: 0,
      replySuccessfullyDirected: sendAutoReply.replySuccessfullyDirected,
    });
    setShowQuickReplyPopup(false);
  }
  // Authentication check
  useEffect(() => {
    if (session === null || (session && !LoginStatus(session))) {
      router.push("/");
    }
  }, [session, router]);

  // Data fetching
  useEffect(() => {
    if (!isDataLoaded && session && LoginStatus(session) && router.isReady) {
      if (query.draftId !== undefined) {
        handleGetDraftStory(query.draftId as string);
      } else if (query.preStoryId !== undefined) {
        handleGetPreStory(query.preStoryId as string);
      }
      GetNextBestTimes();
      getPublishLimitContent();
      setIsDataLoaded(true);
    }
  }, [
    session,
    router.isReady,
    query.draftId,
    query.preStoryId,
    isDataLoaded,
    GetNextBestTimes,
    handleGetDraftStory,
    handleGetPreStory,
    getPublishLimitContent,
  ]);

  if (session?.user.currentIndex === -1) router.push("/user");
  if (session && !packageStatus(session)) router.push("/upgrade");
  return (
    session &&
    session.user.currentIndex !== -1 &&
    query.newschedulestory && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="theme-color" content="#2977ff"></meta>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>{`Bran.cy ▸ Create Story #${tempId}`}</title>
          {/* Primary meta tags */}
          <meta
            name="description"
            content="Professional Instagram story creator and scheduler with advanced media management tools"
          />
          <meta
            name="keywords"
            content="instagram story creator, story scheduler, social media management, Brancy, hashtag manager, instagram tools"
          />
          {/* OpenGraph meta tags */}
          <meta property="og:title" content={`Bran.cy - Create story #${tempId}`} />
          <meta property="og:description" content="Professional Instagram story creator and scheduler" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.brancy.app/page/posts" />
          {/* Twitter meta tags */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Bran.cy story Creator" />
          <meta name="twitter:description" content="Create and schedule Instagram stories professionally" />
          {/* Other meta tags */}
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.brancy.app/page/stories" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        {/* head for SEO */}
        <main className="fullScreenPupup_bg">
          <div className="fullScreenPupup_header">
            <div className={styles.titlecontainer} title={`ℹ️ Story no. ${tempId}`}>
              {t(LanguageKey.CreateNewStrory)} <span style={{ fontSize: "--font-12" }}>({tempId})</span>
            </div>

            <div className={styles.titleCard}>
              {draftId > 0 || preStoryId ? (
                <div title="ℹ️ Delete" onClick={handleShowDeleteDraft} className={styles.headerIconcontainer}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="var(--text-h1)" viewBox="0 0 36 36">
                    <path
                      opacity=".4"
                      d="M29.4 23.5 29 28a7 7 0 0 1-1.1 3 7 7 0 0 1-2.2 2.1q-1.3.8-3.1 1h-9.2a7 7 0 0 1-3.2-1 7 7 0 0 1-2-2A7 7 0 0 1 7 28l-.4-4.5L5.6 7h24.8z"
                    />
                    <path
                      fillRule="evenodd"
                      d="M14.3 27a1 1 0 0 1-1.2-1.2v-9a1.1 1.1 0 0 1 2.3 0v9q0 1-1.2 1.1m7.6-11.2q1 .1 1 1.1v9a1.1 1.1 0 0 1-2.2 0v-9a1 1 0 0 1 1.1-1.1M20 1.9a5 5 0 0 1 2.3.9q.8.6 1.2 1.3l.9 1.7.6 1.3h6.5a1.5 1.5 0 0 1 0 3h-27a1.5 1.5 0 1 1 0-3h6.6l.6-1.1.8-1.8q.4-.8 1.2-1.4 1-.8 2.3-.9zm-5.6 5.2h7.3l-.8-1.4a1.4 1.4 0 0 0-1.2-.8h-3.4q-.8 0-1.2.8z"
                    />
                  </svg>
                </div>
              ) : (
                <></>
              )}
              <div title="ℹ️ Close" onClick={handleShowDraft} className={styles.headerIconcontainer}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 170 180">
                  <path
                    d="m100 85 66-67c2-2 3-5 3-8 0-5-5-10-10-10a10 10 0 0 0-8 3L84 70 18 3a10 10 0 0 0-8-3A10 10 0 0 0 0 10c0 3 1 6 3 8l67 67-4 3-63 65a10 10 0 0 0 7 17c3 0 6-1 8-3l12-13 54-54 67 67c4 5 10 5 15 0 4-4 4-10 0-15L99 85z"
                    fill="var(--text-h1)"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="fullScreenPupup_content">
            {!RoleAccess(session, PartnerRole.PageView) && <NotAllowed />}
            {!session.user.publishPermission && <NotPermission permissionType={PermissionType.Content} />}
            {RoleAccess(session, PartnerRole.PageView) && session.user.publishPermission && (
              <>
                <div className={`${styles.container} ${loadingUpload && "fadeDiv"}`}>
                  <div className={styles.cardPost}>
                    {!showMedias && (
                      <div
                        title="ℹ️ Click for add media"
                        className={`${styles.picturenopost} ${isDragging ? styles.dragover : ""}`}
                        onClick={handleUploadImage}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                          if (preStoryId > 0) return;

                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            const file = files[0];
                            // Check if file is image or video
                            if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                              // Create a synthetic event to pass to handleSelectAlbumMedia
                              const syntheticEvent = {
                                target: { files: [file] },
                                currentTarget: { files: [file] },
                              } as any;
                              handleSelectAlbumMedia(syntheticEvent);
                            }
                          }
                        }}>
                        <input
                          id="AddMedia"
                          type="file"
                          accept="image/* ,video/* "
                          onChange={handleSelectAlbumMedia}
                          ref={inputRef}
                          style={{ display: "none" }}
                        />
                        {!loadingUpload ? (
                          <>
                            <img style={{ width: "80px" }} alt="Add new media button" src="/icon-plus2.svg" />

                            <div className="explain" style={{ textAlign: "center" }}>
                              {t(LanguageKey.supportedformat)}
                              <br />
                              <strong>Video (MP4), Image (JPG)</strong>
                              <br />
                              <br />
                              {t(LanguageKey.limitsize)}
                              <br />
                              8MB per image
                              <br />
                              100MB per video
                              <br />
                              <br />
                              <strong>Aspect Ratio 9/16</strong>
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                position: "relative",
                                width: "120px",
                                height: "120px",
                              }}>
                              <svg
                                style={{ transform: "rotate(-90deg)" }}
                                width="120"
                                height="120"
                                viewBox="0 0 120 120">
                                {/* Background circle */}
                                <circle
                                  cx="60"
                                  cy="60"
                                  r="50"
                                  fill="none"
                                  stroke="var(--content-box)"
                                  strokeWidth="8"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="60"
                                  cy="60"
                                  r="50"
                                  fill="none"
                                  stroke="var(--color-dark-blue)"
                                  strokeWidth="8"
                                  strokeDasharray={`${2 * Math.PI * 50}`}
                                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                                  strokeLinecap="round"
                                  style={{
                                    transition: "stroke-dashoffset 0.3s ease",
                                  }}
                                />
                              </svg>
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  fontSize: "24px",
                                  fontWeight: "bold",
                                  color: "var(--color-dark-blue)",
                                }}>
                                {Math.round(progress)}%
                              </div>
                            </div>
                            <div
                              className="explain"
                              style={{
                                textAlign: "center",
                                marginTop: "20px",
                              }}>
                              {t(LanguageKey.loading) || "Uploading..."}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {showMedias && (
                      <>
                        {showMedias.mediaType == MediaType.Image ||
                        showMedias.coverUri ||
                        showMedias.cover.length != 0 ? (
                          <img
                            className={styles.pictureMaskIcon}
                            alt="added media"
                            src={
                              showMedias.mediaType == MediaType.Image
                                ? showMedias.mediaUri ?? showMedias.media
                                : showMedias.coverUri ?? showMedias.cover
                            }
                          />
                        ) : (
                          <video className={styles.pictureMaskIcon} src={showMedias.media} />
                        )}
                        <div className={styles.filter} />
                      </>
                    )}
                    {automaticPost && (
                      <div className={styles.postdetail}>
                        <div className={styles.postTimer}>
                          <ConstantCounterDown
                            unixTime={dateAndTime}
                            // classNameSvg="var(--color-ffffff)"
                            // classNameTime="timeValue"
                            //  clssNameTitle="timeTitle"
                            colorSvg="var(--color-ffffff)"
                            colorTimeTitle="var(--color-ffffff)"
                            classNamewrapper={"countdownWrapperWinnerPicker"}
                          />
                          {/* <div className={styles.div}>[ 0 / {totalPrePostCount + 1} ]</div> */}
                        </div>
                      </div>
                    )}
                    <div className={`${styles.optionCard} ${preStoryId > 0 && "fadeDiv"}`}>
                      <div className={showMedias ? styles.cardPostChild : styles.disableCardPostChild}>
                        <div
                          title="ℹ️ Delete this media"
                          onClick={() => {
                            if (preStoryId > 0) return;
                            setShowMedias(null);
                          }}
                          className={styles.postoption}>
                          <img className={styles.postoptionicon} alt="Delete media button" src="/delete.svg" />
                          <div className={styles.postoptionicontext}>{t(LanguageKey.delete)}</div>
                        </div>
                        <div
                          title="ℹ️ replace this media"
                          onClick={handleUploadRepalceMedia}
                          className={styles.postoption}>
                          <input
                            type="file"
                            accept="image/* ,video/* "
                            onChange={handleReplaceMedia}
                            ref={inputReplaceRef}
                            style={{ display: "none" }}
                          />
                          <img className={styles.postoptionicon} alt="Replace media button" src="/replace.svg" />
                          <div className={styles.postoptionicontext}>{t(LanguageKey.replace)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.container}>
                  <div className={styles.Section}>
                    <div className="title">{t(LanguageKey.AdvanceSettings)}</div>
                    <div className="headerandinput">
                      <div className="headerparent" role="group" aria-label="Product settings">
                        <div className="title2" role="heading" aria-level={3}>
                          {t(LanguageKey.autocommentReply)}

                          <div className="explain" role="note">
                            ({t(LanguageKey.new)})
                          </div>
                        </div>
                        <ToggleCheckBoxButton
                          name="quick-reply"
                          handleToggle={() => {
                            if (preStoryId > 0) return;
                            setQuickReply(!QuickReply);
                          }}
                          checked={QuickReply}
                          title="Toggle quick reply"
                          role="switch"
                          aria-checked={QuickReply}
                          aria-label="Quick reply toggle"
                        />
                      </div>
                      <div className="explain">{t(LanguageKey.QuickReplyexplain)}</div>
                      <button
                        className={`cancelButton ${QuickReply ? "" : "fadeDiv"}`}
                        onClick={() => {
                          if (QuickReply) {
                            setShowQuickReplyPopup(true);
                          }
                        }}
                        disabled={!QuickReply}>
                        {t(LanguageKey.marketstatisticsfeatures)}
                      </button>
                    </div>
                  </div>
                  <div className={styles.Section}>
                    {/* Set Scheduled story Section */}
                    <div className="headerandinput" role="region">
                      <div className="headerparent" role="group" aria-label="Schedule settings">
                        <div className="title2" role="heading" aria-level={3}>
                          {t(LanguageKey.pageStory_ScheduledStories)}
                          <div className="counter" role="note">
                            (max 30)
                          </div>
                        </div>

                        <ToggleCheckBoxButton
                          name="automatic-post"
                          handleToggle={() => {
                            if (preStoryId > 0) return;
                            let value = !automaticPost;
                            setRecTimeSelect(-1);
                            setAutomaticPost(value);
                          }}
                          checked={automaticPost}
                          title="Toggle scheduled posting"
                          role="switch"
                          aria-checked={automaticPost}
                          aria-label="Set scheduled post toggle"
                        />
                      </div>
                      <div className="explain">{t(LanguageKey.SetScheduledStoryexplain)}</div>
                    </div>
                    <div
                      className={automaticPost ? styles.dateTime : styles.disableDateTime}
                      role="group"
                      aria-label="Date and time selection">
                      <div className={styles.input} style={{ width: "35%" }} role="presentation">
                        <div className={styles.instagramer} role="textbox" aria-label="Selected date">
                          <span>
                            {new DateObject({
                              date: dateAndTime,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("MM/DD/YYYY")}
                          </span>
                        </div>
                      </div>
                      <div className={styles.input} style={{ width: "20%" }} role="presentation">
                        <div className={styles.instagramer} role="textbox" aria-label="Selected time">
                          {new DateObject({
                            date: dateAndTime,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("hh:mm")}
                        </div>
                      </div>
                      <div className={styles.input} style={{ width: "20%" }} role="presentation">
                        <div className={styles.instagramer} role="textbox" aria-label="AM/PM indicator">
                          {new DateObject({
                            date: dateAndTime,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("A")}
                        </div>
                      </div>
                      {preStoryId < 0 && (
                        <div
                          onClick={() => setShowSetDateAndTime(true)}
                          className="saveButton"
                          role="button"
                          aria-label="Open date and time picker"
                          title="Select date and time"
                          style={{
                            position: "relative",
                            height: "40px",
                            width: "40px",
                            maxWidth: "40px",
                            minWidth: "40px",
                            maxHeight: "40px",
                            minHeight: "40px",
                            borderRadius: "var(--br10)",
                            padding: "var(--padding-10)",
                          }}>
                          <img
                            className={styles.Calendaricon}
                            alt="Calendar icon for date/time selection"
                            src="/selectDate-item.svg"
                            width="15"
                            height="15"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {preStoryId < 0 && (
                    <div className={styles.Section}>
                      {recommendedTime.length > 0 && (
                        <div
                          className={`${styles.setting} ${!automaticPost && "fadeDiv"}`}
                          role="region"
                          aria-label="Recommended posting times">
                          <div className="headerandinput">
                            <div className="title" role="heading" aria-level={3}>
                              {t(LanguageKey.RecommendedDateTime)}
                            </div>
                            <div className="explain" role="note">
                              {t(LanguageKey.RecommendedDateTimeexplain)}
                            </div>
                          </div>
                          <div
                            className={`${styles.timeButtonsparent} translate`}
                            role="group"
                            aria-label="Recommended time slots">
                            {recommendedTime.slice(0, 4).map(
                              (time, index) =>
                                time && (
                                  <div
                                    key={`time-${index}`}
                                    onClick={() => {
                                      setRecTimeSelect(index);
                                      setDateAndTime(time * 1000);
                                    }}
                                    className={styles.timeButtons}
                                    role="button"
                                    aria-pressed={recTimeSelect === index}
                                    title={`Select recommended time slot ${index + 1}`}>
                                    <div className={recTimeSelect === index ? styles.selectedTime : styles.time}>
                                      {[
                                        new DateObject({
                                          date: time * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("YYYY/MM/DD"),
                                        new DateObject({
                                          date: time * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("hh:mm A"),
                                      ].join(" | ")}
                                    </div>
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {preStoryId < 0 && (
                    <>
                      {showMedias ? (
                        <>
                          {!analizeProcessing && (
                            <div
                              style={{ marginBottom: "30px" }}
                              className="saveButton"
                              onClick={() => {
                                HandleUpload(false);
                                router.push("/page/stories");
                              }}
                              role="button"
                              aria-label="Publish post"
                              title="Click to publish post">
                              {t(LanguageKey.publish)}
                            </div>
                          )}
                          {analizeProcessing && (
                            <ProgressBar
                              width={progress}
                              role="progressbar"
                              aria-valuenow={progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="Upload progress"
                            />
                          )}
                        </>
                      ) : (
                        <div
                          className="saveButton"
                          style={{
                            marginBottom: "30px",
                            pointerEvents: "none",
                            opacity: "0.3",
                          }}
                          role="button"
                          aria-disabled="true"
                          aria-label="Publish button (disabled)"
                          title="Add media to enable publishing">
                          {t(LanguageKey.publish)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showSetDateAndTime}>
          <SetTimeAndDate
            removeMask={removeMask}
            saveDateAndTime={saveDateAndTime}
            backToNormalPicker={removeMask}
            startDay={dateAndTime}
            fromUnix={activeLimitTime ? Date.now() + 90000000 : undefined}
          />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popupSendFile"} showContent={showDraft}>
          <SaveDraft
            removeMask={removeMask}
            saveDraft={async () => HandleUpload(true)}
            cancelDraft={() => router.push("/page/stories")}
          />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popupSendFile"} showContent={showDeleteDraft}>
          <DeleteDraft
            removeMask={removeMask}
            deleteDraft={() => HandleDelete()}
            cancelDraft={() => router.push("/page/stories")}
          />
        </Modal>
        <Modal
          closePopup={() => setShowQuickReplyPopup(false)}
          classNamePopup={"popup"}
          showContent={showQuickReplyPopup}>
          <QuickStoryReplyPopup
            setShowQuickReplyPopup={setShowQuickReplyPopup}
            handleSaveAutoReply={handleSaveAutoReply}
            handleActiveAutoReply={(e) => {
              if (preStoryId > 0) return;
            }}
            autoReply={autoReply}
          />
        </Modal>
        <Modal closePopup={() => setshowDraftError(null)} classNamePopup={"popupSendFile"} showContent={false}>
          <ErrorDraft data={showDraftError!} removeMask={removeMask} />
        </Modal>
        <Modal
          closePopup={() => setShowDeletePreStory(false)}
          classNamePopup={"popupSendFile"}
          showContent={showDeletePreStory}>
          <DeletePrePost removeMask={() => setShowDeletePreStory(false)} deletePrePost={handleDeletePreStory} />
        </Modal>
      </>
    )
  );
};

export default CreateStory;
