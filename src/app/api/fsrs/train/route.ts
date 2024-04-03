import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
// import { Worker } from "worker_threads";
import { loadCsvAndTrain } from "./train";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const fileURL = searchParams.get("url") ?? "http://localhost:3000/revlog.csv";
  const stream = await getReadStream(fileURL);
  const { w, ...others } = await loadCsvAndTrain(stream);

  return NextResponse.json({
    data: fileURL,
    w: getProcessW(w),
    ...others,
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const filename = file.name.replaceAll(" ", "_");
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buffer);
  const { w, ...others } = await loadCsvAndTrain(stream);

  return NextResponse.json({
    fileName: filename,
    w: getProcessW(w),
    ...others,
  });
}

async function getReadStream(fileURL: string) {
  const body = await fetch(fileURL).then((res) => res.body);
  if (!body) {
    throw new Error("Failed to fetch file");
  }
  const reader = body.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();

      if (done) {
        this.push(null);
        return;
      }

      this.push(value);
    },
  });
}

function getProcessW(w: Float32Array) {
  const processed_w = [];
  for (let i = 0; i < w.length; i++) {
    processed_w.push(Number(w[i].toFixed(8)));
  }
  return processed_w;
}
