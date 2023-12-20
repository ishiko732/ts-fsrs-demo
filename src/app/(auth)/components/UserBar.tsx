import Image from "next/image";
import type { User } from "next-auth";
import Link from "next/link";
import Github from "@/components/Github";
import ToggleTheme from "./toggleTheme";

type Props = {
  user?: User;
};

export default async function UserBar({ user }: Props) {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl hidden sm:flex" href={"#"}>TS-FSRS-DEMO</Link>
        <Github name="ishiko732/ts-fsrs-demo" />
        <ToggleTheme/>
      </div>
      {user ? (
        <>
          <div className="pr-4 btn btn-ghost text-xl"> {user.name}</div>
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user?.name ?? "Profile Pic"}
                      width={40}
                      height={40}
                    ></Image>
                  ) : null}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <Link href="/api/auth/signout">Logout</Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-none">
          <Link href={"/api/auth/signin"}>
            <button className="btn btn-outline mr-6 p-2">Sign In</button>
          </Link>
        </div>
      )}
    </div>
  );
}
