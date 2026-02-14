import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdPayment() {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  if (session && session!.user.currentIndex > -1) router.push("/");
  return (
    session?.user.currentIndex === -1 && (
      <div>
        <h1>Ad_Payment</h1>
      </div>
    )
  );
}
