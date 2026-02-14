import { readFileSync } from "fs";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

// خواندن secret از Docker Swarm یا environment variable
function getSecret(): string {
  try {
    // اول سعی می‌کنیم از Docker Swarm secret بخونیم
    return readFileSync("/run/secrets/brancyapp_jwt_token", "utf8").trim();
  } catch {
    // اگر secret file نبود، از environment variable استفاده می‌کنیم
    return (
      process.env.NEXTAUTH_SECRET || "9feJvapw9jpevAe9p8phvpaivIaWehv89paHVewf"
    );
  }
}

export default NextAuth({
  secret: getSecret(),
  providers: [
    // Google OAuth Provider - وریفای code توسط API سرور
    CredentialsProvider({
      id: "google-oauth",
      name: "Google OAuth",
      credentials: {
        code: { label: "Google Authorization Code", type: "text" },
      },
      async authorize(credentials, req) {
        const googleCode = credentials?.code;

        if (!googleCode) {
          throw new Error("Google authorization code is required");
        }

        try {
          // ارسال code به API سرور برای وریفای و دریافت token
          const res = await fetch("https://api.brancy.app/user/GoogleLogin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: googleCode }),
          });

          if (res.status !== 200) {
            let errorMessage = await res.json();
            const err = errorMessage["info"];
            console.log("Google OAuth error:", err.responseType);
            throw new Error(err.responseType || "Google authentication failed");
          }

          let loginResultInfo2 = await res.json();
          let loginResultInfo = loginResultInfo2["value"];

          const userRoll = loginResultInfo["role"];
          const instagramerIds: number[] = userRoll["instagramerIds"];
          const fbIds: string[] = userRoll["fbIds"];
          const currntIndex =
            instagramerIds != null && instagramerIds.length > 0 ? 0 : -1;

          const user = {
            id: loginResultInfo.id,
            instagramerIds: instagramerIds,
            accessToken: loginResultInfo.token,
            currentIndex: currntIndex,
            socketAccessToken: loginResultInfo.socketAccessToken,
            expireTime: loginResultInfo.expireTime,
            sessionId: loginResultInfo.sessionId,
          };

          console.log("Google OAuth user:", user);
          return user;
        } catch (error: any) {
          console.error("Google OAuth error:", error);
          throw new Error(error.message || "Google authentication failed");
        }
      },
    }),
    // Provider قبلی - لاگین با کد تایید
    CredentialsProvider({
      name: "Cred",
      credentials: {
        preuserToken: { label: "PreUserToken" },
        verificationCode: { label: "Verification code" },
      },
      async authorize(credentials, req) {
        const myVerificationCode = credentials?.verificationCode ?? "";
        const Authorization = credentials?.preuserToken ?? "";
        var res = await fetch(
          "https://api.brancy.app/user/UserLoginVerifyCode?verificationCode=" +
            myVerificationCode,
          {
            headers: {
              Authorization: Authorization,
            },
          }
        );
        if (res.status != 200) {
          let errorMessage = await res.json();
          const err = errorMessage["info"];
          console.log("eroorrrrrrr", err.responseType);
          throw new Error(err.responseType);
        }

        let loginResultInfo2 = await res.json();
        let loginResultInfo = loginResultInfo2["value"];

        const userRoll = loginResultInfo["role"]; //  JSON.parse(loginResultInfo["Role"]);

        const instagramerIds: number[] = userRoll["instagramerIds"];
        console.log("instagramerIds:");
        console.log("isntagramerIds", instagramerIds);
        const fbIds: string[] = userRoll["fbIds"];
        console.log("fbids", fbIds);
        const currntIndex =
          instagramerIds != null && instagramerIds.length > 0 ? 0 : -1;
        const user = {
          id: loginResultInfo.id,
          instagramerIds: instagramerIds,
          accessToken: loginResultInfo.token,
          currentIndex: currntIndex,
          socketAccessToken: loginResultInfo.socketAccessToken,
          expireTime: loginResultInfo.expireTime,
          sessionId: loginResultInfo.sessionId,
        };
        console.log("myUser", user);
        if (user.instagramerIds != null && user.instagramerIds.length > 0) {
          user;
        }
        // const user = {
        //   id: "1",
        //   name: "saeed",
        //   "phoneNumber": "1111",
        //   accessToken: "chwerufgyherygf",
        // };
        console.log(user);
        return user;
        // if (credentials?.["phoneNumber"] === user["phoneNumber"]) {
        //   return user;
        // } else {
        //   // Return null if user data could not be retrieved
        //   return null;
        // }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      session.user = token as any;
      return session;
    },
  },
  // pages: {
  //   signIn: '/auth/signin'
  // }
});
