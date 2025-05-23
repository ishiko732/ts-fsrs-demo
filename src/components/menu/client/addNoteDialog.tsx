'use client'
import client from '@server/libs/rpc'
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AddNoteDialog({ tip }: { tip: string }) {
  const questionRef = useRef<HTMLInputElement>(null)
  const answerRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  const saveAddNote = () => {
    const question = questionRef.current?.value ?? ''
    const answer = answerRef.current?.value ?? ''
    setOpen(false)
    new Promise<void>(async (resolve) => {
      const { deckId } = await client.decks.default.$get().then((res) => res.json())
      toast.promise(
        client.notes.$post({
          json: {
            did: deckId,
            question,
            answer,
            source: 'Manual',
          },
        }),
        {
          loading: 'Adding...',
          success: async () => 'Note added',
          error: (error) => {
            return error
          },
          finally: () => {
            resolve()
          },
        },
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'outline'} className="w-full" aria-label={tip}>
          <svg width="24" height="24" className={'w-6 h-6 dark:fill-white'} xmlns="http://www.w3.org/2000/svg">
            <path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add a question and answer to your notes.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="question" className="text-right">
              Question
            </Label>
            <Input id="question" defaultValue="question" className="col-span-3" ref={questionRef} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="answer" className="text-right">
              Answer
            </Label>
            <Input id="answer" defaultValue="answer" className="col-span-3" ref={answerRef} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={saveAddNote}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
