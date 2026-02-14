import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Store = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  let route = router.route;
  useEffect(() => {
    if (route === "/store") router.push("/store/products");
    <Link href={"/store/products"}></Link>;
  }, []);
  return (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ Store</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="Bran.cy store management dashboard and overview" />
        <meta name="theme-color" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.brancy.app/store" aria-label="Canonical link" />
      </Head>
      {/* ...rest of the component... */}
    </>
  );
};

export default Store;
