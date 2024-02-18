"use client";

import useQueryParams from "@/hooks/useQueryParams";

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
    setQueryParam([{ queryName: "page", value: `${index}` }]);
  };
  const array = Array.from({ length: count }, (_, i) => i + 1);
  return (
    <div>
      <div className="join flex flex-wrap justify-center py-4 ">
        {array.map((i) => (
          <input
            className="join-item btn btn-square"
            type="radio"
            name="options"
            key={`note-pagination-${i}`}
            aria-label={`${i}`}
            checked={i === cur}
            readOnly
            onClick={() => handleClick(i)}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center pb-4">total:{total}</div>
    </div>
  );
}
