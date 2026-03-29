import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, type Prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";
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
          }),
        ]
      : []),
  ],
  callbacks: {
    signIn: async ({ account, profile, user }) => {
      if (account?.provider !== "yandex") {
        return true;
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
      }

      if (
        token.sub &&
        (!token.role || token.firstName === undefined || token.lastName === undefined)
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            firstName: true,
            lastName: true,
          } as Prisma.UserSelect,
        });
        const normalizedDbUser = dbUser as
          | {
              role?: string | null;
              firstName?: string | null;
              lastName?: string | null;
            }
          | null;

        token.role = normalizedDbUser?.role ?? USER_ROLES.STUDENT;
        token.firstName = normalizedDbUser?.firstName ?? null;
        token.lastName = normalizedDbUser?.lastName ?? null;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? USER_ROLES.STUDENT;
        session.user.firstName = (token.firstName as string | null | undefined) ?? null;
        session.user.lastName = (token.lastName as string | null | undefined) ?? null;
      }

      return session;
    },
  },
});
