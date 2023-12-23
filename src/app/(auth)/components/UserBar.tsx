import Image from "next/image";
import type { User } from "next-auth";
import Link from "next/link";
import Github from "@/components/Github";
import ToggleTheme from "./toggleTheme";
import OpenSetting from "@/components/settings/OpenSetting";

type Props = {
  user?: User;
};

export default async function UserBar({ user }: Props) {
  return (
    <div className="navbar bg-base-100 justify-between">
      <div className="sm:flex-1">
        <Link className="btn btn-ghost text-xl hidden sm:flex" href={"#"}>TS-FSRS-DEMO</Link>
        <Github name="ishiko732/ts-fsrs-demo" />
        {!user ? <ToggleTheme /> : null}
      </div>
      {user ? (
        <div>
          <div className="pr-4 btn btn-ghost text-xl"> {user.name}</div>
          <div className="sm:flex-non">
            <div className="dropdown dropdown-end" id = "toggleShow">
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
                  <OpenSetting/>
                </li>
                <li>
                  <Link href="/api/auth/signout">Logout</Link>
                </li>
                <div className="divider">theme</div>
                <div className="flex justify-center items-center">
                  <ToggleTheme />
                </div>
              </ul>

            </div>
          </div>
        </div>
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
