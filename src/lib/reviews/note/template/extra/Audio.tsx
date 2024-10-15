import React, { forwardRef } from 'react';

interface AudioProps extends React.ComponentProps<'audio'> {
  url: string;
}

const Audio = forwardRef<HTMLAudioElement, AudioProps>((props, ref) => {
  const { url, ...restProps } = props;

  return (
    <div className="flex justify-center py-2">
      <audio src={url} controls ref={ref} autoPlay {...restProps}></audio>
    </div>
  );
});

Audio.displayName = 'Audio';

export default Audio;