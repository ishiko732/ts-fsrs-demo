export function get_custom_timezone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}


// https://stackoverflow.com/questions/20712419/get-utc-offset-from-timezone-in-javascript
export function get_timezone_offset(timeZone: string): number {
  const timeZoneName = Intl.DateTimeFormat("ia", {
    timeZoneName: "shortOffset",
    timeZone,
  })
    ?.formatToParts()
    ?.find((i) => i.type === "timeZoneName")?.value;
  if (!timeZoneName) return 0;
  const offset = timeZoneName.slice(3);
  if (!offset) return 0;

  const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
  if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`;

  const [, sign, hour, minute] = matchData;
  let result = parseInt(hour) * 60;
  if (sign === "+") result *= -1;
  if (minute) result += parseInt(minute);

  return result;
}

// https://stackoverflow.com/questions/38399465/how-to-get-list-of-all-timezones-in-javascript
export function get_timezones(){
    return Intl.supportedValuesOf("timeZone");
}