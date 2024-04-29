"use client";

import { useTrainContext } from "@/context/TrainContext";
import { get_timezones } from "@/lib/date";

export default function TimezoneSelector() {
  const { timezone, setTimezone } = useTrainContext();

  const timezones = get_timezones();

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
      >
        {timezones.map((tz) => (
          <option key={tz} selected={timezone === tz}>
            {tz}
          </option>
        ))}
      </select>
    </label>
  );
}
