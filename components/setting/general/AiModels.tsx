import RingLoader from "brancy/components/design/loader/ringLoder";
import RadioButton from "brancy/components/design/radioButton/radioButton";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import NotAllowedCard from "brancy/components/notOk/notAllowedCard";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./general.module.css";
import { AiTextModel, AiVoiceModel, PartnerRole } from "brancy/models/enums";
import { IAiModels, IGetAiModel, IGeneralAiModels } from "brancy/models/interfaces";

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
      const [modelsRes, currentRes] = await Promise.all([
        clientFetchApi<boolean, IAiModels>("/api/ai/getAllAiModels", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IGetAiModel>("/api/ai/getAiModels", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);

      if (modelsRes.succeeded) {
        const raw = modelsRes.value as any;
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
        notify(modelsRes.info.responseType, NotifType.Warning);
      }

      if (currentRes.succeeded) {
        setSelectedTextModel(currentRes.value.aiTextModel);
        setSelectedVoiceModel(currentRes.value.aiVoice2TextModel);
        setIsDirectVoiceSupport(currentRes.value.isDirectVoiceSupport);
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
      } else {
        internalNotify(InternalResponseType.Ok, NotifType.Success);
      }
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    if (!RoleAccess(session, PartnerRole.Automatics)) {
      setIsLoading(false);
      return;
    }
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
          {t(LanguageKey.SettingGeneralAiModelsTitle)}
        </div>
      </div>

      <div className={`${styles.all} ${isHidden ? "" : styles.show}`} aria-hidden={isHidden}>
        <div className={styles.content} role="group">
          {isLoading && <Loading />}
          {!isLoading && RoleAccess(session, PartnerRole.Automatics) && (
            <>
              {/* Text Models */}
              <div className="headerandinput">
                <div className="title" role="heading" aria-level={3}>
                  {t(LanguageKey.SettingGeneralAiModelsTextModels)}
                </div>
                <div
                  role="radiogroup"
                  aria-label="Text Models"
                  style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  {aiModels.texModels.map((model) => (
                    <div className={styles.modelRow} key={model.id}>
                      <RadioButton
                        name={`textModel_${model.id}`}
                        id={`textModel_${model.id}`}
                        checked={selectedTextModel === model.id}
                        handleOptionChanged={() => setSelectedTextModel(model.id)}
                        textlabel={model.name}
                        title={model.name}
                      />
                      <div className={styles.modelBadges}>
                        <span className={styles.modelBadge}>in ×{model.input}</span>
                        <span className={styles.modelBadge}>out ×{model.output}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Models */}
              <div className="headerandinput">
                <div className="title" role="heading" aria-level={3}>
                  {t(LanguageKey.SettingGeneralAiModelsVoiceModels)}
                </div>
                <div
                  role="radiogroup"
                  aria-label="Voice Models"
                  style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  {aiModels.voiceModels.map((model) => (
                    <div className={styles.modelRow} key={model.id}>
                      <RadioButton
                        name={`voiceModel_${model.id}`}
                        id={`voiceModel_${model.id}`}
                        checked={selectedVoiceModel === model.id}
                        handleOptionChanged={() => setSelectedVoiceModel(model.id)}
                        textlabel={model.name}
                        title={model.name}
                      />
                      <div className={styles.modelBadges}>
                        <span className={styles.modelBadge}>in ×{model.input}</span>
                        <span className={styles.modelBadge}>out ×{model.output}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Voice Support toggle */}
              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title">{t(LanguageKey.SettingGeneralAiModelsDirectVoiceSupport)}</div>
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
          {!isLoading && !RoleAccess(session, PartnerRole.Automatics) && <NotAllowedCard />}
        </div>
      </div>
    </div>
  );
}

export default AiModels;
