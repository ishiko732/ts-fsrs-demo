'use client';

// import { exportLogs } from '@/actions/userLogsService';
// import { getProcessW } from '@/app/api/fsrs/train/train';
// import { useTrainContext } from '@/context/TrainContext';
// import { computerMinuteOffset, get_timezones } from '@/lib/date';
// import { useEffect, useRef } from 'react';
// import { Button } from '../ui/button';
// import { UseFormReturn } from 'react-hook-form';
// import dynamic from 'next/dynamic';

// const NoSSR = dynamic(() => Promise.resolve(), {
//   ssr: false,
// });

export default function DELETE(){
  return <div>DELETE</div>
};

// const timezones = get_timezones();
// function OwnTrain({
//   form,
// }: {
//   form: UseFormReturn<
//     { timezone: string; nextDayStart: number },
//     any,
//     undefined
//   >;
// }) {
//   const workerRef = useRef<Worker>();
//   const trainTimeRef = useRef<number>(0);
//   const startRef = useRef<number>(0);
//   const timeIdRef = useRef<NodeJS.Timeout>();
//   const {
//     loading,
//     setLoading,
//     setW,
//     setLoadTime,
//     setTrainTime,
//     setTotalTime,
//     timezone,
//     nextDayStart,
//     handleProgress,
//   } = useTrainContext();
//   const handleClick = async () => {
//     if (!!~timezones.indexOf(timezone) === false) {
//       form.setError('timezone', { message: 'Invalid timezone' });
//       debugger;
//       return;
//     }
//     if (nextDayStart < 0 || nextDayStart > 24) {
//       form.setError('nextDayStart', { message: 'Invalid next day start' });
//       debugger;
//       return;
//     }
//     setLoading(true);
//     const start = performance.now();
//     startRef.current = start;
//     const logs = await exportLogs();
//     const loadEndTime = performance.now();
//     const cids: bigint[] = [];
//     const eases: number[] = [];
//     const ids: bigint[] = [];
//     const types: number[] = [];
//     logs.forEach((log) => {
//       cids.push(BigInt(log.card_id));
//       ids.push(BigInt(log.review_time));
//       eases.push(log.review_rating);
//       types.push(log.review_state);
//     });
//     setLoadTime(`${(loadEndTime - start).toFixed(5)}ms`);
//     trainTimeRef.current = performance.now();
//     const offset = computerMinuteOffset(timezone, nextDayStart);
//     workerRef.current?.postMessage({
//       offset,
//       cids: new BigInt64Array(cids),
//       eases: new Uint8Array(eases),
//       ids: new BigInt64Array(ids),
//       types: new Uint8Array(types),
//     });
//   };

//   useEffect(() => {
//     workerRef.current = new Worker(
//       new URL('./fsrs_worker.ts', import.meta.url)
//     );
//     workerRef.current.onmessage = (
//       event: MessageEvent<Float32Array | ProgressState>
//     ) => {
//       const endTime = performance.now();
//       console.log(event.data, 'tag' in event.data);
//       if ('tag' in event.data) {
//         const progressState = event.data as ProgressState;
//         if (progressState.tag === 'start') {
//           const { wasmMemoryBuffer, pointer } = progressState;
//           clearInterval(timeIdRef.current);
//           handleProgress(wasmMemoryBuffer, pointer);
//           timeIdRef.current = setInterval(() => {
//             handleProgress(wasmMemoryBuffer, pointer);
//           }, 100);
//         } else if (progressState.tag === 'finish') {
//           clearInterval(timeIdRef.current);
//           console.log('finish');
//         }
//         return;
//       } else {
//         setW(getProcessW(event.data));
//         setTrainTime(`${(endTime - trainTimeRef.current).toFixed(5)}ms`);
//         setTotalTime(`${(endTime - startRef.current).toFixed(5)}ms`);
//         setLoading(false);
//       }
//     };
//     return () => {
//       workerRef.current?.terminate();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//   return (
//     <>
//       <Button
//         disabled={loading}
//         onClick={handleClick}
//         title='Training using your own revlog.'
//         suppressHydrationWarning
//       >
//         Train(by own Revlog)
//       </Button>
//     </>
//   );
// }
