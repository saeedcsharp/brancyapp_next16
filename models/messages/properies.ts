import { ITotalPrompt } from "../AI/prompt";
import { SuperFigure } from "../page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import {
  AutoReplyPayLoadType,
  Language,
  MediaProductType,
  PayloadType,
  SpecialPayLoad,
} from "./enum";

export interface ICommentAndDirectReply {
  commentReplies: IAutoReply;
  directReplies: IAutoReply;
}
export interface IAutoReply {
  propmts: IPropmt[];
  activeReply: boolean;
}
export interface IPropmt {
  propmtId: number;
  incomeMsg: string;
  answer: string;
  activePrompt: boolean;
}
export interface IProfileButtons {
  specialPayload: SpecialPayLoad | null;
  title: string | null;
  additionalPayload: null;
  payloadType: PayloadType;
  masterFlowId: string | null;
  promptId: string | null;
  response: string | null;
  generalAIId: string | null;
  masterFlow: ITotalMasterFlow | null;
  prompt: ITotalPrompt | null;
}
export interface IUpdateProfileButton {
  specialPayload: SpecialPayLoad | null;
  title: string | null;
  additionalPayload: null;
  payloadType: PayloadType;
  masterFlowId: string | null;
  promptId: string | null;
  response: string | null;
  prompt: string | null;
}
export interface IIceBreaker {
  profileButtons: { items: IProfileButtons[] };
  isActive: boolean;
  updateTime: number;
}
export interface IAutoReplySetting {
  autoReplyCustomAction: {
    likeReply: boolean;
    hideComment: boolean;
    updateTime: number;
  };
  language: Language;
  checkFollowerTemplate: {
    isActive: boolean;
    updateTime: number;
    ownerId: string;
    title: string;
    buttonText: string;
  } | null;
}
export interface IMessagePanel {
  language: number;
  robotReply: boolean;
  followTemplate: {
    isActive: boolean;
    title: string;
    content: string;
  };
  likeReplyStory: boolean;
}
export interface IPersistentMenu extends IIceBreaker {}
export interface ISpecialPayload {
  specialPayload: SpecialPayLoad;
  description: string;
}
export interface IUpdateIceBreaker {
  enabled: boolean;
  items: {
    question: string;
    response: string;
  }[];
}
export interface IWelcomingMessage_GetCondition {
  instagramerId: number;
  isActive: boolean;
  lastUpdate: number;
  text: string;
  lastDone: number;
}
export interface IWelcomingMessage_Update {
  isActive: boolean;
  text: string;
}
export interface IWelcomingMessage_GetSentMessage {
  instagramerId: number;
  text: string;
  createdTime: number;
  sentMessageId: number;
  username: string;
  pk: number;
  fullName: string;
  profileUrl: string;
}
export interface IWelcomingMessage_Figure extends SuperFigure {}
export interface IBusinessMessageFilter {
  activeBusinessFilter: boolean;
  businessMessageFilterType: BusinessFilterNumberType;
  message: string;
}
export interface IIceBreakerInfo {
  items: {
    question: string;
    response: string;
    isDefault: boolean;
    orderId: number;
  }[];
  enabled: boolean;
  instagramerId: number;
  lastUpdate: number;
}
export interface IGeneralAutoReply {
  items: { id: string; sendCount: number; text: string }[];
  sendCount: number;
  pauseTime: number | null;
  id: string;
  response: string | null;
  sendPr: boolean;
  shouldFollower: boolean;
  productType: MediaProductType;
  automaticType: AutoReplyPayLoadType;
  promptId: string | null;
  masterFlowId: string | null;
  masterFlow: ITotalMasterFlow | null;
  prompt: ITotalPrompt | null;
  title: string;
  replySuccessfullyDirected: boolean;
  customRepliesSuccessfullyDirected: string[];
}
export interface ICreateGeneralAutoReply {
  keys: string[];
  response: string | null;
  sendPr: boolean;
  shouldFollower: boolean;
  productType: MediaProductType | number | null;
  id: string | null;
  automaticType: AutoReplyPayLoadType;
  promptId: string | null;
  masterFlowId: string | null;
  title: string;
  replySuccessfullyDirected: boolean;
  customRepliesSuccessfullyDirected: string[];
}
export interface ITotalMasterFlow {
  fbId: string;
  masterFlowId: string;
  createdTime: number;
  initialFlowId: string;
  title: string;
  checkFollower: boolean;
  initalFlow: null;
  onMessagePosition: null;
}
export interface IMasterFlow {
  items: ITotalMasterFlow[];
  nextMaxId: string | null;
}
export enum BusinessFilterNumberType {
  AI = 0,
  SpecificWords = 1,
}
export enum BusinessFilterMsgType {
  AI = "Automatic selection (AI)",
  SpecificWords = "specific words",
}
