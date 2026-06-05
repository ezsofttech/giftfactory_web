"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1f2433] text-neutral-300 pt-20 pb-24 relative overflow-hidden border-t border-neutral-900">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Column 1: Brand Logo & Copyright */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col items-start mb-6 lg:mb-0">
            <Link href="/" className="flex items-center gap-3">
              <div className=" h-[50px] w-[50px] rounded-lg flex items-center justify-center font-black text-lg  shrink-0 shadow-sm">
                <img src="../favicon.png" alt="logo" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Gift Factory</span>
            </Link>
            <p className="text-[11px] text-neutral-500 mt-6 max-w-[200px] leading-relaxed">
              © copyright Gift Factory 2026. All rights reserved.
            </p>
          </div>

          {/* Column 2: Pages */}
          <div className="flex flex-col items-start">
            <h3 className="font-bold text-white text-sm tracking-wider mb-6">Pages</h3>
            <ul className="space-y-4 text-xs">
              <li>
                <Link href="/products" className="text-neutral-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Clients
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Socials */}
          <div className="flex flex-col items-start">
            <h3 className="font-bold text-white text-sm tracking-wider mb-6">Socials</h3>
            <ul className="space-y-4 text-xs">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col items-start">
            <h3 className="font-bold text-white text-sm tracking-wider mb-6">Legal</h3>
            <ul className="space-y-4 text-xs">
              <li>
                <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/conditions" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Register */}
          <div className="flex flex-col items-start">
            <h3 className="font-bold text-white text-sm tracking-wider mb-6">Register</h3>
            <ul className="space-y-4 text-xs">
              <li>
                <Link href="/signup" className="text-neutral-400 hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-neutral-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="text-neutral-400 hover:text-white transition-colors">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Large Watermark Background Text */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none select-none z-0">
        <div className="text-[12.5vw] font-black text-white/[0.03] text-center tracking-tighter uppercase translate-y-6 md:translate-y-12">
          Gift Factory
        </div>
      </div>
    </footer>
  );
}
