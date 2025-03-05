"use client";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";

export default function GoHome() {
  const router = useRouter();
  return (
    <Button onClick={() => router.replace('/')}>
      Go Home
    </Button>
  );
}
