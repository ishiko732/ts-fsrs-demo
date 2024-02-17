"use client";

import useQueryParams from "@/hooks/useQueryParams";

export default function NotePagination({
  cur,
  count,
}: {
  cur: number;
  count: number;
}) {
  const { setQueryParam } = useQueryParams();
  const handleClick = (index: number) => {
    setQueryParam([{ queryName: "page", value: `${index}` }]);
  };
  const array = Array.from({ length: count }, (_, i) => i + 1);
  return (
    <div className="join flex flex-wrap justify-center py-4">
      {array.map((i) => (
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          key={`note-pagination-${i}`}
          aria-label={`${i}`}
          checked={i === cur}
          onClick={() => handleClick(i)}
        />
      ))}
    </div>
  );
}
