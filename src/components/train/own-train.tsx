import { getAuthSession } from "@/app/(auth)/api/auth/[...nextauth]/session";
import { exportLogsByUid } from "@/lib/log";
import OwnTrainButton from "./own-train-button";
import TrainDisplay from "./display";

export default async function OwnTrain() {
  const session = await getAuthSession();
  const getUserRevlog = async (uid: number) => {
    "use server";
    return exportLogsByUid(uid);
  };

  if (!session || !session.user?.id) {
    return null;
  }
  const getRevlogAction = getUserRevlog.bind(null, Number(session.user.id));
  return (
    <div className="label flex  flex-col gap-2">
      <OwnTrainButton action={getRevlogAction} />
      <span className="label-text">Training using your own revlog.</span>
    </div>
  );
}
