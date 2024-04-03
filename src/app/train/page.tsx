import TrainDisplay from "@/components/train/display";
import FileTrain from "@/components/train/file-train-button";
import OwnTrain from "@/components/train/own-train";
import TrainProvider from "@/context/TrainContext";
export default async function Page() {
  return (
    <div className="flex justify-center flex-col items-center">
      <TrainProvider>
        <OwnTrain />
        <FileTrain/>
        <TrainDisplay />
      </TrainProvider>
    </div>
  );
}
