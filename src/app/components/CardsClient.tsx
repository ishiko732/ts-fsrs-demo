'use client'
import { Note,Card } from '@prisma/client'
import React from 'react'
import QACard from './QACard'


export default function CardClient({ noteBox}:{ noteBox: Array<Array<Note & { card: Card}>>}) {
    const [NewCard,LearningCard,RelearningCard,ReviewCard] = noteBox
    const {currentType,index}={currentType:0,index:0}

  return (
    <div>
        <div>New:{NewCard.length},Process:{LearningCard.length+RelearningCard.length},Review:{RelearningCard.length}</div>
        <hr/>
        <QACard note={noteBox[currentType][index]}/>
    </div>

  )
}
