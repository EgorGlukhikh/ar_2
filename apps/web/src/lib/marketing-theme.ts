import { Manrope, Rubik } from "next/font/google";

export const marketingDisplay = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-landing-display",
});

export const marketingBody = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-landing-body",
});

export const marketingShellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,196,147,0.22),_transparent_18%),radial-gradient(circle_at_88%_12%,_rgba(38,80,216,0.16),_transparent_24%),linear-gradient(180deg,_#f4efe7_0%,_#edf1f7_56%,_#e8edf5_100%)] font-[family:var(--font-landing-body)] text-[#182036]";

export const marketingContainerClassName =
  "mx-auto max-w-[1480px] px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6 xl:px-10";

export const marketingFrameClassName =
  "rounded-[28px] border border-white/75 bg-[rgba(255,255,255,0.76)] p-3 shadow-[0_26px_80px_rgba(24,32,54,0.11)] backdrop-blur sm:rounded-[34px] sm:p-4 md:p-6 xl:p-7";

export const marketingInnerFrameClassName =
  "rounded-[24px] border border-white/90 bg-[linear-gradient(180deg,_rgba(255,252,247,0.98)_0%,_rgba(255,255,255,0.95)_100%)] p-4 sm:rounded-[28px] sm:p-5 md:p-7 xl:p-8";

export const publicCourseCoverPool = [
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1400&q=80",
];

export function getPublicCourseCover(index: number) {
  return publicCourseCoverPool[index % publicCourseCoverPool.length];
}
