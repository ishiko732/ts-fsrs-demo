import { getAuthSession } from "@/app/(auth)/api/auth/[...nextauth]/session";
import { getFSRSParamsByUid } from "@/lib/fsrs";
import CheckParams from "./CheckParams";
import FSRSConfig from "./FSRSConfig";

export default async function FSRSSetting() {
  const session = await getAuthSession();
  if (!session?.user) {
    return null;
  }
  const username = session.user?.name;
  const uid = Number(session.user.id);
  let params = null;
  try {
    params = await getFSRSParamsByUid(uid);
  } catch (e) {
    console.error(e);
    console.debug("auto logout");
  }
  return params === null ? (
    <CheckParams check={true} />
  ) : (
    <FSRSConfig params={params} uid={uid} username={username || ""} />
  );
}
