import Link from "next/link";
import { FSRSVersion } from "ts-fsrs";
import { options } from "@/auth/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import UserBar from "@/auth/components/UserBar";

export default async function Home() {
  const session = await getServerSession(options);
  return (
    <>
      <UserBar user={session?.user} />
      <main className="flex flex-col min-h-screen items-center justify-center p-24">
        <div className="my-4 text-xl">TS-FSRS-DEMO</div>
        <div className="my-4 text-lg">
          USE VERSION:
          <Link
            href={`https://www.npmjs.com/package/ts-fsrs/v/${FSRSVersion}`}
            target="_blank"
          >
            <span className="underline underline-offset-2 hover:text-indigo-500">
              {FSRSVersion}
            </span>
          </Link>
        </div>
        <div className="divider">USE</div>
        <div>
          <Link href={session?.user ? "/note" : "/api/auth/signin"}>
            <button className="btn btn-outline mx-4">Go to Notes</button>
          </Link>
          <Link href={session?.user ? "/note" : "/api/auth/signin"}>
            <button className="btn btn-outline mx-4">Go to Review</button>
          </Link>
        </div>
      </main>
    </>
  );
}
