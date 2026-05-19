import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import RadioButton from "brancy/components/design/radioButton";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { AiTextModel, AiVoiceModel } from "brancy/models/setting/enums";
import { IAiModels, IGeneralAiModels } from "brancy/models/setting/general";
import styles from "./general.module.css";
import { Language } from "brancy/models/messages/enum";
import { LanguageKey } from "brancy/i18n";
import { useTranslation } from "react-i18next";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Loading from "brancy/components/notOk/loading";

function AiModels() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [aiModels, setAiModels] = useState<IAiModels>({
    texModels: [],
    voiceModels: [],
  });

  const [selectedTextModel, setSelectedTextModel] = useState<AiTextModel>(AiTextModel.Chatgpt4oMini);
  const [selectedVoiceModel, setSelectedVoiceModel] = useState<AiVoiceModel>(AiVoiceModel.ChatgptWhisper1);
  const [isDirectVoiceSupport, setIsDirectVoiceSupport] = useState(false);

  const handleCircleClick = () => {
    setIsHidden((prev) => !prev);
  };

  async function fetchAiModels() {
    try {
      setIsLoading(true);
      const res = await clientFetchApi<boolean, IAiModels>("/api/ai/getAllAiModels", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        const raw = res.value as any;
        console.log("[AiModels] API response keys:", raw ? Object.keys(raw) : raw);

        // case-insensitive key finder
        const findKey = (obj: any, key: string) => {
          if (!obj) return undefined;
          const lower = key.toLowerCase();
          const found = Object.keys(obj).find((k) => k.toLowerCase() === lower);
          return found ? obj[found] : undefined;
        };

        setAiModels({
          texModels: findKey(raw, "texModels") ?? findKey(raw, "textModels") ?? [],
          voiceModels: findKey(raw, "voiceModels") ?? [],
        });
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      const body: IGeneralAiModels = {
        aiTextModel: selectedTextModel,
        aiVoice2TextModel: selectedVoiceModel,
        isDirectVoiceSupport: isDirectVoiceSupport,
      };
      const res = await clientFetchApi<IGeneralAiModels, boolean>("/api/ai/updateModel", {
        methodType: MethodType.post,
        session: session,
        data: body,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    fetchAiModels();
  }, [session]);

  return (
    <div
      className="tooBigCard"
      style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}
      role="region"
      aria-label="AI Models">
      <div
        className="headerChild"
        title="↕ Resize the Card"
        onClick={handleCircleClick}
        role="button"
        aria-expanded={!isHidden}
        aria-label="Toggle AI Models visibility"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCircleClick();
          }
        }}>
        <div className="circle" aria-hidden="true"></div>
        <div className="Title" role="heading" aria-level={2}>
          AI Models
        </div>
      </div>

      <div className={`${styles.all} ${isHidden ? "" : styles.show}`} aria-hidden={isHidden}>
        <div className={styles.content} role="group">
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {/* Text Models */}
              <div className="headerandinput">
                <div className="title" role="heading" aria-level={3}>
                  Text Models
                </div>
                <div className={styles.options} role="radiogroup" aria-label="Text Models">
                  {aiModels.texModels.map((model) => (
                    <div className={styles.radiobtn} key={model.id}>
                      <RadioButton
                        name={`textModel_${model.id}`}
                        id={`textModel_${model.id}`}
                        checked={selectedTextModel === model.id}
                        handleOptionChanged={() => setSelectedTextModel(model.id)}
                        textlabel={model.name}
                        title={model.name}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Models */}
              <div className="headerandinput">
                <div className="title" role="heading" aria-level={3}>
                  Voice Models
                </div>
                <div className={styles.options} role="radiogroup" aria-label="Voice Models">
                  {aiModels.voiceModels.map((model) => (
                    <div className={styles.radiobtn} key={model.id}>
                      <RadioButton
                        name={`voiceModel_${model.id}`}
                        id={`voiceModel_${model.id}`}
                        checked={selectedVoiceModel === model.id}
                        handleOptionChanged={() => setSelectedVoiceModel(model.id)}
                        textlabel={model.name}
                        title={model.name}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Voice Support toggle */}
              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title">Direct Voice Support</div>
                  <ToggleCheckBoxButton
                    handleToggle={(e: ChangeEvent<HTMLInputElement>) => setIsDirectVoiceSupport(e.target.checked)}
                    checked={isDirectVoiceSupport}
                    name="isDirectVoiceSupport"
                    title="Direct Voice Support"
                    role="switch"
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="headerandinput">
                <button className="saveButton" onClick={handleSave} disabled={isSaving} aria-busy={isSaving}>
                  {isSaving ? <RingLoader /> : t(LanguageKey.update)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiModels;
