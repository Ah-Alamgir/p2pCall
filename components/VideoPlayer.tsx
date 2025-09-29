
import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  stream: MediaStream;
  isMuted: boolean;
  isLocal: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, isMuted, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isMuted}
      className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''}`}
    />
  );
};
