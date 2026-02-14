import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
const Advertise = () => {
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
    if (route === "/advertise") router.push("/advertise/calendar");
    <Link href={"/advertise/calendar"}></Link>;
  }, []);
};

export default Advertise;
