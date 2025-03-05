import { Revlog } from "@prisma/client";
import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DateItem from "@/lib/formatDate";

type Props = {
  logs: Revlog[];
};

async function LogTable({ logs }: Props) {
  const total_duration = logs.reduce((acc, log) => acc + log.duration, 0);
  return (
    <Table>
      <TableCaption >{'Logs'}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px]'>Index(Desc)</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Gard</TableHead>
          <TableHead className='text-right hidden sm:table-cell'>
            elapsed
          </TableHead>
          <TableHead className='text-right hidden sm:table-cell'>
            scheduled
          </TableHead>
          <TableHead className='text-right hidden sm:table-cell'>
            duration
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log, index) => (
          <TableRow key={log.lid}>
            <TableCell className='font-medium'>{index}</TableCell>
            <TableCell>
              <DateItem date={log.review}></DateItem>
            </TableCell>
            <TableCell>{log.state}</TableCell>
            <TableCell>{log.grade}</TableCell>
            <TableCell className='text-right hidden sm:table-cell'>
              {log.elapsed_days}
            </TableCell>
            <TableCell className='text-right hidden sm:table-cell'>
              {log.scheduled_days}
            </TableCell>
            <TableCell className='text-right hidden sm:table-cell'>
              {log.duration > 0 ? durationFormat(log.duration) : '/'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {total_duration > 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total </TableCell>
            <TableCell className='text-right'>{durationFormat(total_duration)}</TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
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
  for (const c of division) {
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