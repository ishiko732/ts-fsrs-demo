import { getNotes } from '@/lib/note'
import React, { cache } from 'react'

export const getData = cache(async (start:number) => {
    console.log("cache miss:"+start)
    const notes = await getNotes(start===0?undefined:start)
    return notes
  })

export default async function Page({searchParams}: {searchParams:{take:string}}) {
    const take =searchParams["take"]?Number(searchParams["take"]):0
    const notes = await getData(take)
  return (
    <>
        <div>Notes{`(${notes.length})`}:</div>
        {notes.map((note) => <li key={note.nid}>{note.question}:{note.answer}</li>)}
    </>
  )
}
