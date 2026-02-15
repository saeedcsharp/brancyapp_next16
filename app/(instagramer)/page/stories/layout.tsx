import { ReactNode } from "react";

type StoriesLayoutProps = {
  children: ReactNode;
  createstory: ReactNode;
  storyinfo: ReactNode;
};

export default function StoriesLayout({ children, createstory, storyinfo }: StoriesLayoutProps) {
  return (
    <>
      {children}
      {createstory}
      {storyinfo}
    </>
  );
}
