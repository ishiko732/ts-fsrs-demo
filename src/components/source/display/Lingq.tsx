import type { TCardDetail } from '@server/services/decks/cards'

export default async function DisplayMsg({ note }: { note: TCardDetail }) {
  const extend = note.extend as Partial<Lingq>
  const fragment = extend.fragment!
  const tags = extend.tags
  const words = extend.words
  const transliteration = extend.transliteration
  const hints = extend.hints
  return (
    <div className="item-center w-full">
      <div className="w-full">
        <span className="flex justify-center items-center text-2xl">
          {note.question}
          {/* <span className="badge">{note.answer}</span> */}
        </span>
        <div className="flex justify-center flex-col items-center text-sm opacity-60">
          <div> {transliteration && <MergeTransliteration {...transliteration} />}</div>
          <div>
            {tags?.map((tag) => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
            {words?.map((word) => (
              <span key={word} className="badge badge-ghost">
                {word}
              </span>
            ))}
          </div>
          <div>
            <HighlightedWord text={fragment} word={note.question} />
          </div>
        </div>
      </div>
      <div className="pt-4 m-4">
        <ul>
          {hints?.map((hint) => (
            <li key={hint.id}>
              <span className="badge">{hint.locale}</span>
              {hint.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function MergeTransliteration(transliteration: LingqTransliteration) {
  function mergeText(text: string | string[] | { [key: string]: string }[] | { [key: string]: string }) {
    if (text === undefined) {
      return ''
    }
    if (Array.isArray(text)) {
      let merge = ''
      for (const t of text) {
        merge += mergeText(t)
      }
      return merge
    }
    if (typeof text === 'string') {
      return text
    }
    return Object.keys(text)
      .map((key) => `${key}${text[key]}`)
      .join('')
  }
  return Object.keys(transliteration).map((key) => (
    <span key={key} className="badge badge-ghost">
      {key}:{mergeText(transliteration[key])}
    </span>
  ))
}

export function HighlightedWord({ text, word }: { text: string; word: string }) {
  const parts = text.split(new RegExp(`(${word})`, 'gi'))

  return <span>{parts.map((part, index) => (part.toLowerCase() === word.toLowerCase() ? <strong key={index}>{part}</strong> : part))}</span>
}
