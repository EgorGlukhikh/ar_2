import { prisma, type Prisma, type UserRole } from "@academy/db";
import { derivePersonNameFields } from "@academy/shared";

type OAuthAccountInput = {
  userId: string;
  provider: string;
  providerAccountId: string;
  type: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
};

type CreateCredentialsUserInput = {
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  passwordHash: string;
  role?: UserRole;
};

type CreateOAuthUserWithAccountInput = {
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  role?: UserRole;
} & Omit<OAuthAccountInput, "userId">;

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function findAccountByProviderAccountId(
  provider: string,
  providerAccountId: string,
) {
  return prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: {
      user: true,
    },
  });
}

export async function createCredentialsUser(input: CreateCredentialsUserInput) {
  const personName = derivePersonNameFields(input);

  return prisma.user.create({
    data: {
      email: input.email,
      name: personName.fullName,
      firstName: personName.firstName,
      lastName: personName.lastName,
      passwordHash: input.passwordHash,
      role: input.role,
    } as Prisma.UserCreateInput,
  });
}

export async function attachPasswordToExistingUser(
  userId: string,
  passwordHash: string,
  input?: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  },
) {
  const personName = derivePersonNameFields(input ?? {});

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
      ...(input
        ? {
            name: personName.fullName,
            firstName: personName.firstName,
            lastName: personName.lastName,
          }
        : {}),
    } as Prisma.UserUpdateInput,
  });
}

export async function linkOAuthAccountToUser(input: OAuthAccountInput) {
  return prisma.account.create({
    data: {
      userId: input.userId,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      type: input.type,
      access_token: input.access_token ?? undefined,
      refresh_token: input.refresh_token ?? undefined,
      expires_at: input.expires_at ?? undefined,
      token_type: input.token_type ?? undefined,
      scope: input.scope ?? undefined,
      id_token: input.id_token ?? undefined,
      session_state: input.session_state ?? undefined,
    },
  });
}

export async function createOAuthUserWithAccount(
  input: CreateOAuthUserWithAccountInput,
) {
  const personName = derivePersonNameFields(input);

  return prisma.user.create({
    data: {
      email: input.email,
      name: personName.fullName,
      firstName: personName.firstName,
      lastName: personName.lastName,
      image: input.image,
      role: input.role,
      accounts: {
        create: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
          type: input.type,
          access_token: input.access_token ?? undefined,
          refresh_token: input.refresh_token ?? undefined,
          expires_at: input.expires_at ?? undefined,
          token_type: input.token_type ?? undefined,
          scope: input.scope ?? undefined,
          id_token: input.id_token ?? undefined,
          session_state: input.session_state ?? undefined,
        },
      },
    } as Prisma.UserCreateInput,
  });
}
