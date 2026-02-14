
export interface GraphCommentsModel {
  allComments: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newComments: number;
    listPoint: {
      x: number;
      y: number;
    }[]
    comments: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}
