import getFormattedDate from "@/lib/format";
import { Revlog } from "@prisma/client";
import React from "react";

type Props = {
  logs: Revlog[];
};

async function LogTable({ logs }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>State</th>
            <th>Rating</th>
            <th>elapsed</th>
            <th>scheduled</th>
      
          </tr>
        </thead>
        <tbody>
          {logs.map((log,index) => (
            <tr key={log.lid}>
              <th>{index+1}</th>
              <td>{getFormattedDate(log.review)}</td>
              <td>{log.state}</td>
              <td>{log.grade}</td>
              <td>{log.elapsed_days}</td>
              <td>{log.scheduled_days}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogTable;
