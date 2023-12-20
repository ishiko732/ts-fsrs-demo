import { getAuthSession } from "@/auth/api/auth/[...nextauth]/session";

export default async function Setting(){
    const session = await getAuthSession();
    return <>
        <div>Setting(WIP)</div>
        <div>{JSON.stringify(session?.user)}</div>
    </>;
}