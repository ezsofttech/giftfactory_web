"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFaqs } from "@/lib/api";

const faqData = [
  {
    question: "What is the purpose of this website?",
    answer:
      "This website is a place to help you find the best products and services in the world.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can contact support through our contact page or by emailing support@example.com.",
  },
  {
    question: "How do I find the best products?",
    answer:
      "Browse categories, compare reviews, and explore recommendations curated for you.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes, returns are accepted within 30 days depending on the seller policy.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, international shipping is available in selected countries.",
  },
  {
    question: "How can I track my order?",
    answer:
      "After placing an order, you’ll receive a tracking link via email.",
  },
];

export function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const { data: res, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: fetchFaqs,
  });

  const faqs = res?.data && res.data.length > 0 ? res.data : faqData;

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-white px-6 md:px-16 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Heading */}
        <div>
          <h2 className="text-5xl mt-18 ml-5 md:text-7xl text-[#CC176B] font-bold leading-[0.95] tracking-tight">
            Frequently <br />
            asked <br />
            questions
          </h2>
        </div>

        {/* FAQ */}
        <div className="">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-zinc-800 py-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="h-6 w-6 bg-zinc-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-zinc-200 rounded w-3/4" />
                      <div className="h-4 bg-zinc-100 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            faqs.map((faq, index) => {
              const isOpen = activeIndex === index;

              return (
                <div
                  key={index}
                  className="border-b border-zinc-800 py-6"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-start gap-4 text-left"
                  >
                    {/* Icon */}
                    <div className="pt-1 text-[#CC176B]">
                      {isOpen ? (
                        <Minus size={24} strokeWidth={2.5} />
                      ) : (
                        <Plus size={24} strokeWidth={2.5} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-semibold text-zinc-900">
                        {faq.question}
                      </h3>

                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100 mt-3"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-[#CC176B] text-lg leading-relaxed pr-10">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}