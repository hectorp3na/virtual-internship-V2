import React from "react";

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRewind: () => void;
  onForward: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ isPlaying, onPlayPause, onRewind, onForward }) => (
  <div className="flex items-center gap-1 mr-0 md:mr-6 mb-2 md:mb-0">
    {/* Back 10s */}
    <button className="p-2 rounded-full hover:bg-[#123140]" onClick={onRewind} aria-label="Back 10 seconds">
      {/* ... SVG from before ... */}
      <svg stroke="currentColor" fill="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" stroke="#fff" strokeWidth="2" d="M3.11111111,7.55555556 C4.66955145,4.26701301 8.0700311,2 12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 L12,22 C6.4771525,22 2,17.5228475 2,12 M2,4 L2,8 L6,8 M9,16 L9,9 L7,9.53333333 M17,12 C17,10 15.9999999,8.5 14.5,8.5 C13.0000001,8.5 12,10 12,12 C12,14 13,15.5000001 14.5,15.5 C16,15.4999999 17,14 17,12 Z M14.5,8.5 C16.9253741,8.5 17,11 17,12 C17,13 17,15.5 14.5,15.5 C12,15.5 12,13 12,12 C12,11 12.059,8.5 14.5,8.5 Z" />
      </svg>
    </button>
    {/* Play/Pause */}
    <button className="p-2 rounded-full !bg-white text-[#0e2636] mx-2" onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
      {isPlaying ? (
        <svg width="34" height="34" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
          <polygon points="6,4 20,12 6,20" />
        </svg>
      )}
    </button>
    {/* Forward 10s */}
    <button className="p-2 rounded-full hover:bg-[#123140]" onClick={onForward} aria-label="Forward 10 seconds">
      {/* ... SVG from before ... */}
      <svg stroke="currentColor" fill="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" stroke="#fff" strokeWidth="2" d="M20.8888889,7.55555556 C19.3304485,4.26701301 15.9299689,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 L12,22 C17.5228475,22 22,17.5228475 22,12 M22,4 L22,8 L18,8 M9,16 L9,9 L7,9.53333333 M17,12 C17,10 15.9999999,8.5 14.5,8.5 C13.0000001,8.5 12,10 12,12 C12,14 13,15.5000001 14.5,15.5 C16,15.4999999 17,14 17,12 Z M14.5,8.5 C16.9253741,8.5 17,11 17,12 C17,13 17,15.5 14.5,15.5 C12,15.5 12,13 12,12 C12,11 12.059,8.5 14.5,8.5 Z" />
      </svg>
    </button>
  </div>
);

export default AudioControls;
