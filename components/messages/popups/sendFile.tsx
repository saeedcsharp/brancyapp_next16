import Compressor from "compressorjs";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { ItemType, MediaType } from "brancy/models/messages/enum";
import { IIsSendingMessage } from "brancy/models/messages/IMessage";
import styles from "./sendFile.module.css";

function _arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
function getDimintion(array: string, fnc: (width: number, height: number) => void) {
  const img = new Image();
  img.onload = function () {
    fnc(img.width, img.height);
  };
  img.src = array;
}
const SendFile = (props: {
  removeMask: () => void;
  data: { file: File; threadId: string; igid: string };
  send: (sendImage: IIsSendingMessage) => void;
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [imageSiz, setImageSize] = useState<number>(0);
  const [dimintion, setDimintion] = useState<{
    width: number;
    height: number;
  }>({ height: 0, width: 0 });
  const [baseString, setBaseString] = useState("");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  // const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
  //   const lines = e.target.value.split("\n");
  //   if (lines.length > 6) {
  //     e.target.value = lines.slice(0, 7).join("\n");
  //   }
  //   setTextArea(e.target.value);
  //   setcharCount(e.target.value.length);
  // };
  const compressAndUpload = async (file: File) => {
    try {
      setLoading(true);
      const compressedFile: File = await new Promise((resolve, reject) => {
        // @ts-ignore compressor types
        new Compressor(file, {
          quality: 0.95,
          maxWidth: 700,
          maxHeight: 700,
          mimeType: "image/jpeg",
          success(result: Blob) {
            const outFile = new File([result], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(outFile);
          },
          error(err: any) {
            reject(err);
          },
        });
      });

      // create base64 for preview
      const reader = new FileReader();
      const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(compressedFile);
      });
      const arrayToString = _arrayBufferToBase64(arrayBuffer);
      setBaseString(arrayToString);
      setSelectedImage("data:image/jpeg;base64," + arrayToString);
      getDimintion("data:image/jpeg;base64," + arrayToString, (width, height) => {
        setDimintion({ width: width, height: height });
      });
      setImageSize(compressedFile.size);

      // save compressed file to state — upload will happen when user clicks Send
      setCompressedFile(compressedFile);
    } catch (err) {
      console.error("compressAndUpload error:", err);
    } finally {
      setLoading(false);
    }
  };
  const calculateSummary = (num: number): string => {
    let summary: string = "";
    if (num >= 1000000) {
      summary = Math.floor(num / 1000000) + " MB";
    } else if (num >= 1000) {
      summary = Math.floor(num / 1000) + " KB";
    } else {
      summary = num.toString();
    }
    return summary;
  };
  const handleSendImage = () => {
    (async () => {
      if (!(selectedImage && dimintion && dimintion.width > 0 && compressedFile)) return;
      setLoading(true);
      try {
        // upload with progress using XMLHttpRequest
        const id = await new Promise<any | null>((resolve) => {
          const xhr = new XMLHttpRequest();
          const url = "https://uupload.brancy.app/file";
          const fd = new FormData();
          fd.append("file", compressedFile as File);
          xhr.open("POST", url, true);
          xhr.setRequestHeader("Authorization", session?.user?.accessToken ?? "");
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const p = Math.round((ev.loaded * 100) / ev.total);
              setProgress(p);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else {
              resolve(null);
            }
          };
          xhr.onerror = () => resolve(null);
          xhr.send(fd);
        });
        if (!id) {
          console.error("Upload failed");
          setLoading(false);
          setProgress(0);
          return;
        }
        setUploadId(id.fileName);
        console.log("handleSendImage upload success:", id);
        const obj = JSON.parse(id);
        const sendImage: IIsSendingMessage = {
          imageBase64: obj.showUrl,
          imageUrl: obj.fileName,
          file: compressedFile as File,
          igId: props.data.igid,
          itemType: ItemType.Media,
          mediaType: MediaType.Image,
          threadId: props.data.threadId,
          message: "",
        };
        props.send(sendImage);
        props.removeMask();
      } catch (err) {
        console.error("handleSendImage upload error:", err);
      } finally {
        setLoading(false);
        setProgress(0);
      }
    })();
  };
  useEffect(() => {
    // show an immediate preview from the original file while compression runs
    try {
      const url = URL.createObjectURL(props.data.file);
      // revoke previous object URL if any
      if (objectPreviewUrl) URL.revokeObjectURL(objectPreviewUrl);
      setObjectPreviewUrl(url);
      setSelectedImage(url);
      setImageName(props.data.file.name);
      setImageSize(props.data.file.size);
    } catch (e) {
      // ignore
    }

    compressAndUpload(props.data.file);

    return () => {
      // cleanup object URL when component unmounts or file changes
      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
        setObjectPreviewUrl(null);
      }
    };
  }, [props.data.file]);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.upload)}</title>
        <meta name="description" content="Share and send files securely through Brancy messaging" />
        <meta name="theme-color" />
        <meta name="keywords" content="file sharing, messaging, upload, send files, images, Brancy" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.brancy.app/messages" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <>
        <div className={styles.file} role="figure" aria-label="File preview">
          <img
            className={styles.image}
            alt="File preview image"
            src={selectedImage ? selectedImage : ""}
            loading="lazy"
            decoding="async"
            title="Preview of file to be sent"
          />
          <div className="headerandinput" role="contentinfo">
            <div className={styles.name} title={props.data.file.name}>
              {props.data.file.name}
            </div>
            <div
              className={styles.size}
              aria-label={
                compressedFile
                  ? `Compressed size: ${calculateSummary(imageSiz)}, dimensions: ${dimintion.width}x${dimintion.height}`
                  : `File size: ${calculateSummary(props.data.file.size)}`
              }>
              {compressedFile ? (
                <>
                  {calculateSummary(imageSiz)} · {dimintion.width}x{dimintion.height}
                </>
              ) : (
                <>File size: {calculateSummary(props.data.file.size)}</>
              )}
            </div>
          </div>
        </div>
        {/* <div className={styles.discription}>
          <div className={styles.title1}>description</div>
          <textarea
            value={textArea}
            className={styles.textarea}
            onChange={handleChangeTextArea}
          />
        </div> */}
        <div className="ButtonContainer" role="group" aria-label="Action buttons">
          {!loading && (
            <button
              onClick={props.removeMask}
              className="cancelButton"
              type="button"
              title={t(LanguageKey.cancel)}
              aria-label={t(LanguageKey.cancel)}>
              {t(LanguageKey.cancel)}
            </button>
          )}

          {/* show loader while uploading */}
          {/* {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RingLoader />
              <div aria-live="polite">{t(LanguageKey.upload)}</div>
            </div>
          )} */}

          {/* progress bar */}
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
          {!loading && (
            <button
              onClick={handleSendImage}
              className={
                !selectedImage || dimintion.width === 0 || loading || !compressedFile ? "disableButton" : "saveButton"
              }
              type="button"
              title={t(LanguageKey.SettingGeneral_Send)}
              aria-label={t(LanguageKey.SettingGeneral_Send)}
              disabled={!selectedImage || dimintion.width === 0 || loading || !compressedFile}>
              {loading ? t(LanguageKey.upload) : t(LanguageKey.send)}
            </button>
          )}
        </div>
      </>
    </>
  );
};

export default SendFile;
