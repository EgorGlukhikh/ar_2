import { auth } from "@academy/auth";

import { getPublicHomePayload } from "@backend/public-home/get-public-home-payload";

import { PublicFooter } from "@/components/marketing/public-footer";
import { LandingExperience } from "@frontend/landing/components/landing-experience";
import { marketingBody, marketingDisplay } from "@/lib/marketing-theme";

export default async function Home() {
  await auth();

  const homePayload = await getPublicHomePayload();

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} font-[family:var(--font-landing-body)]`}
    >
      <LandingExperience {...homePayload} />
      <PublicFooter />
    </main>
  );
}
