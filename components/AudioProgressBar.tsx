import React from "react";

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatTime: (t: number) => string;
  durationOverride?: string;
}

const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  formatTime,
  durationOverride,
}) => (
  <div className="flex items-center flex-1 min-w-0">
    <span className="text-xs text-white mr-2" style={{ width: 42, textAlign: "right" }}>
      {formatTime(currentTime)}
    </span>
    <input
      type="range"
      min={0}
      max={duration || 0}
      value={currentTime}
      step={0.01}
      onChange={onSeek}
      className="progress-bar-range accent-white h-[4px] mx-2"
      style={{ minWidth: 200, maxWidth: 350, accentColor: "#fff" }}
    />
    <span className="text-xs text-white ml-2" style={{ width: 42, textAlign: "left" }}>
      {durationOverride ? durationOverride : formatTime(duration)}
    </span>
  </div>
);

export default AudioProgressBar;
