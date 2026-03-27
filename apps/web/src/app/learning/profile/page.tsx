import { prisma } from "@academy/db";

import { ProfilePageContent } from "@frontend/learning/components/profile-page-content";

import { requireStudentOrElevatedUser } from "@/lib/user";

export default async function ProfilePage() {
  const user = await requireStudentOrElevatedUser();

  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      telegram: true,
      city: true,
    },
  });

  return <ProfilePageContent profile={profile} />;
}
