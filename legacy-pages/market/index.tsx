import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Market = () => {
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
    if (route === "/market") router.push("/market/statistics");
  }, []);
};

export default Market;
