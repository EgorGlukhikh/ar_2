import { CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PublicButton,
  SectionLead,
  publicActionRowClassName,
  publicCardClassName,
  publicIconBoxClassName,
} from "@/components/marketing/public-primitives";
import {
  completeDemoPayment,
  failDemoPayment,
  startDemoCheckout,
} from "@/features/billing/actions";
import { formatPublicCopy } from "@/lib/public-copy";
import type { PublicCheckoutPayload } from "@shared/public-checkout/types";

function Row({
  label,
  value,
  strong = false,
  breakAll = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  breakAll?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span>{formatPublicCopy(label)}</span>
      <span
        className={[
          "text-right text-[var(--foreground)]",
          strong ? "font-semibold" : "font-medium",
          breakAll ? "break-all" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Purpose: render checkout UI from a normalized payload.
 * Props:
 * - payload: checkout DTO from backend layer
 */
export function CheckoutPageContent({
  payload,
}: {
  payload: PublicCheckoutPayload;
}) {
  return (
    <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-8">
        <SectionLead
          eyebrow="Р§С‚Рѕ РѕС„РѕСЂРјР»СЏРµРј"
          title={payload.courseTitle}
          text="РљСѓСЂСЃ, СЃС‚РѕРёРјРѕСЃС‚СЊ Рё СЃРїРѕСЃРѕР± РѕРїР»Р°С‚С‹ СЃРѕР±СЂР°РЅС‹ РІ РѕРґРЅРѕРј РјРµСЃС‚Рµ, С‡С‚РѕР±С‹ РјРѕР¶РЅРѕ Р±С‹Р»Рѕ Р±С‹СЃС‚СЂРѕ РїСЂРѕРІРµСЂРёС‚СЊ Р·Р°РєР°Р· РїРµСЂРµРґ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј."
        />

        <article className={publicCardClassName}>
          <div className="space-y-4 text-base leading-7 text-[var(--muted)]">
            <Row label="РљСѓСЂСЃ" value={payload.courseTitle} />
            <Row label="РЎСѓРјРјР°" value={payload.totalAmountLabel} strong />
            <Row label="РЎРїРѕСЃРѕР± РѕРїР»Р°С‚С‹" value={payload.paymentProviderLabel} />
            {payload.providerPaymentId ? (
              <Row label="РќРѕРјРµСЂ РїР»Р°С‚РµР¶Р°" value={payload.providerPaymentId} breakAll />
            ) : null}
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-2">
          <article className={publicCardClassName}>
            <div className={publicIconBoxClassName}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">
              {formatPublicCopy("РџРѕСЃР»Рµ РѕРїР»Р°С‚С‹")}
            </h3>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(
                "РљСѓСЂСЃ РѕС‚РєСЂРѕРµС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё Рё СЃСЂР°Р·Сѓ РїРѕСЏРІРёС‚СЃСЏ РІ СѓС‡РµР±РЅРѕРј РєР°Р±РёРЅРµС‚Рµ.",
              )}
            </p>
          </article>

          <article className={publicCardClassName}>
            <div className={publicIconBoxClassName}>
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold leading-7 text-[var(--foreground)]">
              {formatPublicCopy("Р§С‚Рѕ РґР°Р»СЊС€Рµ")}
            </h3>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(
                "Р•СЃР»Рё РїРµСЂРµРґСѓРјР°РµС€СЊ, Р·Р°РєР°Р· РјРѕР¶РЅРѕ Р·Р°РєСЂС‹С‚СЊ Рё РїРѕР·Р¶Рµ РІРµСЂРЅСѓС‚СЊСЃСЏ Рє РїРѕРєСѓРїРєРµ РёР· РєР°С‚Р°Р»РѕРіР°.",
              )}
            </p>
          </article>
        </div>
      </div>

      <div className="space-y-6">
        {payload.isPaid ? (
          <article className={publicCardClassName}>
            <div className={publicIconBoxClassName}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy("Р”РѕСЃС‚СѓРї РѕС‚РєСЂС‹С‚")}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(
                "РћРїР»Р°С‚Р° РїРѕРґС‚РІРµСЂР¶РґРµРЅР°, Р° РєСѓСЂСЃ СѓР¶Рµ РґРѕСЃС‚СѓРїРµРЅ РІ СѓС‡РµР±РЅРѕРј РєР°Р±РёРЅРµС‚Рµ.",
              )}
            </p>

            <div className={`mt-6 ${publicActionRowClassName} flex-col sm:flex-row`}>
              {payload.courseId ? (
                <PublicButton href={`/learning/courses/${payload.courseId}`}>
                  {formatPublicCopy("РџРµСЂРµР№С‚Рё Рє РєСѓСЂСЃСѓ")}
                </PublicButton>
              ) : null}
              <PublicButton href="/catalog" tone="secondary">
                {formatPublicCopy("Р’С‹Р±СЂР°С‚СЊ РµС‰С‘ РєСѓСЂСЃ")}
              </PublicButton>
            </div>
          </article>
        ) : payload.isCanceled ? (
          <article className={publicCardClassName}>
            <div className={publicIconBoxClassName}>
              <XCircle className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[var(--foreground)]">
              {formatPublicCopy("Р—Р°РєР°Р· Р·Р°РєСЂС‹С‚")}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {formatPublicCopy(
                "РћРїР»Р°С‚Р° РЅРµ Р·Р°РІРµСЂС€РµРЅР°. РњРѕР¶РЅРѕ РІРµСЂРЅСѓС‚СЊСЃСЏ РІ РєР°С‚Р°Р»РѕРі Рё РѕС„РѕСЂРјРёС‚СЊ РґРѕСЃС‚СѓРї Р·Р°РЅРѕРІРѕ, РєРѕРіРґР° Р±СѓРґРµС€СЊ РіРѕС‚РѕРІ РїСЂРѕРґРѕР»Р¶РёС‚СЊ.",
              )}
            </p>

            <div className={`mt-6 ${publicActionRowClassName} flex-col sm:flex-row`}>
              {payload.courseId ? (
                <form action={startDemoCheckout}>
                  <input type="hidden" name="courseId" value={payload.courseId} />
                  <Button type="submit">
                    {formatPublicCopy("РћС„РѕСЂРјРёС‚СЊ Р·Р°РЅРѕРІРѕ")}
                  </Button>
                </form>
              ) : null}
              <PublicButton href="/catalog" tone="secondary">
                {formatPublicCopy("Р’РµСЂРЅСѓС‚СЊСЃСЏ Рє РєСѓСЂСЃР°Рј")}
              </PublicButton>
            </div>
          </article>
        ) : (
          <div className="grid gap-4">
            <article className={publicCardClassName}>
              <div className={publicIconBoxClassName}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold leading-8 text-[var(--foreground)]">
                {formatPublicCopy("РџРѕРґС‚РІРµСЂРґРёС‚СЊ РѕРїР»Р°С‚Сѓ")}
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                {formatPublicCopy(
                  "РџРѕСЃР»Рµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РєСѓСЂСЃ СЃСЂР°Р·Сѓ РїРѕСЏРІРёС‚СЃСЏ РІ СѓС‡РµР±РЅРѕРј РєР°Р±РёРЅРµС‚Рµ Рё Р±СѓРґРµС‚ РґРѕСЃС‚СѓРїРµРЅ Р±РµР· РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹С… С€Р°РіРѕРІ.",
                )}
              </p>
              <form action={completeDemoPayment} className="mt-6">
                <input type="hidden" name="orderId" value={payload.orderId} />
                <Button type="submit" className="w-full justify-center">
                  {formatPublicCopy("РџРѕРґС‚РІРµСЂРґРёС‚СЊ РѕРїР»Р°С‚Сѓ")}
                </Button>
              </form>
            </article>

            <article className={publicCardClassName}>
              <div className={publicIconBoxClassName}>
                <XCircle className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold leading-8 text-[var(--foreground)]">
                {formatPublicCopy("РћС‚РјРµРЅРёС‚СЊ Р·Р°РєР°Р·")}
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                {formatPublicCopy(
                  "Р—Р°РєР°Р· Р·Р°РєСЂРѕРµС‚СЃСЏ Р±РµР· РґРѕСЃС‚СѓРїР° Рє РєСѓСЂСѓ, Р° Рє РїРѕРєСѓРїРєРµ РјРѕР¶РЅРѕ Р±СѓРґРµС‚ РІРµСЂРЅСѓС‚СЊСЃСЏ РїРѕР·Р¶Рµ.",
                )}
              </p>
              <form action={failDemoPayment} className="mt-6">
                <input type="hidden" name="orderId" value={payload.orderId} />
                <Button type="submit" variant="outline" className="w-full justify-center">
                  {formatPublicCopy("РћС‚РјРµРЅРёС‚СЊ Р·Р°РєР°Р·")}
                </Button>
              </form>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
