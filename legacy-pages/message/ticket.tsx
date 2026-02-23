import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import TicketInbox from "brancy/components/messages/ticket/ticketInbox";
import { LoginStatus, packageStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
const Ticket = () => {
  //  return <Soon />;
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
  }, [session]);
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Ticket)}</title>
          <meta name="description" content="Advanced Instagram post management tool" />
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

        <TicketInbox />
      </>
    )
  );
};

export default Ticket;
