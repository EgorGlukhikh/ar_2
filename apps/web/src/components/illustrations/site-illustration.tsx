import Image from "next/image";

import { getIllustrationSrc, type IllustrationKey } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

type SiteIllustrationProps = {
  kind: IllustrationKey;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function SiteIllustration({
  kind,
  alt,
  className,
  imageClassName,
  priority = false,
}: SiteIllustrationProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] p-6 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className="absolute inset-x-6 top-0 h-24 rounded-full bg-[rgba(79,70,229,0.08)] blur-3xl" />
      <div className="relative aspect-[4/3]">
        <Image
          src={getIllustrationSrc(kind)}
          alt={alt}
          fill
          priority={priority}
          className={cn("object-contain", imageClassName)}
        />
      </div>
    </div>
  );
}

