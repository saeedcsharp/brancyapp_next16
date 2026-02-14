import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
const Message = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  let route = router.route;
  useEffect(() => {
    if (session?.user.currentIndex === -1) router.push("/user");
    if (route === "/message") router.push("/message/direct");
  }, []);
};

export default Message;
