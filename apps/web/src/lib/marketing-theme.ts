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
  "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(199,213,255,0.58),_transparent_26%),radial-gradient(circle_at_92%_18%,_rgba(255,215,199,0.64),_transparent_24%),linear-gradient(180deg,_#f8f4ff_0%,_#fffaf4_48%,_#eff5ff_100%)] font-[family:var(--font-landing-body)] text-[#1c2442]";

export const marketingContainerClassName =
  "mx-auto max-w-[1720px] px-4 py-5 md:px-8 md:py-8 xl:px-14";

export const marketingFrameClassName =
  "rounded-[40px] border border-white/70 bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_40px_120px_rgba(48,52,109,0.12)] backdrop-blur md:p-6 xl:p-7";

export const marketingInnerFrameClassName =
  "rounded-[34px] border border-white/80 bg-[#fffdfb] p-5 md:p-8 xl:p-10";

export const publicCourseCoverPool = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=80",
];

export function getPublicCourseCover(index: number) {
  return publicCourseCoverPool[index % publicCourseCoverPool.length];
}
