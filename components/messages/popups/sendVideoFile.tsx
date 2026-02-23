import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { ItemType, MediaType } from "brancy/models/messages/enum";
import { IIsSendingMessage } from "brancy/models/messages/IMessage";
import styles from "brancy/components/messages/popups/sendFile.module.css";

function _arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
const SendVideoFile = (props: {
  removeMask: () => void;
  data: { file: File; threadId: string; igid: string };
  send: (sendٰVideo: IIsSendingMessage) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [baseString, setBaseString] = useState("");
  const [isHugeFile, setIsHugeFile] = useState<boolean>(false);
  const { t } = useTranslation();
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
    duration: number;
  } | null>(null);
  const { data: session } = useSession();
  const [preparedFile, setPreparedFile] = useState<File | null>(null);
  const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const compressAndUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      var arrayToString = _arrayBufferToBase64(reader.result as ArrayBuffer);
      console.log(arrayToString);
      setBaseString(arrayToString);
      // keep showing object URL preview already set; set base64 for sending
      setSelectedImage("data:video/mp4;base64," + arrayToString);
      // store prepared file for upload on send
      setPreparedFile(file);
    };
    reader.readAsArrayBuffer(file);
  };
  const calculateSummary = (num: number): string => {
    let summary: string = "";
    if (num >= 1000000) {
      summary = Math.floor(num / 1000000) + "M";
    } else if (num >= 1000) {
      summary = Math.floor(num / 1000) + "K";
    } else {
      summary = num.toString();
    }
    return summary;
  };
  const handleSendVideo = () => {
    (async () => {
      if (!(selectedImage && videoDimensions && preparedFile)) return;
      setLoading(true);
      try {
        const id = await new Promise<any | null>((resolve) => {
          const xhr = new XMLHttpRequest();
          const url = "https://uupload.brancy.app/file";
          const fd = new FormData();
          fd.append("file", preparedFile as File);
          xhr.open("POST", url, true);
          xhr.setRequestHeader("Authorization", session?.user?.accessToken ?? "");
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const p = Math.round((ev.loaded * 100) / ev.total);
              setProgress(p);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else resolve(null);
          };
          xhr.onerror = () => resolve(null);
          xhr.send(fd);
        });
        if (!id) {
          console.error("video upload failed");
          setLoading(false);
          setProgress(0);
          return;
        }
        const obj = JSON.parse(id);
        console.log("handleSendVideo upload success:", obj);
        const sendVideo: IIsSendingMessage = {
          imageBase64: obj.showUrl,
          imageUrl: obj.fileName,
          file: props.data.file,
          igId: props.data.igid,
          itemType: ItemType.Media,
          mediaType: MediaType.Video,
          threadId: props.data.threadId,
          message: "",
        };
        props.send(sendVideo);
        props.removeMask();
      } catch (err) {
        console.error("handleSendVideo upload error:", err);
      } finally {
        setLoading(false);
        setProgress(0);
      }
    })();
  };
  useEffect(() => {
    if (props.data.file.size > 26000000) {
      setIsHugeFile(true);
      return;
    }

    // create immediate object URL preview
    try {
      const url = URL.createObjectURL(props.data.file);
      if (objectPreviewUrl) URL.revokeObjectURL(objectPreviewUrl);
      setObjectPreviewUrl(url);
      setSelectedImage(url);
    } catch (e) {
      // ignore
    }

    // prepare base64 and prepared file
    compressAndUpload(props.data.file);

    const video = videoRef.current;
    const updateVideoDimensions = () => {
      if (video) {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration * 1e1,
        });
        console.log("setVideoDimensions ", video.duration);
      }
    };
    if (video) {
      video.addEventListener("loadedmetadata", updateVideoDimensions);
      window.addEventListener("resize", updateVideoDimensions);
    }
    return () => {
      if (video) video.removeEventListener("loadedmetadata", updateVideoDimensions);
      window.removeEventListener("resize", updateVideoDimensions);
      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
        setObjectPreviewUrl(null);
      }
    };
  }, []);
  return (
    <>
      <>
        {!isHugeFile && (
          <div className={styles.file}>
            <video ref={videoRef} className={styles.image} src={selectedImage ? selectedImage : ""}></video>
            <div className={styles.detail}>
              <div className={styles.name}>{props.data.file.name}</div>
              <div className={styles.size}>
                {preparedFile ? calculateSummary(preparedFile.size) : calculateSummary(props.data.file.size)}
              </div>
            </div>
          </div>
        )}
        {isHugeFile && (
          <div className={styles.discription}>
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 99">
              <g clip-path="url(#a)">
                <path
                  d="M46 91h91q.8 0 1.5-.2l1.5.2h52a7 7 0 1 0 0-14h-6a7 7 0 1 1 0-14h19a7 7 0 1 0 0-14h-22a7 7 0 1 0 0-14h-64a7 7 0 1 0 0-14H62a7 7 0 1 0 0 14H22a7 7 0 1 0 0 14h25a7 7 0 1 1 0 14H7a7 7 0 1 0 0 14h39a7 7 0 1 0 0 14m163 0a7 7 0 1 0 0-14 7 7 0 0 0 0 14"
                  fill="var(--color-dark-blue)"
                  fillOpacity=".3"
                />
                <path
                  d="M141 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="var(--color-dark-blue)"
                  strokeOpacity=".6"
                  strokeWidth="2"
                />
                <path
                  d="M75 97c-12.2 0-22-9.6-22-21.5a22 22 0 0 1 23.5-21.4q-.5-3-.5-6.1a34 34 0 0 1 66.2-10.8l3.3-.2A30.3 30.3 0 0 1 176 67a30.3 30.3 0 0 1-28 30z"
                  fill="var(--background-root)"
                />
                <path
                  d="M87 97h-7m-5 0c-12.2 0-22-9.6-22-21.5a22 22 0 0 1 23.5-21.4q-.5-3-.5-6.1a34 34 0 0 1 66.2-10.8l3.3-.2A30.3 30.3 0 0 1 176 67a30.3 30.3 0 0 1-28 30z"
                  stroke="var(--color-dark-blue)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M148.8 14.8 157 23m.1-8.3L149 23"
                  stroke="var(--color-dark-blue)"
                  strokeOpacity=".6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M173.8 21.8a2.5 2.5 0 1 1-3.6-3.6 2.5 2.5 0 0 1 3.6 3.6Zm-104 3a2.5 2.5 0 1 1-3.6-3.6 2.5 2.5 0 0 1 3.6 3.6Z"
                  stroke="var(--color-dark-blue)"
                  strokeOpacity=".6"
                />
                <path
                  d="M120 24a19 19 0 0 1 13.4 13.3"
                  stroke="var(--color-light-blue)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="m54.4 32.6 6 6m0-6-6 6"
                  stroke="var(--color-dark-blue)"
                  strokeOpacity=".6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m95 66 7-5.5-7-5.2M126 66l-7-5.5 7-5.2"
                  stroke="var(--color-dark-blue)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M110.5 83a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
                  stroke="var(--color-dark-blue)"
                  strokeWidth="2.5"
                />
              </g>
              <defs></defs>
            </svg>
            File size is more than 24MB
          </div>
        )}

        <div className="ButtonContainer">
          {!loading && (
            <button onClick={props.removeMask} className="cancelButton">
              {t(LanguageKey.cancel)}
            </button>
          )}

          {/* {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RingLoader />
              <div aria-live="polite">{t(LanguageKey.upload)}</div>
            </div>
          )} */}
          {progress > 0 && (
            <div
              style={{
                width: 200,
                height: 8,
                background: "var(--color-gray10)",
                borderRadius: 4,
                overflow: "hidden",
                marginLeft: 8,
              }}
              aria-hidden>
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "var(--color-dark-blue)",
                  transition: "width 150ms linear",
                }}
              />
            </div>
          )}
          {!isHugeFile && !loading && (
            <button
              onClick={handleSendVideo}
              className={
                !selectedImage || !videoDimensions || loading || !preparedFile ? "disableButton" : "saveButton"
              }
              disabled={!selectedImage || !videoDimensions || loading || !preparedFile}>
              {loading ? t(LanguageKey.upload) : t(LanguageKey.save)}
            </button>
          )}
        </div>
      </>
    </>
  );
};

export default SendVideoFile;
