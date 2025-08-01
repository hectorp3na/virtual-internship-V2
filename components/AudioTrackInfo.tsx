import React from "react";

interface AudioTrackInfoProps {
  cover: string;
  title: string;
  author: string;
}

const AudioTrackInfo: React.FC<AudioTrackInfoProps> = ({ cover, title, author }) => (
  <>
    <img
      src={cover}
      alt={title}
      className="w-12 h-16 object-cover object-top rounded mr-4"
      style={{ minWidth: 48, minHeight: 64 }}
    />
    <div className="mr-8 min-w-[170px] max-w-[240px]">
      <div className="text-white font-semibold text-[14px] truncate">{title}</div>
      <div className="text-xs text-[#d8e7ef] truncate">{author}</div>
    </div>
  </>
);

export default AudioTrackInfo;
