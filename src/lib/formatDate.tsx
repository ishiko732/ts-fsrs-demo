import { headers, type UnsafeUnwrappedHeaders } from "next/headers";
import DateItem from "@/components/DateItem";
import { DateInput } from "ts-fsrs";

function getLang() {
  return ((headers() as unknown as UnsafeUnwrappedHeaders).get("accept-language")?.split(",")[0].toUpperCase()! || "en-us");
}

export default function FormattedDate({
  date,
}: {
  date: DateInput;
}): React.ReactNode {
  if (date) {
    const lang = getLang();
    return <DateItem lang={lang} date={date}/>;
  } else {
    return null;
  }
}
