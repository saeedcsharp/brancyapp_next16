import { ReactNode } from "react";

type StoriesLayoutProps = {
  children: ReactNode;
  storyinfo: ReactNode;
};

export default function StoriesLayout({ children, storyinfo }: StoriesLayoutProps) {
  return (
    <>
      {children}
      {storyinfo}
    </>
  );
}
