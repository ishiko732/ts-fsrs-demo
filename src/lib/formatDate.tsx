import { headers } from "next/headers";
import DateItem from "@/components/DateItem";
import { DateInput } from "ts-fsrs";

function getLang() {
  return (
    headers().get("accept-language")?.split(",")[0].toUpperCase()! || "en-us"
  );
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
