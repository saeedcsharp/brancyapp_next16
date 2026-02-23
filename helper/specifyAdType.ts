import { AdsType } from "brancy/models/advertise/AdEnums";

export function handleSpecifyAdType(adType: AdsType) {
  switch (adType) {
    case AdsType.CampaignAd:
      return "Campaign";
    case AdsType.PostAd:
      return "Post Ad";
    case AdsType.StoryAd:
      return "Story Ad";
  }
}
