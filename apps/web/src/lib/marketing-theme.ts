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
  "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,196,147,0.26),_transparent_20%),radial-gradient(circle_at_88%_16%,_rgba(38,80,216,0.18),_transparent_22%),linear-gradient(180deg,_#f4efe7_0%,_#edf1f7_54%,_#e9eef6_100%)] font-[family:var(--font-landing-body)] text-[#182036]";

export const marketingContainerClassName =
  "mx-auto max-w-[1540px] px-4 py-5 md:px-8 md:py-8 xl:px-12";

export const marketingFrameClassName =
  "rounded-[42px] border border-white/75 bg-[rgba(255,255,255,0.76)] p-4 shadow-[0_36px_110px_rgba(24,32,54,0.12)] backdrop-blur md:p-6 xl:p-7";

export const marketingInnerFrameClassName =
  "rounded-[34px] border border-white/90 bg-[linear-gradient(180deg,_rgba(255,252,247,0.98)_0%,_rgba(255,255,255,0.95)_100%)] p-5 md:p-8 xl:p-10";

export const publicCourseCoverPool = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1400&q=80",
];

export function getPublicCourseCover(index: number) {
  return publicCourseCoverPool[index % publicCourseCoverPool.length];
}
