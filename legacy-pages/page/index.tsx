import { useRouter } from "next/router";
import { useEffect } from "react";
const Page = () => {
  const router = useRouter();
  useEffect(() => {
    if (router.route === "/page") {
      router.push("/page/posts");
    }
  }, [router]);
  return null;
};
export default Page;
