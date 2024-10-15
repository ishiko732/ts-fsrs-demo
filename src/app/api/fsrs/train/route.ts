import { NextResponse } from 'next/server';
// import { Readable } from 'stream';
// import { getProcessW, loadCsvAndTrain } from './train';
// import { computerMinuteOffset } from '@/lib/date';

// @deprecated
// export async function GET(request: NextRequest) {
//   const url = new URL(request.url);
//   const searchParams = new URLSearchParams(url.search);

//   const fileURL = searchParams.get("url") ?? `${url.origin}/revlog.csv`;
//   const timezone = searchParams.get("timezone") ?? "UTC";
//   const nextDayStart = searchParams.get("nextDayStart") ?? "4";
//   const offset = computerMinuteOffset(timezone, Number(nextDayStart));
//   const stream = await getReadStream(fileURL);

//   const wasmURL = new URL("./fsrs_browser_bg.wasm", url.origin);
//   const { w, ...others } = await loadCsvAndTrain(wasmURL, stream, offset);

//   return NextResponse.json({
//     data: fileURL,
//     w: getProcessW(w),
//     wasmURL: wasmURL.toString(),
//     ...others,
//   });
// }

// export async function POST(request: NextRequest) {
//   const formData = await request.formData();
//   const file = formData.get("file") as File | null;
//   if (!file) {
//     return NextResponse.json({ error: "No file" }, { status: 400 });
//   }
//   const filename = file.name.replaceAll(" ", "_");
//   const buffer = Buffer.from(await file.arrayBuffer());
//   const stream = Readable.from(buffer);
//   const wasmURL = new URL("fsrs_browser_bg.wasm", new URL(request.url).origin);
//   const timezone = formData.get("timezone") ?? "UTC";
//   const nextDayStart = formData.get("nextDayStart") ?? "4";
//   const offset = computerMinuteOffset(String(timezone), Number(nextDayStart));
//   const { w, ...others } = await loadCsvAndTrain(wasmURL, stream, offset);

//   return NextResponse.json({
//     fileName: filename,
//     w: getProcessW(w),
//     wasmURL: wasmURL.toString(),
//     ...others,
//   });
// }

// async function getReadStream(fileURL: string) {
//   const body = await fetch(fileURL).then((res) => res.body);
//   if (!body) {
//     throw new Error("Failed to fetch file");
//   }
//   const reader = body.getReader();
//   return new Readable({
//     async read() {
//       const { done, value } = await reader.read();

//       if (done) {
//         this.push(null);
//         return;
//       }

//       this.push(value);
//     },
//   });
// }

async function handler() {
  return NextResponse.json({ message: '@deprecated' });
}
export { handler as GET, handler as POST };
