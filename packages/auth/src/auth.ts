import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, type Prisma } from "@academy/db";
import { derivePersonNameFields, USER_ROLES } from "@academy/shared";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Yandex from "next-auth/providers/yandex";
import { z } from "zod";

import {
  findAccountByProviderAccountId,
  findUserByEmail,
} from "./auth.repository";
import { verifyPassword } from "./password";

function normalizeEnvValue(key: "APP_BASE_URL" | "AUTH_URL" | "NEXTAUTH_URL") {
  const value = process.env[key];

  if (!value) {
    return undefined;
  }

  const normalizedValue = value.trim();
  process.env[key] = normalizedValue;
  return normalizedValue;
}

normalizeEnvValue("APP_BASE_URL");
normalizeEnvValue("AUTH_URL");
normalizeEnvValue("NEXTAUTH_URL");

const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(5),
});

type YandexProfile = {
  id: string;
  default_email?: string | null;
  emails?: string[];
  display_name?: string | null;
  real_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_avatar_empty?: boolean;
  default_avatar_id?: string | null;
  default_phone?: {
    number?: string | null;
  } | null;
};

function normalizeOptionalString(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function buildYandexAvatarUrl(profile: YandexProfile) {
  if (profile.is_avatar_empty || !profile.default_avatar_id) {
    return null;
  }

  return `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`;
}

function extractYandexProfileData(profile: YandexProfile) {
  const personName = derivePersonNameFields({
    firstName: profile.first_name,
    lastName: profile.last_name,
    name:
      profile.real_name ??
      profile.display_name ??
      profile.default_email ??
      profile.emails?.[0] ??
      null,
  });

  return {
    email: normalizeOptionalString(profile.default_email ?? profile.emails?.[0]) ?? null,
    name: personName.fullName,
    firstName: personName.firstName,
    lastName: personName.lastName,
    image: buildYandexAvatarUrl(profile),
    phone: normalizeOptionalString(profile.default_phone?.number) ?? null,
  };
}

async function syncYandexProfileToUser(
  userId: string,
  profileData: ReturnType<typeof extractYandexProfileData>,
) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      image: true,
      phone: true,
    } as Prisma.UserSelect,
  });

  if (!existingUser) {
    return;
  }

  const patch: Prisma.UserUpdateInput = {};

  if (!existingUser.name && profileData.name) {
    patch.name = profileData.name;
  }

  if (!existingUser.firstName && profileData.firstName) {
    patch.firstName = profileData.firstName;
  }

  if (!existingUser.lastName && profileData.lastName) {
    patch.lastName = profileData.lastName;
  }

  if (!existingUser.image && profileData.image) {
    patch.image = profileData.image;
  }

  if (!existingUser.phone && profileData.phone) {
    patch.phone = profileData.phone;
  }

  if (Object.keys(patch).length === 0) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: patch,
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await findUserByEmail(parsed.data.email);

        if (!user?.passwordHash) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        const normalizedUser = user as typeof user & {
          firstName?: string | null;
          lastName?: string | null;
        };

        return {
          id: normalizedUser.id,
          email: normalizedUser.email,
          name: normalizedUser.name,
          firstName: normalizedUser.firstName ?? null,
          lastName: normalizedUser.lastName ?? null,
          phone: normalizedUser.phone ?? null,
          role: normalizedUser.role ?? USER_ROLES.STUDENT,
        };
      },
    }),
    ...(process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET
      ? [
          Yandex({
            clientId: process.env.YANDEX_CLIENT_ID,
            clientSecret: process.env.YANDEX_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              url: "https://oauth.yandex.ru/authorize",
              params: {
                scope: "login:info login:email login:avatar login:phone",
              },
            },
            profile(profile) {
              const profileData = extractYandexProfileData(profile as YandexProfile);

              return {
                id: profile.id,
                name: profileData.name,
                email: profileData.email,
                image: profileData.image,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    signIn: async ({ account, profile, user }) => {
      if (account?.provider !== "yandex") {
        return true;
      }

      const yandexProfile = profile as YandexProfile | undefined;
      const profileData = yandexProfile ? extractYandexProfileData(yandexProfile) : null;

      if (profileData) {
        user.name = user.name ?? profileData.name;
        user.firstName = user.firstName ?? profileData.firstName;
        user.lastName = user.lastName ?? profileData.lastName;
        user.image = user.image ?? profileData.image;
        user.phone = user.phone ?? profileData.phone;
      }

      const existingAccount = await findAccountByProviderAccountId(
        account.provider,
        account.providerAccountId,
      );

      if (existingAccount) {
        return true;
      }

      const email =
        user.email ??
        profileData?.email ??
        (typeof profile === "object" &&
        profile !== null &&
        "default_email" in profile &&
        typeof profile.default_email === "string"
          ? profile.default_email
          : Array.isArray((profile as { emails?: string[] }).emails)
            ? (profile as { emails?: string[] }).emails?.[0]
            : undefined);

      if (!email) {
        return "/sign-in?error=yandex-email";
      }

      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName ?? null;
        token.lastName = user.lastName ?? null;
        token.phone = user.phone ?? null;
      }

      if (
        token.sub &&
        (
          !token.role ||
          token.firstName === undefined ||
          token.lastName === undefined ||
          token.phone === undefined
        )
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            firstName: true,
            lastName: true,
            phone: true,
          } as Prisma.UserSelect,
        });
        const normalizedDbUser = dbUser as
          | {
              role?: string | null;
              firstName?: string | null;
              lastName?: string | null;
              phone?: string | null;
            }
          | null;

        token.role = normalizedDbUser?.role ?? USER_ROLES.STUDENT;
        token.firstName = normalizedDbUser?.firstName ?? null;
        token.lastName = normalizedDbUser?.lastName ?? null;
        token.phone = normalizedDbUser?.phone ?? null;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? USER_ROLES.STUDENT;
        session.user.firstName = (token.firstName as string | null | undefined) ?? null;
        session.user.lastName = (token.lastName as string | null | undefined) ?? null;
        session.user.phone = (token.phone as string | null | undefined) ?? null;
      }

      return session;
    },
  },
  events: {
    signIn: async ({ account, profile, user }) => {
      if (account?.provider !== "yandex" || !user.id || !profile) {
        return;
      }

      await syncYandexProfileToUser(
        user.id,
        extractYandexProfileData(profile as YandexProfile),
      );
    },
  },
});
