"use client";
import React, {createRef, useRef} from "react";
import { useRouter } from "next/navigation";
import useQueryParams from "@/app/hooks/useQueryParams";

export default function AddNote() {
  const { setQueryParam } = useQueryParams();
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
    ref.current?.close()
  };

  const handleSearchOpenClick = () => {
    searchRef.current?.showModal();
  };
  const handleSearchCloseClick = () => {
    searchRef.current?.close();
  };

  function handleChange(value:string) {
    setQueryParam('s', value);
 }


  function handleSearchKeyDown(e:React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearchCloseClick()
    }
  }

   const saveAddNote = () => {
    let question = questionRef.current?.value
    let answer= answerRef.current?.value
     fetch(`/api/note`, { method: "post",body:JSON.stringify({英単語: question, 意味: answer}) })
       .then((res) =>console.log( res.json()))
    handleAppCloseClick()
  };
  return (
    <>
      <div className="operator-option">
        <i className="w-12 h-12 inline-block hover:cursor-pointer" onClick={handleAddOpenClick}>
        <svg width="96" height="96" className={"w-6 h-6 hover:fill-amber-400"} xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z"/></svg>
        </i>
        <i onClick={handleSearchOpenClick} className="w-6 h-6 inline-block hover:cursor-pointer">
          <svg clip-rule="evenodd" fill-rule="evenodd" 
           width="96" height="96"
          className={"w-12 h-12 hover:fill-amber-400"}
          xmlns="http://www.w3.org/2000/svg"><path d="m15.97 17.031c-1.479 1.238-3.384 1.985-5.461 1.985-4.697 0-8.509-3.812-8.509-8.508s3.812-8.508 8.509-8.508c4.695 0 8.508 3.812 8.508 8.508 0 2.078-.747 3.984-1.985 5.461l4.749 4.75c.146.146.219.338.219.531 0 .587-.537.75-.75.75-.192 0-.384-.073-.531-.22zm-5.461-13.53c-3.868 0-7.007 3.14-7.007 7.007s3.139 7.007 7.007 7.007c3.866 0 7.007-3.14 7.007-7.007s-3.141-7.007-7.007-7.007z" fill-rule="nonzero"/></svg>
        </i>
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
          <button className="btn btn-success" onClick={saveAddNote}>Add</button>
          <button className="btn" onClick={handleAppCloseClick}>Close</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <dialog id="searchNote" className="modal" ref={searchRef}>
        <div className="modal-box">
          <div className="form-control">
            <div className="flex flex-col item-center gap-4">
              <span className="label-text">Click Enter to close</span>
              <input type="text" ref={searchTextRef}
              placeholder="please entry search word"
              className="input input-bordered w-full"
              onChange={(e)=>handleChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}/>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </>

  );
}