import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Title = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    if (!session) return;
    if (session?.user.currentIndex === -1) router.push("/user");
  }, [session]);
  return session && session!.user.currentIndex !== -1 && <div></div>;
};

export default Title;
