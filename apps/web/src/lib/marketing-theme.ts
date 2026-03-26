import { Inter } from "next/font/google";

const marketingFont = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-landing-body",
});

export const marketingDisplay = marketingFont;
export const marketingBody = marketingFont;

export const marketingShellClassName =
  "min-h-screen bg-[var(--background)] font-[family:var(--font-landing-body)] text-[var(--foreground)]";

export const marketingContainerClassName =
  "mx-auto w-full max-w-[var(--container-max)] px-6 py-6 md:px-8 md:py-8";

export const marketingFrameClassName =
  "space-y-16 md:space-y-20 lg:space-y-[var(--section-gap)]";

export const marketingInnerFrameClassName =
  "space-y-16 md:space-y-20 lg:space-y-[var(--section-gap)]";

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
