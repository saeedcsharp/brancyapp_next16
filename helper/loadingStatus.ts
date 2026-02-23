import { Session } from "next-auth";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";

export const LoginStatus = (session: Session | null): boolean =>
  Boolean(session && session.user.currentIndex !== -1 && session.user.loginByInsta);
export const packageStatus = (session: Session | null): boolean => {
  if (!session) {
    console.log("packageStatus: session is null");
    return false;
  }

  if (session.user.packageExpireTime === undefined) {
    console.log("packageStatus: packageExpireTime is undefined");
    return false;
  }

  const result = session.user.packageExpireTime * 1e3 > Date.now();
  console.log(
    `packageStatus: packageExpireTime = ${session.user.packageExpireTime}, current time = ${Date.now()}, result = ${result}`,
  );
  return result;
};

export function RoleAccess(session: Session | null, partnerRole?: PartnerRole): boolean {
  if (!session) return false;

  if (partnerRole === undefined) {
    // If no specific partner role is requested, non-partners always have access.
    return !session.user.isPartner;
  }

  if (!session.user.isPartner) return true;

  const userRoles = new Set(session.user.roles);
  return userRoles.has(partnerRole);
}
