"use client";
import React, { useRef, useState, useEffect } from "react";
import AudioTrackInfo from "./AudioTrackInfo";
import AudioControls from "./AudioControls";
import AudioProgressBar from "./AudioProgressBar";

interface AudioPlayerProps {
  src: string;
  cover?: string;
  title: string;
  author: string;
  durationOverride?: string;
}

const formatTime = (time: number): string => {
  if (!isFinite(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  cover = "/cover.jpg",
  title,
  author,
  durationOverride,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setCurrentTime(audio.currentTime);
    const setMeta = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", setMeta);

    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipTime = (amount: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    let newTime = audio.currentTime + amount;
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0e2636] z-50 h-[72px] flex items-center px-8 shadow-2xl border-t border-[#22313b]">
      <audio ref={audioRef} src={src} preload="auto" />
      <AudioTrackInfo cover={cover} title={title} author={author} />
      <AudioControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onRewind={() => skipTime(-10)}
        onForward={() => skipTime(10)}
      />
      <AudioProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        formatTime={formatTime}
        durationOverride={durationOverride}
      />
    </div>
  );
};

export default AudioPlayer;
