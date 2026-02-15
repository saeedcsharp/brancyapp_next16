import { ReactNode } from "react";

type PostsLayoutProps = {
  children: ReactNode;
  createpost: ReactNode;
  postinfo: ReactNode;
};

export default function PostsLayout({ children, createpost, postinfo }: PostsLayoutProps) {
  return (
    <>
      {children}
      {createpost}
      {postinfo}
    </>
  );
}
