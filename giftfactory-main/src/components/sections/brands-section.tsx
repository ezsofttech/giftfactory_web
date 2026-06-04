"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBrands } from "@/lib/api";
import type { ApiBrand } from "@/types/api";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

// ─── Marquee Row ─────────────────────────────────────────────────────────────
function MarqueeRow({
  brands,
  direction = "left",
  speed = 55,
}: {
  brands: ApiBrand[];
  direction?: "left" | "right";
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isPaused = useRef(false);
  const loopBrands = [...brands, ...brands, ...brands];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !brands.length) return;

    const raf = requestAnimationFrame(() => {
      const totalWidth = track.scrollWidth / 3;
      const startX = direction === "right" ? -totalWidth : 0;
      gsap.set(track, { x: startX });

      tweenRef.current = gsap.to(track, {
        x: direction === "left" ? `-=${totalWidth}` : `+=${totalWidth}`,
        duration: totalWidth / speed,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((v) => {
            const val = parseFloat(v) % totalWidth;
            return direction === "left"
              ? val > 0 ? val - totalWidth : val
              : val < -totalWidth ? val + totalWidth : val;
          }),
        },
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      tweenRef.current?.kill();
    };
  }, [brands, direction, speed]);

  const pause = () => { if (!isPaused.current) { tweenRef.current?.pause(); isPaused.current = true; } };
  const resume = () => { if (isPaused.current) { tweenRef.current?.play(); isPaused.current = false; } };

  return (
    <div
      className="flex items-center whitespace-nowrap will-change-transform"
      ref={trackRef}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {loopBrands.map((brand, i) => {
        const logo = brand.icon?.secure_url ?? brand.logoUrl;
        return (
          <Link
            key={`${brand._id}-${i}`}
            href={`/products?brandId=${brand._id}`}
            className="group inline-flex items-center gap-3 mx-3 shrink-0"
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.07, duration: 0.22, ease: "power2.out" })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.22, ease: "power2.out" })}
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-white/30 group-hover:bg-white/10 transition-colors duration-300">
              {logo ? (
                <div className="relative h-7 w-16 shrink-0">
                  <Image
                    src={logo}
                    alt={brand.name}
                    fill
                    className="object-contain brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ) : null}
              <span
                className={`text-xs font-black uppercase tracking-[0.15em] text-white/50 group-hover:text-white transition-colors duration-300 ${logo ? "hidden sm:inline" : ""}`}
              >
                {brand.name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export const BrandShowcase = () => {
  const { data: res } = useQuery({
    queryKey: ["web", "brands"],
    queryFn: fetchBrands,
  });
  const brands = (res?.data ?? []) as ApiBrand[];

  const titleRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  const animateIn = useCallback(() => {
    if (hasAnimated.current || !titleRef.current) return;
    hasAnimated.current = true;
    const chars = titleRef.current.querySelectorAll(".brand-char");
    gsap.fromTo(
      chars,
      { opacity: 0, y: 20, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.04, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animateIn(); },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [animateIn]);

  if (!brands.length) return null;

  const title = "SHOP BY BRANDS";

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-10 sm:py-14"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #111118 50%, #0a0a0f 100%)",
      }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-indigo-600/10 blur-[80px]" />

      {/* Title */}
      <div ref={titleRef} className="flex justify-center items-center gap-1 mb-2">
        {title.split("").map((ch, i) =>
          ch === " " ? (
            <span key={i} className="brand-char inline-block w-3 opacity-0" />
          ) : (
            <span
              key={i}
              className="brand-char inline-block text-xs sm:text-sm font-black tracking-[0.25em] text-white opacity-0"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.15)" }}
            >
              {ch}
            </span>
          )
        )}
      </div>

      {/* Subtitle line */}
      <p className="text-center text-[10px] text-white/25 tracking-[0.4em] uppercase mb-8">
        top labels · curated for you
      </p>

      {/* Gradient edge masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 z-10"
        style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 z-10"
        style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />

      {/* Row 1 — scroll left */}
      <div className="overflow-hidden mb-3">
        <MarqueeRow brands={brands} direction="left" speed={50} />
      </div>

      {/* Row 2 — scroll right (offset brands) */}
      <div className="overflow-hidden">
        <MarqueeRow
          brands={[...brands.slice(Math.floor(brands.length / 2)), ...brands.slice(0, Math.floor(brands.length / 2))]}
          direction="right"
          speed={45}
        />
      </div>
    </section>
  );
};
