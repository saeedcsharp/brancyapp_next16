export interface GraphUnFollowersModel {
  allUnFollowers: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newUnFollowers: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    unFollowers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}
