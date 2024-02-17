"use client";
import { useHydration } from "@/hooks/useHydration";
import { Suspense } from "react";
import { DateInput } from "ts-fsrs";

export default function FormattedDate({lang,date}:{lang: string, date: DateInput}) {
  const hydrated = useHydration();
  return (
    <Suspense key={hydrated ? 'client' : 'server'}>
      {hydrated ? dateTimeFormat(lang, date) : new Date(date).toDateString()}
    </Suspense>
  );
}

function dateTimeFormat(lang: string, date: DateInput): string {
  try {
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
