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
    <div className="mr-4 md:mr-8 min-w-[130px] md:min-w-[170px]  md:max-w-[240px]">
      <div className="text-white font-semibold text-[14px] ">{title}</div>
      <div className="text-[14px] text-[#bac8ce] truncate">{author}</div>
    </div>
  </>
);

export default AudioTrackInfo;
