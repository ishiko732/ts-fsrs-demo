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
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={log.lid}>
              <th>{index + 1}</th>
              <td>{getFormattedDate(log.review)}</td>
              <td>{log.state}</td>
              <td>{log.grade}</td>
              <td className="hidden sm:table-cell">{log.elapsed_days}</td>
              <td className="hidden sm:table-cell">{log.scheduled_days}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogTable;
