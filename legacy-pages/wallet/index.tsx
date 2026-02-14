import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
const Wallet = () => {
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
    if (route === "/wallet") router.push("/wallet/statistics");
    <Link href={"/wallet/statistics"}></Link>;
  }, []);
};

export default Wallet;
