'use client';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import useQueryParams from '@/hooks/useQueryParams';

function genPageArray(cur: number, count: number) {
  const array = [];
  if (count > 3) {
    array.push(1);
    array.push(2);
  }
  if (cur > 2 && cur < count - 1) {
    array.push(-1);
    array.push(cur - 1);
    array.push(cur);
    array.push(cur + 1);
    array.push(-1);
  }
  if (count > 1) {
    array.push(count - 1);
  }
  array.push(count);
  return array;
}

export default function NotePagination({
  cur,
  count,
  total,
}: {
  cur: number;
  count: number;
  total: number;
}) {
  const { setQueryParam } = useQueryParams();
  const handleClick = (index: number) => {
    setQueryParam([{ queryName: 'page', value: `${index}` }]);
  };
  const array = genPageArray(cur, count);
  return (
    <>
      <Pagination>
        <PaginationContent>
          {cur !== 1 && (
            <PaginationItem>
              <PaginationPrevious href='#' />
            </PaginationItem>
          )}
          {array.map((i) => (
            <PaginationItem key={`note-pagination-${i}`}>
              {i !== -1 ? (
                <PaginationLink
                  onClick={() => handleClick(i)}
                  isActive={i === cur}
                >
                  {i}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          {cur !== array.length && (
            <PaginationItem>
              <PaginationNext href='#' />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
      <div className='flex flex-wrap justify-center pb-4'>total:{total}</div>
    </>
  );
}
