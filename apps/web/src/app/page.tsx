import { auth } from "@academy/auth";
import { prisma, type Prisma } from "@academy/db";
import { resolveFirstName } from "@academy/shared";

import { getPublicHomePayload } from "@backend/public-home/get-public-home-payload";

import { PublicFooter } from "@/components/marketing/public-footer";
import { LandingExperience } from "@frontend/landing/components/landing-experience";
import { marketingBody, marketingDisplay } from "@/lib/marketing-theme";

export default async function Home() {
  const session = await auth();
  const viewerProfile = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          firstName: true,
          lastName: true,
          name: true,
        } as Prisma.UserSelect,
      })
    : null;

  const homePayload = await getPublicHomePayload();
  const viewerName =
    resolveFirstName({
      firstName: viewerProfile?.firstName ?? session?.user?.firstName,
      lastName: viewerProfile?.lastName ?? session?.user?.lastName,
      name: viewerProfile?.name ?? session?.user?.name,
    }) ||
    session?.user?.email?.split("@")[0] ||
    null;

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} font-[family:var(--font-landing-body)]`}
    >
      <LandingExperience {...homePayload} viewerName={viewerName} />
      <PublicFooter />
    </main>
  );
}
