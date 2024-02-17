import getFormattedDate from "@/lib/format";
import { Revlog } from "@prisma/client";
import React from "react";

type Props = {
  logs: Revlog[];
};

async function LogTable({ logs }: Props) {
  return (
    <div className="mt-2 rounded-lg shadow-md overflow-x-auto w-full sm:w-1/2 h-1/2 ">
      <table className="table table-zebra max-h-1/2">
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>State</th>
            <th>Rating</th>
            <th className="hidden sm:table-cell">elapsed</th>
            <th className="hidden sm:table-cell">scheduled</th>
            <th className="hidden sm:table-cell">duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={log.lid}>
              <th>{index + 1}</th>
              <td>{getFormattedDate(log.review.getTime())}</td>
              <td>{log.state}</td>
              <td>{log.grade}</td>
              <td className="hidden sm:table-cell">{log.elapsed_days}</td>
              <td className="hidden sm:table-cell">{log.scheduled_days}</td>
              <td className="hidden sm:table-cell">{log.duration > 0 ? durationFormat(log.duration) : '/'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogTable;


function durationFormat(duration: number) {
  const division = [60, 60, 24]
  const char = ['s', 'm', 'h', 'd']
  if (duration <= 0) {
    return '/';
  }
  const split_duration = [];
  for (let c of division) {
    split_duration.push(duration % c);
    duration = Math.floor(duration / c);
    if (duration === 0) {
      break;
    }
  }
  if (duration > 0) {
    split_duration.push(duration);
  }
  const res = [];
  for (let i = split_duration.length - 1; i >= 0; i--) {
    if (split_duration[i] > 0) {
      res.push(`${split_duration[i]}${char[i]}`)
    }
  }
  return res.join('');
}