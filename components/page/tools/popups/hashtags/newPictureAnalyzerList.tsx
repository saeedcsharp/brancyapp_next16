import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProgressBar from "saeed/components/design/progressBar/progressBar";
import { convertHeicToJpeg } from "saeed/helper/convertHeicToJPEG";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import styles from "./newPictureAnalyzerList.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

interface IHashtagPicture {
  media: string;
}

const NewPictureAnalyzerList = (props: {
  data: { id: number; hashtags: string[] | null };
  removeMask: () => void;
  saveHashtagAnalyzer: () => void;
}) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const [inputAnalyzerTitle, setInputAnalyzerTitle] = useState("");
  const [hashtags, setHashtags] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analizeProcessing, setAnalizeProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file) {
      // You can display a preview of the selected image if needed.
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        handelStartAnalysis(); // Automatically start the analysis after loading the image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const toBase64 = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handelStartAnalysis = async () => {
    if (inputRef.current?.files?.length) {
      setAnalizeProcessing(true);
      const file = inputRef.current.files[0];
      console.log(file);
      const formData = new FormData();
      formData.append("image", file);

      try {
        // Replace the URL with your server's API endpoint for image upload.
        let info: IHashtagPicture = {
          media: (await toBase64(file)) as string,
        };
        const serverResult = await clientFetchApi<IHashtagPicture, string[]>("/api/hashtag/GetHashtagsByImage", { methodType: MethodType.post, session: session, data: info, queries: [], onUploadProgress: setProgress });
        if (serverResult.statusCode == 200) {
          console.log("Image uploaded successfully");
          setHashtags(serverResult.value);
          // Clear the selected image and input field.
          setSelectedImage(null);
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        } else {
          console.log("Image failed:" + serverResult.info.message);
        }
        setAnalizeProcessing(false);
      } catch (error) {
        // Handle network or other errors here.
        console.error("Image upload failed:", error);
        setAnalizeProcessing(false);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputAnalyzerTitle(e.target.value);
  };

  return (
    <>
      <div className={styles.newHashtagListContainer}>
        <div className="headerandinput">
          <div className="title">{t(LanguageKey.pageTools_pictureanAnalyzer)}</div>

          <div className={styles.uploadsection}>
            <div onClick={handleUploadImage} className={styles.newPicture}>
              <img className={styles.iconPlusContainer} src="/icon-plus.svg" />
              <div className={styles.newPictureTitleContainer}>{t(LanguageKey.upload)}</div>
              <input
                type="file"
                accept="image/* "
                onChange={handleImageChange}
                ref={inputRef}
                style={{ display: "none" }}
              />
              {selectedImage && (
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.imageContainer}
                  src={selectedImage}
                  alt="Selected"
                />
              )}
            </div>
            {analizeProcessing ? <ProgressBar width={progress} /> : null}
          </div>
        </div>

        {/* <div className="headerandinput">
            <div className="headertext">
              {t(LanguageKey.pageToolspopup_Listname)}
            </div>

            <InputText
              className="textinputbox"
              handleInputChange={handleInputChange}
              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
              value={inputAnalyzerTitle}
              maxLength={undefined}
              name=""
            />
          </div> */}

        <div className="headerandinput">
          <div className="headerparent">
            <div className="headertext">{t(LanguageKey.pageTools_hashtags)}</div>
            <div className="counter">
              ( <strong>{hashtags?.length ?? "0"}</strong> / <strong>200</strong> )
            </div>
          </div>
          <div className={styles.hashtagListItem}>
            {hashtags?.map((v, i) => (
              <div key={i} className={styles.tagHashtag}>
                <img className={styles.component9431} alt="hashtag" src={"/icon-hashtag.svg"} />
                {v}
              </div>
            ))}
          </div>
        </div>

        <div className="ButtonContainer">
          <button onClick={props.removeMask} className="cancelButton">
            {t(LanguageKey.cancel)}
          </button>

          {hashtags && hashtags.length > 0 && (
            <button onClick={props.saveHashtagAnalyzer} className="saveButton">
              {t(LanguageKey.save)}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NewPictureAnalyzerList;
