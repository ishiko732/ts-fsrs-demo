"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

// This component is used to sign out the user
export default function SignOut({ check }: { check?: boolean }) {
  useEffect(() => {
    check && signOut();
  }, [check]);
  return null;
}
