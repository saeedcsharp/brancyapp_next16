
export interface GraphFollowersModel {
  allFollowers: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newFollowers: number;
    listPoint: {
      x: number;
      y: number;
    }[]
    followers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}

