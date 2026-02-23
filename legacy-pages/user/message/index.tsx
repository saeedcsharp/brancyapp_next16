import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import UserPanelDirectInbox from "../../../components/userPanel/message/ticketInbox";
import { LanguageKey } from "../../../i18n";
import styles from "./ticket.module.css";

function Messages() {
  //  return <Soon />;
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  if (session && session!.user.currentIndex > -1) router.push("/");
  return (
    session?.user.currentIndex === -1 && (
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
        <main>
          <div className={styles.header}>
            <div className="title">{t(LanguageKey.userpanel_TicketSupport)}</div>
            <div className="title">{t(LanguageKey.userpanel_TicketSupportExplain)}</div>
          </div>
          <UserPanelDirectInbox />
        </main>
      </>
    )
  );
}

export default Messages;
