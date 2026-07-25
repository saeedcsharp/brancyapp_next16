import { useSession } from "next-auth/react";
import router from "next/router";
export default function CreateImage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  return (
    <div>
      <h1>Create Image Page</h1>
      <p>This is the Create Image page.</p>
    </div>
  );
}
