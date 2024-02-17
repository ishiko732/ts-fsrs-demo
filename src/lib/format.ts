import { headers } from "next/headers";

export default function getFormattedDate(date: Date | string): string {
  try {
    const lang = headers().get("accept-language")?.split(",")[0].toUpperCase()!;
    return new Intl.DateTimeFormat(lang, {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(date));
  } catch (ex: unknown) {
    return new Intl.DateTimeFormat("en-us", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(date));
  }
}
