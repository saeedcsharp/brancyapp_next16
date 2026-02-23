import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import NotShopper from "brancy/components/notOk/notShopper";
import ProductList from "brancy/components/store/products/productList";
import { LanguageKey } from "brancy/i18n";
const Products = () => {
  // return (
  //   <>
  //     {<NotShopper />}
  //     <Soon />
  //   </>
  // );

  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  if (!session?.user.isShopper) return <NotShopper />;
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      // session?.user.isShopper &&
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Products)}</title>
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
        {/* <Soon /> */}
        {<ProductList />}
      </>
    )
  );
};

export default Products;
