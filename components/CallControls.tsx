
import React from 'react';
import { MicrophoneOnIcon, MicrophoneOffIcon, VideoOnIcon, VideoOffIcon, EndCallIcon } from './Icons';

interface CallControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({ 
  isMuted, 
  isVideoEnabled, 
  onToggleMute, 
  onToggleVideo, 
  onEndCall 
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 bg-dark-surface/80 backdrop-blur-sm p-3 rounded-full shadow-lg">
      <button 
        onClick={onToggleMute} 
        className={`p-3 rounded-full transition-colors duration-200 ${isMuted ? 'bg-red-600 text-white' : 'bg-gray-600/70 hover:bg-gray-500/70 text-dark-text'}`}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicrophoneOffIcon /> : <MicrophoneOnIcon />}
      </button>
      <button 
        onClick={onToggleVideo} 
        className={`p-3 rounded-full transition-colors duration-200 ${!isVideoEnabled ? 'bg-red-600 text-white' : 'bg-gray-600/70 hover:bg-gray-500/70 text-dark-text'}`}
        aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
      </button>
      <button 
        onClick={onEndCall} 
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
        aria-label="End call"
      >
        <EndCallIcon />
      </button>
    </div>
  );
};
