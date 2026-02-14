import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommentInbox from "saeed/components/messages/comment/commentInbox";
import NotPermission, {
  PermissionType,
} from "saeed/components/notOk/notPermission";
import { LoginStatus, packageStatus } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
const Comments = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  useEffect(() => {
    if (!session) return;
    if (session.user.currentIndex === -1) router.push("/user");
    if (session && !packageStatus(session)) router.push("/upgrade");
    if (!LoginStatus(session)) router.push("/");
    console.log("session?.user.commentPermission", session?.user);
  }, [session]);
  if (session && !session?.user.commentPermission)
    return <NotPermission permissionType={PermissionType.Comments} />;
  return (
    session &&
    session.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Comments)}</title>
          <meta
            name="description"
            content="Advanced Instagram post management tool"
          />
          <meta name="theme-color"></meta>
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
          {/* Add other meta tags as needed */}
        </Head>
        {/* head for SEO */}

        <CommentInbox />
      </>
    )
  );
};

export default Comments;
