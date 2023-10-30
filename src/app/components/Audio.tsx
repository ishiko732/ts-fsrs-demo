type Props = {
    url: string;
  };
  
  export default function Audio({ url }: Props) {
    return (
        <>
        <audio src={url} controls>
        </audio>
        </>
    );
  }