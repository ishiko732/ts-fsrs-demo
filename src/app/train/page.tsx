import TrainDisplay from '@/components/train/display';
import TrainProgress from '@/components/train/progress';
import FSRSParamTrainForm from '@/components/train/train-form';
import TrainProvider from '@/context/TrainContext';
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
