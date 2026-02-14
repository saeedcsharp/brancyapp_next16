import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface SessionUser extends DefaultSession["user"] {
    id: number;
    Id: number;
    error: string | null;
    instagramerIds: number[];
    accessToken: string;
    socketAccessToken: string;
    currentIndex: number;
    lastUpdate: number;
    isShopperOrInfluencer: boolean;
    pk: number;
    isShopper: boolean;
    isInfluencer: boolean;
    isBusiness?: boolean;
    isPrivate?: boolean;
    isVerified?: boolean;
    profileUrl: string;
    username: string;
    fullName: string;
    loginByFb: boolean;
    loginByInsta: boolean;
    packageExpireTime?: number;
    roles: PartnerRole[];
    isPartner: boolean;
    expireTime: number;
    sessionId: string;
    commentPermission: boolean;
    insightPermission: boolean;
    messagePermission: boolean;
    publishPermission: boolean;
    website: string | null;
    biography: string | null;
    hasPackage?: boolean;
  }

  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: number;
    Id?: number;
    error?: string | null;
    instagramerIds?: number[];
    accessToken?: string;
    socketAccessToken?: string;
    currentIndex?: number;
    lastUpdate?: number;
    packageExpireTime?: number;
    expireTime?: number;
    sessionId?: string;
    commentPermission?: boolean;
    insightPermission?: boolean;
    messagePermission?: boolean;
    publishPermission?: boolean;
    website?: string | null;
    biography?: string | null;
  }
}
