'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  NoteList,
  NoteSimpleInfo,
  toggleHiddenNote,
} from '@/actions/userNoteService';
import { Card, CardInput, FSRS, FSRSParameters, fsrs } from 'ts-fsrs';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
export const columns: (f: FSRS, now: number) => ColumnDef<NoteSimpleInfo>[] = (
  f: FSRS,
  now: number
) => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'question',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Question
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue('question')}</div>
      ),
    },
    {
      accessorKey: 'answer',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Answer
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='lowercase'>{row.getValue('answer')}</div>
      ),
    },
    {
      accessorKey: 'source',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Source
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='lowercase' title={row.original.sourceId ?? undefined}>
          {row.getValue('source')}
        </div>
      ),
    },
    {
      accessorKey: 'D',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            D
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='lowercase'>{Number(row.getValue('D')).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: 'S',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            S
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='lowercase'>
          {~~Number(row.getValue('S')).toFixed(0)}
        </div>
      ),
    },
    {
      id: 'R',
      header: ({ column }) => {
        return 'R';
      },
      cell: ({ row }) => {
        const noteSimpleInfo = row.original;
        const cardSimpleInfo: CardInput = {
          difficulty: noteSimpleInfo.D,
          stability: noteSimpleInfo.S,
          due: noteSimpleInfo.due,
          last_review: noteSimpleInfo.last_review,
          reps: noteSimpleInfo.reps,
          state: noteSimpleInfo.state,
          elapsed_days: -1, // get_retrievability not used
          scheduled_days: -1, // get_retrievability not used
          lapses: -1, // get_retrievability not used
        };
        return f.get_retrievability(cardSimpleInfo, now) ?? '/';
      },
    },
    {
      accessorKey: 'reps',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Reps
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='lowercase'>{row.getValue('reps')}</div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const noteSimpleInfo = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(noteSimpleInfo.nid + '')
                }
              >
                Copy note ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(noteSimpleInfo.cid + '')
                }
              >
                Copy Card ID
              </DropdownMenuItem>
              {noteSimpleInfo.sourceId && (
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(noteSimpleInfo.sourceId + '')
                  }
                >
                  Copy Source ID
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Detail</DropdownMenuItem>
              <DropdownMenuItem
                className=' bg-red-500'
                onClick={() => {
                  toggleHiddenNote(noteSimpleInfo.nid, true);
                }}
              >
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};

export default function DataTable({
  data,
  fsrsParams,
  rowCount,
  pageCount,
}: {
  data: NoteList;
  fsrsParams: FSRSParameters;
  rowCount: number;
  pageCount: number;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const f = fsrs(fsrsParams);
  const now = new Date().getTime();

  // Ref:https://tocalai.medium.com/pagination-on-tanstack-table-under-next-js-787ed03198a3
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );
  // handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: Number(searchParams?.get('page') ?? '1') - 1,
      pageSize: Math.ceil(rowCount / pageCount),
    });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  React.useEffect(() => {
    setPagination({
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
  }, [pageIndex, pageSize]);

  // changed the route as well
  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: pageIndex + 1,
        take: pageSize,
      })}`
    );
  }, [pageIndex, pageSize]);

  // Ref: https://tanstack.com/table/latest/docs/api/features/pagination#lastpage
  const table = useReactTable<NoteSimpleInfo>({
    data,
    columns: columns(f, now),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    rowCount,
    pageCount,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });
  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter question...'
          value={
            (table.getColumn('question')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('question')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
          {`( total: ${rowCount} page:${
            table.getState().pagination.pageIndex + 1
          }/${table.getPageCount()} )`}
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
