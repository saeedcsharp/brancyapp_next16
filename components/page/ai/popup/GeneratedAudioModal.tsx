import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { DownloadImage } from "brancy/helper/DownloadImage";
import { IGetMedia } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import styles from "./Modal_Generated.module.css";
import { formatGeneratedMediaTime, parseGeneratedMediaMetadata, PromptCodeBlock } from "./generatedMediaHelpers";

interface GeneratedAudioModalProps {
  audio: IGetMedia;
}

// Voice output is either an mp3 file or plain text.
function getAudioPath(audio: IGetMedia): string | null {
  const candidates = [audio.mediaUrl, audio.audioUrl, audio.videoUrl, audio.imageUrl];
  return (
    candidates.find((url) => url?.trim() && /\.mp3(\?|$)/i.test(url)) ??
    (audio.mediaUrl?.trim() || audio.audioUrl?.trim() || null)
  );
}

type LyricsEntry = { key: string; text: string; isOutput: boolean };
const isLyricsKey = (key: string) => /(^|_)lyrics$/i.test(key);

// Lyrics-only results have no mediaUrl and carry the song text in metadata.output_lyrics.
function getMetadataLyrics(metadata: string | null | undefined): LyricsEntry[] {
  if (!metadata) return [];
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.entries(parsed as Record<string, unknown>)
      .filter(([key, value]) => isLyricsKey(key) && typeof value === "string" && value.trim())
      .map(([key, value]) => ({
        key,
        text: (value as string).trim(),
        isOutput: key.toLowerCase() === "output_lyrics",
      }))
      .sort((first, second) => Number(second.isOutput) - Number(first.isOutput));
  } catch {
    return [];
  }
}

type LyricsSection = { tag: string | null; lines: string[] };

function parseLyricsSections(lyrics: string): LyricsSection[] {
  // Some payloads arrive double-escaped or flattened, so tags are forced onto their own lines.
  const normalized = lyrics
    .replace(/\\r\\n|\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\s*(\[[^\]\n]+\])\s*/g, "\n$1\n");
  const sections: LyricsSection[] = [];
  let current: LyricsSection = { tag: null, lines: [] };
  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const tagMatch = line.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (tagMatch) {
      if (current.tag || current.lines.length) sections.push(current);
      current = { tag: tagMatch[1].trim(), lines: tagMatch[2] ? [tagMatch[2]] : [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.tag || current.lines.length) sections.push(current);
  return sections;
}

function LyricsBlock({ lyrics, isOutput }: { lyrics: string; isOutput: boolean }) {
  const sections = parseLyricsSections(lyrics);
  return (
    <div className={`${styles.lyricsSection} ${isOutput ? "" : styles.lyricsInput}`} dir="auto">
      {sections.map((section, index) => (
        <section className={styles.lyricsCard} key={`${section.tag ?? "text"}-${index}`}>
          {section.tag && (
            <span className={styles.lyricsTag} dir="ltr">
              {section.tag}
            </span>
          )}
          {section.lines.map((line, lineIndex) => (
            <p key={lineIndex} className={styles.lyricsLine} dir="auto">
              {line}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

export default function GeneratedAudioModal({ audio }: GeneratedAudioModalProps) {
  const { t } = useTranslation();
  const audioPath = getAudioPath(audio);
  const audioUrl = audioPath ? getClientMediaBaseUrl() + audioPath : null;
  const audioFileName = audioPath?.split("/").pop()?.split("?")[0] || `generated-voice-${audio.id}.mp3`;
  const outputText = audio.text?.trim() || null;
  const lyricsEntries = getMetadataLyrics(audio.metadata);
  const metadataItems = audio.metadata
    ? (parseGeneratedMediaMetadata(audio.metadata, t)?.filter((item) => !isLyricsKey(item.key)) ?? null)
    : null;
  const copyText = async (value: string | null) => {
    if (!value || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <article className={styles.resultModal}>
      <div className={styles.resultContent}>
        <div className="headerandinput" style={{ gap: "20px" }}>
          {audioUrl && (
            <audio controls preload="metadata" src={audioUrl} style={{ width: "100%" }}>
              {t("Your browser does not support audio playback.")}
            </audio>
          )}
          {outputText && (
            <div className="headerandinput">
              <div className="headerparent">
                <span className="headertext">{t("Output text")}</span>
                <button
                  type="button"
                  aria-label={t("Copy text")}
                  title={t("Copy text")}
                  onClick={() => copyText(outputText)}
                  style={{ padding: 0, border: 0, cursor: "pointer", background: "transparent" }}>
                  <img width="22px" height="22px" src="/copy.svg" alt="" />
                </button>
              </div>
              <div className={styles.promptSection}>{outputText}</div>
            </div>
          )}
          {lyricsEntries.map(({ key, text, isOutput }) => (
            <div className="headerandinput" key={key}>
              <div className="headerparent">
                <span className="headertext">{t(isOutput ? "Lyrics" : "Input lyrics")}</span>
                <button
                  type="button"
                  aria-label={t("Copy lyrics")}
                  title={t("Copy lyrics")}
                  onClick={() => copyText(text)}
                  style={{ padding: 0, border: 0, cursor: "pointer", background: "transparent" }}>
                  <img width="22px" height="22px" src="/copy.svg" alt="" />
                </button>
              </div>
              <LyricsBlock lyrics={text} isOutput={isOutput} />
            </div>
          ))}
          <div className="headerandinput">
            <div className="headerparent">
              <span className="headertext">{t("Prompt")}</span>
              <button
                type="button"
                aria-label={t("Copy prompt")}
                title={t("Copy prompt")}
                onClick={() => copyText(audio.prompt)}
                style={{ padding: 0, border: 0, cursor: "pointer", background: "transparent" }}>
                <img width="22px" height="22px" src="/copy.svg" alt="" />
              </button>
            </div>
            <PromptCodeBlock prompt={audio.prompt || t("Not available")} />
          </div>
        </div>

        <div className={styles.resultDetails}>
          {audio.metadata && !(lyricsEntries.length && !metadataItems?.length) && (
            <section className={styles.resultSection}>
              <span>{t("Metadata")}</span>
              {metadataItems?.length ? (
                <dl className={styles.metadataGrid}>
                  {metadataItems.map((item) => (
                    <div key={item.key}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>{audio.metadata}</p>
              )}
            </section>
          )}

          <dl className={styles.resultGrid}>
            <div>
              <dt>{t("Creator")}</dt>
              <dd>{audio.creatorKey}</dd>
            </div>
            <div>
              <dt>{t("Version")}</dt>
              <dd>{audio.version}</dd>
            </div>
            <div>
              <dt>{t("Status")}</dt>
              <dd>{audio.status}</dd>
            </div>
            <div>
              <dt>{t("Voice ID")}</dt>
              <dd>{audio.id}</dd>
            </div>
            <div>
              <dt>{t("Created Time")}</dt>
              <dd>{formatGeneratedMediaTime(audio.createdTime)}</dd>
            </div>
            {audio.tokenUsage != null && (
              <div>
                <dt>{t("Token usage")}</dt>
                <dd>{audio.tokenUsage.toLocaleString()}</dd>
              </div>
            )}
            {audio.jobId && (
              <div className={styles.resultWideDetail}>
                <dt>{t("Job ID")}</dt>
                <dd>{audio.jobId}</dd>
              </div>
            )}
          </dl>

          {audioUrl && (
            <button className="cancelButton" type="button" onClick={() => DownloadImage(audioUrl, audioFileName)}>
              {t("Download voice")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
