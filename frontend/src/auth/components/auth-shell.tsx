import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Purpose: full-screen auth split layout.
 */
export function AuthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="grid min-h-screen w-full xl:grid-cols-[1.02fr_0.98fr]">
      <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#6f84f5_0%,#89a0ff_100%)] text-white xl:flex xl:min-h-screen xl:flex-col xl:justify-between xl:px-10 xl:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.18),transparent_26%),radial-gradient(circle_at_72%_76%,rgba(255,255,255,0.16),transparent_30%)]" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="flex h-18 w-18 items-center justify-center rounded-[24px] bg-white/14 text-[32px] font-semibold tracking-[-0.04em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur">
            AR
          </div>
          <div className="pt-1">
            <div className="text-[15px] font-medium text-white/84">
              Академия риэлторов
            </div>
            <div className="mt-1 text-[34px] font-semibold leading-[0.92] tracking-[-0.05em] text-white">
              Платформа
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-end justify-center">
          <div className="relative w-full max-w-[980px]">
            <div className="absolute inset-x-[16%] bottom-[3%] h-24 rounded-full bg-white/18 blur-3xl" />
            <Image
              src="/illustrations/sign-in-diploma.svg"
              alt="Иллюстрация входа"
              width={980}
              height={980}
              priority
              className="relative mx-auto h-auto w-full max-w-[760px] translate-y-6 drop-shadow-[0_28px_60px_rgba(34,39,92,0.22)]"
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center bg-white px-6 py-10 sm:px-10 xl:px-16">
        <div className="mx-auto w-full max-w-[520px]">{children}</div>
      </div>
    </section>
  );
}
