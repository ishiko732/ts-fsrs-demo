type Props = {
  url: string;
};

export default function Video({ url }: Props) {
    const id =url.replace("https://www.youtube.com/watch?v=","")
  return (
    <div className="aspect-w-16 aspect-h-9 flex justify-center" data-url={url}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        // frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}
