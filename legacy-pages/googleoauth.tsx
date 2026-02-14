import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function GoogleOAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const { code } = router.query;

      if (!code) {
        if (router.isReady) {
          setStatus("error");
          setErrorMessage("Authorization code not found in URL");
        }
        return;
      }

      try {
        const result = await signIn("google-oauth", {
          code: code as string,
          redirect: false,
        });

        if (result?.error) {
          setStatus("error");
          setErrorMessage(result.error);
          return;
        }

        if (result?.ok) {
          setStatus("success");

          if (window.opener) {
            window.opener.postMessage(
              { type: "GOOGLE_AUTH_SUCCESS", data: result },
              window.location.origin
            );

            setTimeout(() => {
              window.close();
            }, 500);
            return;
          }

          window.location.href = "/home";
          return;
        }

        setStatus("error");
        setErrorMessage("Unexpected authentication result");
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(
          error.message || "An error occurred during authentication"
        );
      }
    };

    if (router.isReady) {
      handleGoogleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}>
      {status === "loading" && (
        <>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: "20px" }}>Authenticating with Google...</p>
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ fontSize: "48px", color: "#4CAF50" }}>✓</div>
          <p style={{ marginTop: "20px", color: "#4CAF50" }}>
            Login successful! Redirecting...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: "48px", color: "#f44336" }}>✗</div>
          <p style={{ marginTop: "20px", color: "#f44336" }}>
            Authentication failed
          </p>
          <p style={{ marginTop: "10px", color: "#666", fontSize: "14px" }}>
            {errorMessage}
          </p>
        </>
      )}
    </div>
  );
}
