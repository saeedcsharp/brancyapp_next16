import { useEffect, useRef, useState } from "react";
import { IUploadVoice } from "saeed/models/messages/IMessage";
import MessageTockenGenerator from "saeed/models/messages/messageTockenGenerator";
import WaveSurfer from "wavesurfer.js";
import styles from "./voiceRecorder.module.css";
var audioBase64: string | null = "";
var durMs: number = 0;
var maxLenth: number = 0;
var voicePicks: number[][] = [];
var absVoicePicks: number[] = [];
function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;

  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
const VoiceRecorder = (props: {
  closeVoiceRecorder: () => void;
  sendVoice: (uploadVoice: IUploadVoice) => void;
  threadId: string;
}) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isStopRecording, setIsStopRecording] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioFile2 = useRef(audioFile);
  // Detect best possible audio mime type
  function getBestMimeType() {
    const types = [
      "audio/mp4", // AAC in MP4 (Chrome/Safari)
      "audio/aac", // Raw AAC (some browsers)
      "audio/m4a", // AAC in M4A (some browsers)
    ];

    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }

    return ""; // browser chooses default
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getBestMimeType();
      console.log("My memitype" + mimeType);

      mediaRecorder.current = new MediaRecorder(stream, { mimeType });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        let ext = "webm";
        if (mimeType.includes("mp4")) ext = "mp4";
        else if (mimeType.includes("aac")) ext = "aac";
        else if (mimeType.includes("m4a")) ext = "m4a";
        console.log("Extension is", ext);
        console.log("MIME type is", mimeType);

        const blob = new Blob(chunks.current, { type: mimeType });
        const fileName = `recording.${ext}`;
        const file = new File([blob], fileName, { type: mimeType });
        console.log("fffffffffffffff", file);
        setAudioFile(file);
        var reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = function () {
          var base64data = reader.result;
          audioBase64 = arrayBufferToBase64(base64data as ArrayBuffer);
        };
        if (wavesurfer.current) {
          wavesurfer.current.load(URL.createObjectURL(blob));
        }
      };

      mediaRecorder.current.start();
    } catch (error) {
      props.closeVoiceRecorder();
    }
  };
  useEffect(() => {
    console.log("Audio file state updated:", audioFile);
    audioFile2.current = audioFile;
  }, [audioFile]);
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setTimeout(() => {
        if (wavesurfer.current) {
          durMs = wavesurfer.current.getDuration() * 1e3;
          maxLenth = wavesurfer.current.getDuration() * 1e1;
          voicePicks = wavesurfer.current.exportPeaks({
            maxLength: maxLenth,
          });
          absVoicePicks = voicePicks[0].map((x) => Math.abs(x));
        }
      }, 400);
    }
  };

  useEffect(() => {
    startRecording();
    wavesurfer.current = WaveSurfer.create({
      container: "#waveform",
      waveColor: "violet",
      progressColor: "purple",
      height: 100,
      width: "100%",
      barGap: 5,
      normalize: true,
      fillParent: true,
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prevCount) => prevCount + 1);
    }, 1000);
    if (currentTime >= 1190) {
      stopRecording();
      clearInterval(interval);
      setIsStopRecording(true);
    }
    return () => clearInterval(interval);
  }, [currentTime]);
  const sendVoice = () => {
    if (!isStopRecording) stopRecording();
    setTimeout(async () => {
      var clientContext = MessageTockenGenerator();
      var uploadVoice: IUploadVoice = {
        clientContext: clientContext,
        durationInMs: durMs,
        threadId: props.threadId,
        voiceBase64: audioBase64,
        waveFormData: absVoicePicks,
        waveformSamplingFrequencyHz: 10,
        isWave: true,

        file: audioFile2.current!,
      };
      console.log("sendVoiceeeeeeeeeeee", uploadVoice);
      props.sendVoice(uploadVoice);
    }, 500);
  };
  return (
    <>
      <div style={{ display: "none" }} id="waveform" />
      <div className={styles.voicerecord}>
        <svg className={styles.closebtn} onClick={props.closeVoiceRecorder} viewBox="5 5 10 10">
          <g fill="none" stroke="var(--color-ffffff)" strokeLinecap="round" strokeWidth="1.5">
            <path d="M6 0 0 6" transform="translate(7 7)"></path>
            <path d="m0 0 6 6" transform="translate(7 7)"></path>
          </g>
        </svg>

        <div className={styles.wave}> </div>
        <div className={styles.recordtime}>{`0:${currentTime.toString().padStart(2, "0")}`}</div>
        <div className={styles.recordbtn}>
          {!isStopRecording && <div className={styles.recordbtn1} />}
          {isStopRecording && <div className={styles.recordbtn2} />}
        </div>
        <svg onClick={sendVoice} className={styles.sendvoicebtn} viewBox="-5 -2 25 25">
          <path
            fill="var(--color-dark-blue)"
            d="M19.3 11.2 2 20a1.4 1.4 0 0 1-2-2s2.2-4.3 2.8-5.4 1.2-1.4 7.5-2.2a.4.4 0 0 0 0-.8c-6.3-.8-7-1-7.5-2.2L0 2a1.4 1.4 0 0 1 2-2l17.3 8.7a1.3 1.3 0 0 1 0 2.4"
          />
        </svg>
      </div>
    </>
  );
};

export default VoiceRecorder;
