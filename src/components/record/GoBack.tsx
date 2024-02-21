"use client";
import { useRouter } from "next/navigation";

export default function GoBack() {
  const router = useRouter();
  return (
    <button
      className="btn btn-outline"
      onClick={() => {
        router.push("/note")
      }}
    >
      Go Notes
    </button>
  );
}
