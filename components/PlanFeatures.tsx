const features = [
  {
    icon: (
      <svg className="w-full h-full text-[#032b41] block" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2zM320 482a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h384a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320zm0 136a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h184a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320z" />
      </svg>
    ),
    text: (
      <>
        <strong>Key ideas in few min</strong> with many books to read
      </>
    )
  },
  {
    icon: (
      <svg className="w-full h-full text-[#032b41] block" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g><path fill="none" d="M0 0H24V24H0z" /><path d="M21 3v2c0 3.866-3.134 7-7 7h-1v1h5v7c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2v-7h5v-3c0-3.866 3.134-7 7-7h3zM5.5 2c2.529 0 4.765 1.251 6.124 3.169C10.604 6.51 10 8.185 10 10v1h-.5C5.358 11 2 7.642 2 3.5V2h3.5z" /></g>
      </svg>
    ),
    text: (
      <>
        <strong>3 million</strong> people growing with Summarist everyday
      </>
    )
  },
  {
    icon: (
      <svg className="w-full h-full text-[#032b41] block" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M434.7 64h-85.9c-8 0-15.7 3-21.6 8.4l-98.3 90c-.1.1-.2.3-.3.4-16.6 15.6-16.3 40.5-2.1 56 12.7 13.9 39.4 17.6 56.1 2.7.1-.1.3-.1.4-.2l79.9-73.2c6.5-5.9 16.7-5.5 22.6 1 6 6.5 5.5 16.6-1 22.6l-26.1 23.9L504 313.8c2.9 2.4 5.5 5 7.9 7.7V128l-54.6-54.6c-5.9-6-14.1-9.4-22.6-9.4z..." />
      </svg>
    ),
    text: (
      <>
        <strong>Precise recommendations</strong> collections curated by experts
      </>
    )
  }
];

const PlanFeatures = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center text-center gap-6 max-w-[800px] mx-auto mb-14">
    {features.map((feature, i) => (
      <div key={i} className="plan__features flex flex-col items-center text-center">
        <figure className="mb-3 flex items-center justify-center w-[60px] h-[60px]">{feature.icon}</figure>
        <div className="text-[#032b41] leading-[1.5] text-sm md:text-base">{feature.text}</div>
      </div>
    ))}
  </div>
);

export default PlanFeatures;
