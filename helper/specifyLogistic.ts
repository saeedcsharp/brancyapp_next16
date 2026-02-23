import { LogisticType } from "../models/store/enum";

export function specifyLogistic(id: number | null): string {
  switch (id) {
    case LogisticType.IRPost_Pishtaz:
      return "pishtaz";
    case LogisticType.IRPost_Special:
      return "post";
    case LogisticType.IRPost_Tipax:
      return "tipax";
    default:
      return "--";
  }
}
