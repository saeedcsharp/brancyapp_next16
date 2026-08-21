"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DependencyReport from "./package/page";

const DEV_PASSWORD = "9311";

export default function DevPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === DEV_PASSWORD) {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setInput("");
      inputRef.current?.focus();
    }
  }

  if (authenticated) {
    return (
      <div style={styles.overlay}>
        <div style={styles.card}>
          <div style={styles.lockIcon}>🧭</div>
          <h2 style={styles.title}>Dev Panel</h2>
          <p style={styles.subtitle}>بخش موردنظر برای بررسی را انتخاب کنید.</p>
          <div style={styles.choiceGrid}>
            <button type="button" style={styles.button} onClick={() => router.push("/dev/package")}>
              بررسی Package
            </button>
            <button type="button" style={styles.designButton} onClick={() => router.push("/dev/systemDesign")}>
              تست System Design
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.lockIcon}>🔒</div>
        <h2 style={styles.title}>Dev Panel</h2>
        <p style={styles.subtitle}> پسورد وارد کنید.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            ref={inputRef}
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="پسورد"
            autoFocus
            style={{
              ...styles.input,
              ...(error ? styles.inputError : {}),
            }}
            dir="ltr"
          />
          {error && <p style={styles.errorText}>پسورد اشتباه است</p>}
          <button type="submit" style={styles.button}>
            ورود
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0f",
    fontFamily: "Vazirmatn, Tahoma, sans-serif",
  },
  card: {
    background: "#1a1a2e",
    border: "1px solid #2d2d4e",
    borderRadius: 16,
    padding: "48px 40px",
    width: 360,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
  },
  lockIcon: {
    fontSize: 48,
    lineHeight: 1,
  },
  title: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 1,
  },
  subtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    direction: "rtl",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  choiceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    width: "100%",
    marginTop: 8,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#e2e8f0",
    fontSize: 18,
    letterSpacing: 6,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    textAlign: "center",
  },
  inputError: {
    borderColor: "#ef4444",
    boxShadow: "0 0 0 2px rgba(239,68,68,0.25)",
  },
  errorText: {
    margin: 0,
    color: "#f87171",
    fontSize: 13,
    textAlign: "center",
    direction: "rtl",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  designButton: {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #38bdf8",
    background: "#082f49",
    color: "#bae6fd",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
};
