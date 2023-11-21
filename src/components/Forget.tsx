
'use client'
import { useRouter } from "next/navigation";
import React from 'react'

type Props = {
    cid: Number;
    className?: string;
  };

export default function Forget({cid,className}:Props) {
    const router = useRouter();
    const handleClick = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      ) => {
        fetch(`/api/fsrs?cid=${cid}&grade=0&reset=1`, {
          method: "put",
        })
          .then(() => router.refresh())
      };
  return (
    <button className={"btn "+className} onClick={handleClick}>
    Forget
  </button>
  )
}
