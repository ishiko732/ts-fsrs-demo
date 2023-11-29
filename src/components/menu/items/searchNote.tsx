"use client";
import React, { createRef, useRef } from "react";
import MenuItem from ".";
import useQueryParams from "@/hooks/useQueryParams";

function SearchNoteDialog({
  dialogRef,
}: {
  dialogRef: React.RefObject<HTMLDialogElement>;
}) {
  const { setQueryParam } = useQueryParams();
  const searchTextRef = useRef<HTMLInputElement>(null);
  function handleChange(value: string) {
    setQueryParam("s", value);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearchCloseClick();
    }
  }
  const handleSearchCloseClick = () => {
    dialogRef.current?.close();
  };
  return (
    <dialog id="searchNote" className="modal" ref={dialogRef}>
      <div className="modal-box">
        <div className="form-control">
          <div className="flex flex-col item-center gap-4">
            <span className="label-text">Click Enter to close</span>
            <input
              type="text"
              ref={searchTextRef}
              placeholder="please entry search word"
              className="input input-bordered w-full"
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function SearchNote() {
  const ref = createRef<HTMLDialogElement>();
  const handleSearchOpenClick = () => {
    ref.current?.showModal();
  };
  return (
    <MenuItem
      tip="Search Note"
      dialog={<SearchNoteDialog dialogRef={ref} />}
      onClick={handleSearchOpenClick}
    >
      <svg
        width="24"
        height="24"
        className={"w-6 h-6 dark:fill-white"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007z" />
      </svg>
    </MenuItem>
  );
}

export default SearchNote;
