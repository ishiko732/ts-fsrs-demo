import { Badge } from '@/components/ui/badge';

export function MergeAnswer({ answer }: { answer: string }) {
  // 将hiragana:プライベートレッスン;romaji:puraibeetoressun;
  // 根据冒号分割成数组，分成key:value; 两部分
  // 然后根据key:value的值进行拼接
  const parts = answer.split(';');
  const result: { [key: string]: string } = {};
  parts.forEach((part) => {
    const [key, value] = part.split(':');
    result[key] = value;
  });

  return Object.entries(result).map(([key, value]) => (
    <div key={key}>
      {value ? (
        <Badge className='badge badge-ghost'>{`${key} : ${value}`}</Badge>
      ) : (
        <Badge className='badge badge-ghost'>{`${key}`}</Badge>
      )}
    </div>
  ));
}

export function HighlightedWord({
  text,
  word,
}: {
  text: string;
  word: string;
}) {
  const parts = text.split(new RegExp(`(${word})`, 'gi'));

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <strong key={index}>{part}</strong>
        ) : (
          part
        )
      )}
    </span>
  );
}
