import { readFileSync } from "fs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

function normalizeUser(input: any) {
  const normalizedId = Number(input?.Id ?? input?.id ?? 0);
  const now = Date.now();
  const rawPackageExpireTime = input?.packageExpireTime;
  const normalizedPackageExpireTime =
    typeof rawPackageExpireTime === "number" && rawPackageExpireTime > 0
      ? rawPackageExpireTime
      : undefined;

  return {
    ...input,
    id: normalizedId,
    Id: normalizedId,
    error: input?.error ?? null,
    instagramerIds: input?.instagramerIds ?? [],
    accessToken: input?.accessToken ?? "",
    socketAccessToken: input?.socketAccessToken ?? "",
    currentIndex: input?.currentIndex ?? -1,
    lastUpdate: input?.lastUpdate ?? now,
    isShopperOrInfluencer: input?.isShopperOrInfluencer ?? false,
    pk: input?.pk ?? 0,
    isShopper: input?.isShopper ?? false,
    isInfluencer: input?.isInfluencer ?? false,
    profileUrl: input?.profileUrl ?? "",
    username: input?.username ?? "",
    fullName: input?.fullName ?? "",
    loginByFb: input?.loginByFb ?? false,
    loginByInsta: input?.loginByInsta ?? false,
    packageExpireTime: normalizedPackageExpireTime,
    roles: input?.roles ?? [],
    isPartner: input?.isPartner ?? false,
    expireTime: input?.expireTime ?? 0,
    sessionId: input?.sessionId ?? "",
    commentPermission: input?.commentPermission ?? false,
    insightPermission: input?.insightPermission ?? false,
    messagePermission: input?.messagePermission ?? false,
    publishPermission: input?.publishPermission ?? false,
    website: input?.website ?? null,
    biography: input?.biography ?? null,
  };
}

function getSecret(): string {
  try {
    return readFileSync("/run/secrets/brancyapp_jwt_token", "utf8").trim();
  } catch {
    return process.env.NEXTAUTH_SECRET || "9feJvapw9jpevAe9p8phvpaivIaWehv89paHVewf";
  }
}

const handler = NextAuth({
  secret: getSecret(),
  providers: [
    CredentialsProvider({
      id: "google-oauth",
      name: "Google OAuth",
      credentials: {
        code: { label: "Google Authorization Code", type: "text" },
      },
      async authorize(credentials) {
        const googleCode = credentials?.code;
        if (!googleCode) throw new Error("Google authorization code is required");

        try {
          const res = await fetch("https://api.brancy.app/user/GoogleLogin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: googleCode }),
          });

          if (res.status !== 200) {
            const errorMessage = await res.json();
            const err = errorMessage["info"];
            throw new Error(err.responseType || "Google authentication failed");
          }

          const loginResultInfo2 = await res.json();
          const loginResultInfo = loginResultInfo2["value"];
          const userRoll = loginResultInfo["role"];
          const instagramerIds: number[] = userRoll["instagramerIds"];
          const currntIndex = instagramerIds != null && instagramerIds.length > 0 ? 0 : -1;

          return normalizeUser({
            id: loginResultInfo.id,
            instagramerIds,
            accessToken: loginResultInfo.token,
            currentIndex: currntIndex,
            socketAccessToken: loginResultInfo.socketAccessToken,
            expireTime: loginResultInfo.expireTime,
            sessionId: loginResultInfo.sessionId,
          });
        } catch (error: any) {
          throw new Error(error.message || "Google authentication failed");
        }
      },
    }),
    CredentialsProvider({
      name: "Cred",
      credentials: {
        preuserToken: { label: "PreUserToken" },
        verificationCode: { label: "Verification code" },
      },
      async authorize(credentials) {
        const myVerificationCode = credentials?.verificationCode ?? "";
        const Authorization = credentials?.preuserToken ?? "";

        const res = await fetch(
          "https://api.brancy.app/user/UserLoginVerifyCode?verificationCode=" + myVerificationCode,
          {
            headers: {
              Authorization,
            },
          },
        );

        if (res.status !== 200) {
          const errorMessage = await res.json();
          const err = errorMessage["info"];
          throw new Error(err.responseType);
        }

        const loginResultInfo2 = await res.json();
        const loginResultInfo = loginResultInfo2["value"];
        const userRoll = loginResultInfo["role"];
        const instagramerIds: number[] = userRoll["instagramerIds"];
        const currntIndex = instagramerIds != null && instagramerIds.length > 0 ? 0 : -1;

        return normalizeUser({
          id: loginResultInfo.id,
          instagramerIds,
          accessToken: loginResultInfo.token,
          currentIndex: currntIndex,
          socketAccessToken: loginResultInfo.socketAccessToken,
          expireTime: loginResultInfo.expireTime,
          sessionId: loginResultInfo.sessionId,
        });
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return normalizeUser({ ...token, ...session.user });
      }
      return normalizeUser({ ...token, ...user });
    },
    async session({ session, token }) {
      session.user = normalizeUser(token);
      return session;
    },
  },
});

export { handler as GET, handler as POST };
