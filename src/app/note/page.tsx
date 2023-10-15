import { getNotes } from '@/lib/note'
import React from 'react'

export default async function Page() {
    const notes = await getNotes()
  return (
    <>
        <div>Notes:</div>
        {notes.map((note) => <li key={note.nid}>{note.question}:{note.answer}</li>)}
    </>


  )
}
