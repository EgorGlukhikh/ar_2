import { prisma, type Prisma } from "@academy/db";

import { ProfilePageContent } from "@/components/learning/profile-page-content";

import { requireStudentOrElevatedUser } from "@/lib/user";

export default async function ProfilePage() {
  const user = await requireStudentOrElevatedUser();

  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      telegram: true,
      city: true,
      emailPreference: {
        select: {
          isMarketingEnabled: true,
        },
      },
    } as Prisma.UserSelect,
  });

  return (
    <ProfilePageContent
      profile={{
        name: profile.name,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        telegram: profile.telegram,
        city: profile.city,
        marketingEnabled: profile.emailPreference?.isMarketingEnabled ?? false,
      }}
    />
  );
}
