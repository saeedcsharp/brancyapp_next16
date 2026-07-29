import { ReactNode } from "react";

type PostsLayoutProps = {
  children: ReactNode;
  postinfo: ReactNode;
};

export default function PostsLayout({ children, postinfo }: PostsLayoutProps) {
  return (
    <>
      {children}
      {postinfo}
    </>
  );
}
