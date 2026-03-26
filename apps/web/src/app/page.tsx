import { auth } from "@academy/auth";
import { redirect } from "next/navigation";

import { getPublicHomePayload } from "@backend/public-home/get-public-home-payload";

import { LandingExperience } from "@/components/marketing/landing-experience";
import {
  marketingBody,
  marketingContainerClassName,
  marketingDisplay,
  marketingFrameClassName,
  marketingInnerFrameClassName,
  marketingShellClassName,
} from "@/lib/marketing-theme";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/after-sign-in");
  }

  const homePayload = await getPublicHomePayload();

  return (
    <main
      className={`${marketingDisplay.variable} ${marketingBody.variable} ${marketingShellClassName}`}
    >
      <div className={marketingContainerClassName}>
        <section className={marketingFrameClassName}>
          <div className={marketingInnerFrameClassName}>
            <LandingExperience {...homePayload} />
          </div>
        </section>
      </div>
    </main>
  );
}
