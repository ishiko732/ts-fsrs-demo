import Github from "@/components/Github";
import Link from "next/link";
import { FSRSVersion } from "ts-fsrs";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-24">
      <div className="my-4 text-xl">TS-FSRS-DEMO<Github name="ishiko732/ts-fsrs-demo"/></div>
      <div className="my-4 text-lg">
        USE VERSION:
        <Link href={`https://www.npmjs.com/package/ts-fsrs/v/${FSRSVersion}`} target="_blank">
          <span className="underline underline-offset-2 hover:text-indigo-500">{FSRSVersion}</span>
        </Link>
      </div>
      <div className="divider">USE</div>
      <div>
        <Link href={"/note"}>
          <button className="btn btn-outline mx-4">Go to Notes</button>
        </Link>
        <Link href={"/card"}>
          <button className="btn btn-outline mx-4">Go to Review</button>
        </Link>
      </div>
    </main>
  );
}
