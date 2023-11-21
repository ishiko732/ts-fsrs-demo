type Props = {
    url: string;
  };
  
  export default function Audio({ url }: Props) {
    return (
        <div className="flex justify-center py-2">
        <audio src={url} controls>
        </audio>
        </div >
    );
  }