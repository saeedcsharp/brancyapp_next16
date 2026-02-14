import { useSession } from "next-auth/react";

export default function Password() {
  const { data: session, update } = useSession();
  async function handleShowPassword() {
    await update({
      ...session,
      user: {
        ...session?.user,
        loginStatus: 0,
      },
    });
  }
  return (
    <>
      <h1 style={{ color: "red" }}>Getting password</h1>;<button onClick={handleShowPassword}>click</button>
    </>
  );
}
