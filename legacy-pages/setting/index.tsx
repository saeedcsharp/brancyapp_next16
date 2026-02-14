import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Setting = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  useEffect(() => {
    if (session?.user.currentIndex === -1) router.push("/user");
    if (router.route === "/setting") {
      router.push("/setting/general");
    }
  }, []);

  return <></>;
};

export default Setting;
