import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { formatPublicCopy } from "@/lib/public-copy";

/**
 * Purpose: auth layout with a clear split-screen composition for marketing-style entry pages.
 */
export function AuthShell({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[32px] border border-[rgba(148,163,184,0.18)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] xl:grid xl:min-h-[720px] xl:grid-cols-[0.96fr_0.88fr]">
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#6f84f5_0%,#8ea2ff_100%)] px-7 py-7 text-white sm:px-10 sm:py-10 xl:flex xl:flex-col xl:justify-between xl:px-12 xl:py-12">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/14 text-2xl font-semibold tracking-[-0.04em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur">
              AR
            </div>
            <h1 className="text-[clamp(1.6rem,3vw,2.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">
              {formatPublicCopy("Академия риэлторов")}
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white/88 transition hover:bg-white/16"
            aria-label="Вернуться на главную"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="relative z-10 mt-10 max-w-[500px] space-y-5 xl:mt-14">
          <h2 className="max-w-[10ch] text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-white">
            {formatPublicCopy(title)}
          </h2>
          <p className="max-w-[46ch] text-[15px] leading-7 text-white/78 sm:text-base">
            {formatPublicCopy(text)}
          </p>
        </div>

        <div className="relative z-10 mt-8 flex justify-center xl:mt-6 xl:justify-start">
          <div className="relative w-full max-w-[620px]">
            <div className="absolute inset-0 translate-y-10 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.26),rgba(255,255,255,0)_72%)] blur-2xl" />
            <Image
              src="/illustrations/continuous-learning.svg"
              alt="Иллюстрация обучения"
              width={620}
              height={552}
              priority
              className="relative h-auto w-full drop-shadow-[0_28px_60px_rgba(34,39,92,0.38)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-5 py-6 sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <div className="mx-auto w-full max-w-[460px]">{children}</div>
      </div>
    </section>
  );
}
