import TrainDisplay from "@/components/train/display";
import FileTrain from "@/components/train/file-train-button";
import NextDayStartAt from "@/components/train/nextDayStartAt";
import OwnTrain from "@/components/train/own-train";
import TrainTestButton from "@/components/train/test-button";
import TimezoneSelector from "@/components/train/timezones";
import TrainProvider from "@/context/TrainContext";
export default async function Page() {
  return (
    <div className="flex justify-center flex-col items-center">
      <TrainProvider>
        <TimezoneSelector />
        <NextDayStartAt />
        <OwnTrain />
        <FileTrain />
        <TrainDisplay />
        <TrainTestButton />
      </TrainProvider>
    </div>
  );
}
