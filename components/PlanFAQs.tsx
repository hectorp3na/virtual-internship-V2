"use client";
import { useState, useRef, useEffect } from "react";

export default function PlanFAQ() {
  const faqs = [
    {
      question: "How does the free 7-day trial work?",
      answer:
        "Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.",
    },
    {
      question:
        "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
      answer:
        "While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.",
    },
    {
      question: "What's included in the Premium plan?",
      answer:
        "Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books, high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.",
    },
    {
      question: "Can I cancel during my trial or subscription?",
      answer:
        "You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire Summarist library, you can still expand your knowledge with one curated book per day.",
    },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq__wrapper mt-10">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const contentRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
          const el = contentRef.current;
          if (!el) return;

          if (isOpen) {
            el.style.maxHeight = el.scrollHeight + "px";
          } else {
            el.style.maxHeight = "0px";
          }
        }, [isOpen]);

        return (
          <div
            key={idx}
            className="mb-4 border-b border-[#ddd] pb-4 overflow-hidden"
          >
            <button
              onClick={() => toggle(idx)}
              className="relative w-full text-left cursor-pointer text-[20px] md:text-[24px] font-medium text-[#032b41] pr-8"
            >
              {faq.question}
              <svg
                className={`accordion__icon absolute right-0 top-1/2 -translate-y-1/2 transform transition-transform duration-300 ease-in-out ${
                  isOpen ? "rotate-180" : ""
                }`}
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 16 16"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                ></path>
              </svg>
            </button>
            <div
              ref={contentRef}
              className="transition-all duration-500 ease-in-out overflow-hidden max-h-0"
            >
              <p className="text-[14px] md:text-base text-[#394547] leading-[1.5] pt-4">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
