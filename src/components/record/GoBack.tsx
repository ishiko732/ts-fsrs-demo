"use client";
import { useRouter } from "next/navigation";

export default function GoBack() {
  const router = useRouter();
  return (
    <button
      className="btn btn-lg btn-outline bg-slate-100 text-black hover:text-white"
      onClick={() => router.back()}
    >
      Go Back
    </button>
  );
}
