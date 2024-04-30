"use client";

import { useTrainContext } from "@/context/TrainContext";
import { get_custom_timezone, get_timezones } from "@/lib/date";
import { useState, useEffect } from "react";

export default function TimezoneSelector() {
  // https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const { timezone, setTimezone } = useTrainContext();
  const timezones = get_timezones();
  useEffect(() => {
    setTimezone(get_custom_timezone());
    setIsClient(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handlClick = (tz: string) => {
    setTimezone(tz);
  };
  return (
    <label className="form-control w-full max-w-xs pb-4">
      <div className="label">
        <span className="label-text">Select TimeZone</span>
      </div>
      <select
        className="select select-bordered"
        onChange={(e) => handlClick(e.target.value)}
        value={timezone}
      >
        {isClient
          ? timezones.map((tz) => <option key={tz}>{tz}</option>)
          : null}
      </select>
    </label>
  );
}
