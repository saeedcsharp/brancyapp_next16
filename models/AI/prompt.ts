import { ItemType } from "brancy/models/messages/enum";

export interface ITotalPrompt {
  promptId: string;
  fbId: string;
  createdTime: number;
  updatedTime: number;
  title: string;
  reNewForThread: boolean;
  shouldFollower: boolean;
  customPromptAnalysis: IAnalysisPrompt | null;
}
export interface IDetailPrompt extends ITotalPrompt {
  promptStr: string;
}
export interface IPrompts {
  items: ITotalPrompt[];
  nextMaxId: string | null;
}
export interface ICreatePrompt {
  title: string;
  reNewForThread: boolean;
  shouldFollower: boolean;
  prompt: string;
  promptAnalysis: IAnalysisPrompt | null;
}
export interface IAnalysisPrompt {
  description: string;
  tasks: string[];
  rules: string[];
  detectedCredentials: { type: string; value: string }[];
  signature: string;
}
export interface ICreateLiveChat {
  text: string;
  username: string;
  promptInfo: ICreatePrompt;
}
export interface IAITools {
  description: string;
  parameters: {
    type: string;
    description: string;
    isRequired: boolean;
    name: string;
  }[];
  name: string;
  tokenUsage: number;
  completeDescription: string;
}
export interface ILiveChat {
  imageUrl: string | null;
  isStopped: boolean;
  itemType: ItemType;
  quickReplies: [];
  text: string | null;
  voiceUrl: string | null;
  type: string;
}
