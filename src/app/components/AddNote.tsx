"use client";
import React, {createRef, Key, KeyboardEventHandler, useEffect, useRef, useState} from "react";
import { useRouter } from "next/navigation";

export default function AddNote() {
  const ref = useRef<HTMLDialogElement>(null);
  const questionRef = useRef<HTMLInputElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);
  // const extendRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = createRef<HTMLDialogElement>();
  const searchTextRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const handleAddOpenClick = () => {
    ref.current?.showModal();
  };
  const handleAppCloseClick = () => {
    ref.current?.close();
  };

  const handleSearchOpenClick = () => {
    searchRef.current?.showModal();
  };
  const handleSearchCloseClick = () => {
    searchRef.current?.close();
  };
  // @ts-ignore
  const handleSearchKeyDown = (event:KeyboardEventInit<HTMLInputElement>) => {
    if (event.key === 'Enter')
    {
      router.push("/note?s="+searchTextRef.current?.value);
      handleSearchCloseClick()
    }
  };
   const saveAddNote = () => {
    let question = questionRef.current?.value
    let answer= answerRef.current?.value
     fetch(`/api/addNote`, { method: "post",body:JSON.stringify({英単語: question, 意味: answer}) })
       .then((res) =>console.log( res.json()))
    handleAppCloseClick()
  };
  return (
    <>
      <div className="operator-option">
        <i className="add_icon" onClick={handleAddOpenClick}/>
        <i className="search_icon" onClick={handleSearchOpenClick}/>
      </div>
      <dialog id="addNote" className="modal" ref={ref}>

        <div className="modal-box">
            <div className="form-control">
              <div className="flex flex-col item-center gap-4">
              <input type="text" ref={questionRef} placeholder="question" className="input input-bordered w-full"/>
              <input type="text" ref={answerRef} placeholder="answer" className="input input-bordered w-full"/>
              </div>
            </div>

          <div className="flex justify-center item-center gap-4 mt-6">
          <button className="btn btn-success" onClick={saveAddNote}>Success</button>
          <button className="btn" onClick={handleAppCloseClick}>Close</button>
          </div>
        </div>
      </dialog>
      <dialog id="searchNote" className="modal" ref={searchRef}>

        <div className="modal-box">
          <div className="form-control">
            <div className="flex flex-col item-center gap-4">
              <span className="label-text">Click Enter to search</span>
              <input type="text" ref={searchTextRef} placeholder="please entry search word" className="input input-bordered w-full" onKeyDown={handleSearchKeyDown}/>
            </div>
          </div>
        </div>
      </dialog>

    </>

  );
}