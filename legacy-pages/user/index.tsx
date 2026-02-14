import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const UserPanel = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  let route = router.route;
  async function checkUserLogin() {
    if (route === "/user") router.push("/user/home");
  }
  useEffect(() => {
    checkUserLogin();
  }, []);
};

export default UserPanel;
