import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (kvs: { queryName: string; value: string }[]) => {
      const params = new URLSearchParams(searchParams);
      kvs.forEach(({ queryName, value }) => {
        params.set(queryName, value);
      });
      return params.toString();
    },
    [searchParams]
  );

  const setQueryParam = (kvs: { queryName: string; value: string }[]) => {
    router.push(`${pathname}?${createQueryString(kvs)}`);
  };

  return { queryParams: searchParams, createQueryString, setQueryParam };
}
