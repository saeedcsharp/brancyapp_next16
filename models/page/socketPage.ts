export interface IUploadPost {
  UploadState: UploadPostSteps;
  EventGuid: string;
  UploadStateStr: string;
  Caption: string;
  Name: string;
  EventTime: number;
}
export enum UploadPostSteps {
  SendBackToServer = -2,
  DownloadFromMiddle = -1,
  Preparing = 0,
  Uploading = 1,
  Uploaded = 2,
  UploadingThumbnail = 3,
  ThumbnailUploaded = 4,
  Configuring = 5,
  Configured = 6,
  Completed = 7,
  Error = 8,
}
