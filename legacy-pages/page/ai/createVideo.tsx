import { useSession } from "next-auth/react";
import router from "next/router";

export default function CreateVideo() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  return (
    <div>
      <h1>Create Video Page</h1>
      <p>This is the Create Video page.</p>
    </div>
  );
}
