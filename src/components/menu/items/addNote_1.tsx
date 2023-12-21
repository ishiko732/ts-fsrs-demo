"use client";
import React, { useRef } from "react";
import MenuItem from ".";

function AddNoteDialog({
  dialogRef,
}: {
  dialogRef: React.RefObject<HTMLDialogElement>;
}) {
  const questionRef = useRef<HTMLInputElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);
  const handleAppCloseClick = () => {
    dialogRef.current?.close();
  };

  const saveAddNote = () => {
    let question = questionRef.current?.value;
    let answer = answerRef.current?.value;
    fetch(`/api/note`, {
      method: "post",
      body: JSON.stringify({ question, answer }),
    }).then((res) => console.log(res.json()));
    handleAppCloseClick();
  };

  return (
    <dialog id="addNote" className="modal" ref={dialogRef}>
      <div className="modal-box">
        <div className="form-control">
          <div className="flex flex-col item-center gap-4">
            <input
              type="text"
              ref={questionRef}
              placeholder="question"
              className="input input-bordered w-full"
            />
            <input
              type="text"
              ref={answerRef}
              placeholder="answer"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="flex justify-center item-center gap-4 mt-6">
          <button className="btn btn-success" onClick={saveAddNote}>
            Add
          </button>
          <button className="btn" onClick={handleAppCloseClick}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function AddNote() {
  const ref = useRef<HTMLDialogElement>(null);
  const handleAddOpenClick = () => {
    ref.current?.showModal();
  };

  return (
    <MenuItem
      tip="Add Note"
      dialog={<AddNoteDialog dialogRef={ref} />}
      onClick={handleAddOpenClick}
    >
      <svg
        width="24"
        height="24"
        className={"w-6 h-6 dark:fill-white"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z" />
      </svg>
    </MenuItem>
  );
}

export default AddNote;
