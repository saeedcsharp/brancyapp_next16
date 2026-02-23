import { useSession } from "next-auth/react";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { LanguageKey } from "brancy/i18n";
import { UploadFile } from "brancy/helper/api";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
import styles from "brancy/components/messages/aiflow/flowNode/VoiceNode.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL || "";
interface VoiceNodeProps extends BaseNodeProps {
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
}

export const VoiceNode: React.FC<VoiceNodeProps> = ({ node, updateNodeData, setEditorState }) => {
  const [recordingNodeId, setRecordingNodeId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(node.data?.tempVoiceUrl || baseMediaUrl + node.data.voiceUrl);
  const { t } = useTranslation();
  const { data: session } = useSession();

  // Timer effect for recording duration
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (recordingNodeId === node.id) {
      setRecordingDuration(0);
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingNodeId, node.id]);

  const handleVoiceUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validAudioTypes = ["audio/mp4", "audio/aac", "audio/m4a"];

      const isValidAudio = validAudioTypes.some(
        (type) => file.type === type || file.name.toLowerCase().match(/\.(mp4|aac|m4a)$/i),
      );

      if (!isValidAudio && file.type && !file.type.startsWith("audio/")) {
        toast.warn(t(LanguageKey.New_Flow_upload_unsupported_media));
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.warn(t(LanguageKey.New_Flow_uploadmaxsizeexceeded));
        return;
      }

      setEditorState((prev: any) => ({
        ...prev,
        nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: 0 } : n)),
      }));

      // آپلود فایل صوتی به سرور
      UploadFile(session, file, (progress) => {
        setEditorState((prev: any) => ({
          ...prev,
          nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: progress } : n)),
        }));
      })
        .then((upload) => {
          setVoiceUrl(upload.showUrl);
          updateNodeData(node.id, {
            voiceUrl: upload.fileName,
            tempVoiceUrl: upload.showUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || "audio/unknown",
            isRecorded: false,
          });
          setEditorState((prev: any) => ({
            ...prev,
            nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
          }));
        })
        .catch((error) => {
          console.error("خطا در آپلود فایل صوتی:", error);
          setEditorState((prev: any) => ({
            ...prev,
            nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
          }));
          toast.error(t(LanguageKey.New_Flow_uploadfilefailed));
        });

      e.target.value = "";
    },
    [node.id, updateNodeData, setEditorState, session, t],
  );

  const startRecording = useCallback(async () => {
    try {
      // Start countdown
      setCountdown(3);

      // Wait for countdown to finish
      await new Promise<void>((resolve) => {
        let count = 3;
        const countdownInterval = setInterval(() => {
          count--;
          setCountdown(count);
          if (count === 0) {
            clearInterval(countdownInterval);
            setCountdown(null);
            resolve();
          }
        }, 1000);
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      let mimeType = "audio/mp4";
      if (MediaRecorder.isTypeSupported("audio/aac")) {
        mimeType = "audio/aac";
      } else if (MediaRecorder.isTypeSupported("audio/m4a")) {
        mimeType = "audio/m4a";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // تبدیل Blob به File
        const fileName = `recorded_${Date.now()}.${mimeType.split("/")[1]}`;
        const audioFile = new File([audioBlob], fileName, { type: mimeType });

        // نمایش پیش‌نمایش موقت
        const reader = new FileReader();
        reader.onload = (e) => {
          const audioUrl = e.target?.result;
          if (audioUrl) {
            updateNodeData(node.id, {
              voiceUrl: audioUrl,
              fileName: fileName,
              fileSize: audioBlob.size,
              fileType: mimeType,
              isRecorded: true,
            });
          }
        };
        reader.readAsDataURL(audioBlob);

        // اپلود فایل صوتی
        try {
          setEditorState((prev: any) => ({
            ...prev,
            nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: 0 } : n)),
          }));

          const uploadResult = await UploadFile(session, audioFile, (progress) => {
            setEditorState((prev: any) => ({
              ...prev,
              nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: progress } : n)),
            }));
          });

          if (uploadResult.showUrl) {
            setVoiceUrl(uploadResult.showUrl);
            updateNodeData(node.id, {
              voiceUrl: uploadResult.fileName,
              tempVoiceUrl: uploadResult.showUrl,
              fileName: uploadResult.fileName,
              fileSize: audioBlob.size,
              fileType: mimeType,
              isRecorded: true,
              isExist: false,
            });
          } else {
            toast.error(t(LanguageKey.New_Flow_uploadfilefailed));
          }

          setEditorState((prev: any) => ({
            ...prev,
            nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
          }));
        } catch (error) {
          console.error("خطا در آپلود فایل صوتی:", error);
          toast.error(t(LanguageKey.New_Flow_uploadfilefailed));
          setEditorState((prev: any) => ({
            ...prev,
            nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
          }));
        }

        stream.getTracks().forEach((track) => track.stop());
        setRecordingNodeId(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingNodeId(node.id);
    } catch (error) {
      console.error("خطا در دسترسی به میکروفون:", error);
      toast.error(t(LanguageKey.New_Flow_micphoneaccessdenied));
      setRecordingNodeId(null);
      setCountdown(null);
    }
  }, [node.id, updateNodeData, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  }, [mediaRecorder]);

  return (
    <div className={styles.container}>
      {/* دکمه‌های آپلود و ضبط */}
      {!node.data?.voiceUrl && (
        <div className={styles.buttonGroup}>
          <input
            type="file"
            accept="audio/*"
            className={styles.fileInput}
            id={`voice-${node.id}`}
            onChange={handleVoiceUpload}
          />
          <label htmlFor={`voice-${node.id}`} className="cancelButton">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="var(--color-dark-blue)" viewBox="0 0 36 36">
              <path d="M19.5 31.88a1.5 1.5 0 0 1-3 0v-6.75h-.88c-.27 0-.6 0-.85-.04a1.8 1.8 0 0 1-1.47-.98c-.42-.85.04-1.6.13-1.76.15-.24.35-.5.5-.7l.05-.05 1.58-1.88q.43-.45.96-.83c.3-.21.83-.52 1.48-.52s1.17.3 1.48.52q.53.38.96.83c.57.6 1.14 1.32 1.58 1.88l.04.05c.16.2.36.46.5.7.1.16.56.9.14 1.76a1.8 1.8 0 0 1-1.46.98c-.27.04-.6.04-.86.04h-.87z" />
              <path
                opacity=".4"
                d="M1.88 18.75a8.6 8.6 0 0 1 6.3-8.3c.3-.09.45-.13.53-.22s.12-.23.2-.53a9.38 9.38 0 0 1 18.4 1.25c.05.37.07.55.16.66.1.1.28.15.64.24a7.88 7.88 0 0 1-1.86 15.53H24.6q-1.02.02-1.08-.06l-.03-.08q0-.09.87-.93a3.75 3.75 0 0 0 .08-5.3c-.97-1.21-1.9-2.5-3.08-3.51A5.2 5.2 0 0 0 18 16.13a5.3 5.3 0 0 0-3.36 1.37c-1.19 1.01-2.1 2.3-3.08 3.51a3.75 3.75 0 0 0 .08 5.3q.9.84.87.93l-.03.08q-.07.06-1.08.05h-.9a8.6 8.6 0 0 1-8.62-8.62"
              />
            </svg>
            {t(LanguageKey.New_Flow_upload_audio)}
          </label>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (recordingNodeId === node.id) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            className={`${countdown !== null || recordingNodeId === node.id ? "stopButton" : "saveButton"} ${
              countdown !== null || recordingNodeId === node.id ? styles.pulsingButton : ""
            }`}>
            {countdown !== null ? (
              <>
                {t(LanguageKey.New_Flow_areyoureadytorecord)} ({countdown > 0 ? countdown : t(LanguageKey.start)})
              </>
            ) : recordingNodeId === node.id ? (
              <>
                {t(LanguageKey.New_Flow_voice_recording_started)} ({Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, "0")})
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path opacity=".4" d="M17 7v4a5 5 0 0 1-10 0V7a5 5 0 0 1 10 0" fill="#fff" />
                  <path
                    stroke="#fff"
                    d="M17 7v4a5 5 0 0 1-10 0V7a5 5 0 0 1 10 0Zm3 4a8 8 0 0 1-8 8m0 0a8 8 0 0 1-8-8m8 8v3m0 0h3m-3 0H9"
                    strokeLinecap="round"
                  />
                </svg>
                {t(LanguageKey.New_Flow_record_voice)}
              </>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {node.uploadProgress !== undefined && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${node.uploadProgress}%` }}>
              <span className={styles.progressText}>{node.uploadProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* نمایش صدا */}
      {node.data?.voiceUrl && !node.uploadProgress && (
        <>
          <audio src={voiceUrl || ""} controls className={styles.audioPlayer}>
            {t(LanguageKey.New_Flow_unsupportedbrowser)}
          </audio>

          {/* نمایش اطلاعات فایل */}
          {node.data?.fileName && (
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>
                {node.data.isRecorded ? "🎙️" : "🎵"} {node.data.fileName}
              </span>
              <span className={styles.fileSize}>{(node.data.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}

          {/* دکمه حذف */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateNodeData(node.id, {
                voiceUrl: undefined,
                fileName: undefined,
                fileSize: undefined,
                fileType: undefined,
                isRecorded: undefined,
              });
            }}
            className="stopButton">
            {t(LanguageKey.delete)}
          </button>
        </>
      )}
    </div>
  );
};

// Height calculation for this node type
export const getVoiceNodeHeight = (node: NodeData): number => {
  if (node.data?.voiceUrl) {
    return 120; // audio player + file info + remove button
  }
  return 80; // دکمه‌های upload و record
};

// Node container class name for styling the node border
export const voiceNodeClassName = styles.nodeContainer;
