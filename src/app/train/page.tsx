import TrainDisplay from "@/components/train/display";
import FileTrain from "@/components/train/file-train-button";
import OwnTrain from "@/components/train/own-train";
import TrainProgress from "@/components/train/progress";
import FSRSParamTrainForm from "@/components/train/train-form";
import TrainProvider from "@/context/TrainContext";
export default async function Page() {
  return (
    <div className='flex justify-center flex-col items-center'>
      <TrainProvider>
        <FSRSParamTrainForm />
        <TrainDisplay />
        <TrainProgress />
      </TrainProvider>
    </div>
  );
}
