
export interface GraphViewsModel {
  allViews: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newViews: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    viewers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}
