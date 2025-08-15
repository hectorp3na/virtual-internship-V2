"use client";
import React from "react";

const features = [
  {
    icon: (
      <svg
        className="w-full h-full text-[#032b41] block"
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2zM320 482a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h384a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320zm0 136a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h184a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320z" />
      </svg>
    ),
    text: (
      <>
        <strong>Key ideas in few min</strong> with many books to read
      </>
    ),
  },
  {
    icon: (
      <svg
        className="w-full h-full text-[#032b41] block"
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g>
          <path fill="none" d="M0 0H24V24H0z" />
          <path d="M21 3v2c0 3.866-3.134 7-7 7h-1v1h5v7c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2v-7h5v-3c0-3.866 3.134-7 7-7h3zM5.5 2c2.529 0 4.765 1.251 6.124 3.169C10.604 6.51 10 8.185 10 10v1h-.5C5.358 11 2 7.642 2 3.5V2h3.5z" />
        </g>
      </svg>
    ),
    text: (
      <>
        <strong>3 million</strong> people growing with Summarist every day
      </>
    ),
  },
  {
    icon: (
      <svg
        className="w-full h-full text-[#032b41] block"
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
     
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.293-6.293l6-6-1.414-1.414L10 13.586 8.707 12.293 7.293 13.707 10.707 17.12z" />
      </svg>
    ),
    text: (
      <>
        <strong>Precise recommendations</strong> collections curated by experts
      </>
    ),
  },
];

const PlanFeatures = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center text-center gap-6 max-w-[800px] mx-auto mb-14">
    {features.map((feature, i) => (
      <div key={i} className="plan__features flex flex-col items-center text-center">
        <figure className="mb-3 flex items-center justify-center w-[60px] h-[60px]">
          {feature.icon}
        </figure>
        <div className="text-[#032b41] leading-[1.5] text-sm md:text-base">
          {feature.text}
        </div>
      </div>
    ))}
  </div>
);

export default PlanFeatures;
