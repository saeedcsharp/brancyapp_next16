import { NotifType, notify, ResponseType } from "../components/notifications/notificationBox";
import { FeatureType, IFeatureInfo } from "../models/psg/psg";
import { convertToMilliseconds } from "./manageTimer";

// Helper function to check if current time is within time range
function isTimeInRange(beginUnix: number, endUnix: number, timeUnix: number): boolean {
  return timeUnix > convertToMilliseconds(beginUnix) && timeUnix < convertToMilliseconds(endUnix);
}

// Helper function to check count limits
function isWithinCountLimit(count: number, maxCount: number): boolean {
  return count < maxCount;
}

export default function checkFeature(featureId: FeatureType, featureInfo: IFeatureInfo): boolean {
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
  featureId: FeatureType,
  unixTime: number,
  featureInfo: IFeatureInfo
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
