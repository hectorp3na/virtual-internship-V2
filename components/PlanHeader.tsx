const PlanHeader = () => (
  <div className="plan__header--wrapper relative text-center w-full pt-12 mb-6">
    <div className="max-w-[1000px] mx-auto text-white px-6">
      <div className="plan__title text-[26px] mb-8 md:text-[48px] md:mb-10 font-bold leading-tight">
        Get unlimited access to many amazing books to read
      </div>
      <div className="text-[16px] md:text-[20px] mb-8 text-[#fff] max-w-[700px] mx-auto">
        Turn ordinary moments into amazing learning opportunities
      </div>
      <figure className="flex justify-center items-center mx-auto overflow-hidden text-[28px]">
        <img
          alt="pricing"
          src="/pricing-top.png"
          className="w-full max-w-[340px] h-auto mx-auto rounded-t-[180px]"
          style={{ color: "transparent" }}
          decoding="async"
          loading="lazy"
        />
      </figure>
    </div>
  </div>
);

export default PlanHeader;
