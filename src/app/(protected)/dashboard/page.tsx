"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function Page() {
  const { data: session } = authClient.useSession();

  const handleSession = async () => {
    await authClient.signOut();
  };

  return (
    <>
      {session ? (
        <>
          <p className="text-red-500">{session.user.name}</p>
          <img
            src={session.user.image as string}
            alt="User Image"
            className="w-20 h-20 rounded-full"
          />
          <Button variant="destructive" onClick={handleSession}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <p className="text-green-500">You are not logged in</p>
          <Link href={"/auth/login"}>Login</Link>
        </>
      )}
    </>
  );
}
