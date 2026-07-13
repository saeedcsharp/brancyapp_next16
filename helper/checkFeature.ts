import { Session } from "next-auth";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";

import { PsgFeatureType } from "brancy/models/enums";
import { convertToMilliseconds } from "brancy/helper/manageTimer";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { IPsgFeatureInfo } from "brancy/models/interfaces";

export async function getPackageFeatureDetails(session: Session | null | undefined): Promise<IPsgFeatureInfo | null> {
  try {
    const res = await clientFetchApi<boolean, IPsgFeatureInfo>("/api/psg/GetPackageFeatureDetails", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: undefined,
      onUploadProgress: undefined,
    });
    if (res.succeeded) return res.value;
    notify(res.info.responseType, NotifType.Warning);
    return null;
  } catch {
    notify(ResponseType.Unexpected, NotifType.Error);
    return null;
  }
}
export async function checkPackageFeature(
  session: Session | null | undefined,
  featureId: PsgFeatureType,
): Promise<boolean> {
  try {
    const res = await clientFetchApi<boolean, boolean>("/api/feature/hasFeature", {
      methodType: MethodType.get,
      session: session,
      data: undefined,
      queries: [{ key: "featureId", value: featureId.toString() }],
      onUploadProgress: undefined,
    });
    if (res.succeeded) return res.value;
    notify(res.info.responseType, NotifType.Warning);
    return false;
  } catch {
    notify(ResponseType.Unexpected, NotifType.Error);
    return false;
  }
}

// Helper function to check if current time is within time range
function isTimeInRange(beginUnix: number, endUnix: number, timeUnix: number): boolean {
  return timeUnix > convertToMilliseconds(beginUnix) && timeUnix < convertToMilliseconds(endUnix);
}

// Helper function to check count limits
function isWithinCountLimit(count: number, maxCount: number): boolean {
  return count < maxCount;
}

export async function fetchAndCheckFeature(
  featureId: PsgFeatureType,
  session: Session | null | undefined,
): Promise<boolean> {
  const hasFeature = await checkPackageFeature(session, featureId);
  return !hasFeature;
}

export default function checkFeature(featureId: PsgFeatureType, featureInfo: IPsgFeatureInfo): boolean {
  try {
    const { basePackage: baseFeature, features } = featureInfo;
    const feature = features.find((x) => x.featureId === featureId);

    if (!feature || !baseFeature) {
      return false;
    }

    // Check package feature
    if (feature.packageFeature) {
      const { beginUnix, endUnix, count, maxCount } = feature.packageFeature;
      return isTimeInRange(beginUnix, endUnix, Date.now()) && isWithinCountLimit(count, maxCount);
    }

    // Check reserve feature
    if (feature.reserveFeature) {
      const { beginUnix, endUnix, count, maxCount, unExpired, unLimited } = feature.reserveFeature;

      const timeCondition = unExpired || isTimeInRange(beginUnix, endUnix, Date.now());
      const countCondition = unLimited || isWithinCountLimit(count, maxCount);

      return timeCondition && countCondition;
    }

    // No valid feature type found
    return false;
  } catch (error) {
    notify(ResponseType.Unexpected, NotifType.Error);
    return false;
  }
}
export function checkRemainingTimeFeature(
  featureId: PsgFeatureType,
  unixTime: number,
  featureInfo: IPsgFeatureInfo,
): boolean {
  try {
    const { basePackage: baseFeature } = featureInfo;
    if (!baseFeature) {
      return false;
    }

    // Check package feature
    if (baseFeature) {
      const { beginUnix, endUnix } = baseFeature;
      return isTimeInRange(beginUnix, endUnix, unixTime);
    }

    // No valid feature type found
    return false;
  } catch (error) {
    notify(ResponseType.Unexpected, NotifType.Error);
    return false;
  }
}
