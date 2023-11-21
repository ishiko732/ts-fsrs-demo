"use client";
import { useRouter } from "next/navigation";

export default function GoHome() {
  const router = useRouter();
  return (
    <button
      className="btn btn-primary"
      onClick={() => router.replace("/")}
    >
      Go Home
    </button>
  );
}
