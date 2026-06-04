"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, ChevronDown } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Get to Know Us",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Connect with Us",
    links: [
      { label: "Facebook", href: "https://facebook.com/giftfactoryin", icon: Facebook },
      { label: "Twitter", href: "https://twitter.com/giftfactoryin", icon: Twitter },
      { label: "Instagram", href: "https://instagram.com/giftfactoryin", icon: Instagram },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { label: "Sell on Gift Factory", href: "/sell" },
      { label: "Affiliate Program", href: "/affiliate" },
      { label: "Advertise", href: "/advertise" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/profile" },
      { label: "Returns & Replacements", href: "/returns" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Help", href: "/help" },
    ],
  },
];

export function Footer() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  return (
    <footer className="bg-[#232f3e] text-white mt-auto">
      {/* Back to top */}
      <div className="bg-[#37475a]">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-full py-3 text-sm font-medium hover:bg-[#485769] transition-colors"
        >
          Back to top
        </button>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Mobile: accordion columns | Desktop: grid */}
        <div className="sm:hidden divide-y divide-gray-600 border-y border-gray-600 mb-6">
          {FOOTER_COLUMNS.map((col) => {
            const isOpen = expandedSections.has(col.title);
            return (
              <div key={col.title}>
                <button
                  type="button"
                  onClick={() => toggleSection(col.title)}
                  className="w-full flex items-center justify-between py-3.5 text-left"
                >
                  <span className="font-semibold text-sm">{col.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <ul className="pb-4 space-y-2 pl-1">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {"icon" in link && link.icon ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-1"
                            aria-label={link.label}
                          >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-sm text-gray-300 hover:text-white transition-colors block py-1"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop grid (sm+) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-bold text-base mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"icon" in link && link.icon ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                        aria-label={link.label}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-600 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-white hover:opacity-90">
            Gift Factory
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>English</span>
            <span>India</span>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-600 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
          <Link href="/conditions" className="hover:text-white">
            Conditions of Use &amp; Sale
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy Notice
          </Link>
          <Link href="/interest-ads" className="hover:text-white">
            Interest-Based Ads
          </Link>
        </div>
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} Gift Factory. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
