"use client";

import useQueryParams from "@/hooks/useQueryParams";
import { ReadonlyURLSearchParams } from "next/navigation";

// @deprecated
function diplayArrow(queryParams: ReadonlyURLSearchParams, target: string) {
  if (queryParams.get("o") === target.toLowerCase()) {
    return queryParams.get("ot") === "desc" ? "▼" : "▲";
  }
  return null;
}
export default function TableHeader() {
  const { queryParams, setQueryParam } = useQueryParams();

  const handleClick = (
    e: React.MouseEvent<HTMLTableCellElement, MouseEvent>
  ) => {
    const field = (e.target as HTMLTableCellElement)
      .innerText!.toLowerCase()
      .replace(/[^a-zA-Z]/g, "");

    const type = queryParams.get("ot") === "desc" ? "asc" : "desc";
    setQueryParam([
      { queryName: "o", value: field },
      { queryName: "ot", value: type },
    ]);
  };
  return (
    <>
      <tr>
        <th className="hidden sm:table-cell">Index</th>
        <th onClick={handleClick} className="hover:bg-gray-200 cursor-pointer">
          Question{diplayArrow(queryParams, "question")}
        </th>
        <th className="hidden sm:table-cell">Answer {diplayArrow(queryParams, "Answer")}</th>
        <th onClick={handleClick} className="hover cursor-pointer hidden sm:table-cell">
          Source {diplayArrow(queryParams, "source")}
        </th>
        <th onClick={handleClick} className="hover cursor-pointer hidden sm:table-cell">
          D {diplayArrow(queryParams, "d")}
        </th>
        <th onClick={handleClick} className="hover cursor-pointer hidden sm:table-cell">
          S {diplayArrow(queryParams, "s")}
        </th>
        <th className="hidden sm:table-cell">R {diplayArrow(queryParams, "R")}</th>
        <td onClick={handleClick} className="hover cursor-pointer">
          Due {diplayArrow(queryParams, "due")}
        </td>
        <td onClick={handleClick} className="hover cursor-pointer">
          State {diplayArrow(queryParams, "state")}
        </td>
        <td onClick={handleClick} className="hover cursor-pointer hidden sm:table-cell">
          Reps {diplayArrow(queryParams, "reps")}
        </td>
        <td>Operation</td>
      </tr>
    </>
  );
}
