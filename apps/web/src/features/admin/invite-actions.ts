"use server";

import { randomBytes } from "node:crypto";

import { hashPassword } from "@academy/auth";
import { prisma, type Prisma } from "@academy/db";
import { USER_ROLES, derivePersonNameFields } from "@academy/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin";

const inviteRoleSchema = z.enum([
  USER_ROLES.AUTHOR,
  USER_ROLES.CURATOR,
  USER_ROLES.SALES_MANAGER,
]);

const createWorkspaceInviteSchema = z.object({
  email: z.email().trim().toLowerCase(),
  role: inviteRoleSchema,
  note: z.string().trim().optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

const revokeWorkspaceInviteSchema = z.object({
  inviteId: z.string().trim().min(1),
});

const acceptWorkspaceInviteSchema = z.object({
  token: z.string().trim().min(1),
  name: z.string().trim().min(2),
  password: z.string().min(5),
});

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function createInviteToken() {
  return randomBytes(24).toString("hex");
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function getActiveInviteByToken(token: string) {
  return prisma.workspaceInvite.findUnique({
    where: {
      token,
    },
    include: {
      invitedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function createWorkspaceInvite(formData: FormData) {
  const admin = await requireAdminUser();

  const parsed = createWorkspaceInviteSchema.parse({
    email: getTrimmedValue(formData, "email"),
    role: getTrimmedValue(formData, "role"),
    note: getTrimmedValue(formData, "note") || undefined,
    expiresInDays: Number(getTrimmedValue(formData, "expiresInDays") || 7),
  });

  await prisma.workspaceInvite.create({
    data: {
      email: parsed.email,
      role: parsed.role,
      note: parsed.note,
      invitedById: admin.id,
      token: createInviteToken(),
      expiresAt: addDays(parsed.expiresInDays),
    },
  });

  revalidatePath("/admin/team");
}

export async function revokeWorkspaceInvite(formData: FormData) {
  await requireAdminUser();

  const parsed = revokeWorkspaceInviteSchema.parse({
    inviteId: getTrimmedValue(formData, "inviteId"),
  });

  await prisma.workspaceInvite.update({
    where: {
      id: parsed.inviteId,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  revalidatePath("/admin/team");
}

export async function acceptWorkspaceInvite(formData: FormData) {
  const parsed = acceptWorkspaceInviteSchema.parse({
    token: getTrimmedValue(formData, "token"),
    name: getTrimmedValue(formData, "name"),
    password: getTrimmedValue(formData, "password"),
  });

  const invite = await getActiveInviteByToken(parsed.token);

  if (!invite) {
    throw new Error("Приглашение не найдено.");
  }

  if (invite.revokedAt) {
    throw new Error("Это приглашение уже отозвано.");
  }

  if (invite.acceptedAt) {
    redirect(`/sign-in?email=${encodeURIComponent(invite.email)}&invited=1`);
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new Error("Срок действия приглашения истек.");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: invite.email,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (existingUser && existingUser.role !== invite.role) {
    throw new Error(
      "Для этого email уже существует учетная запись с другой ролью. Нужен отдельный адрес или ручная настройка админом.",
    );
  }

  const passwordHash = await hashPassword(parsed.password);
  const personName = derivePersonNameFields({ name: parsed.name });

  const acceptedUser = existingUser
    ? await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: personName.fullName,
          firstName: personName.firstName,
          lastName: personName.lastName,
          passwordHash,
          emailVerified: new Date(),
        } as Prisma.UserUpdateInput,
        select: {
          id: true,
        },
      })
    : await prisma.user.create({
        data: {
          email: invite.email,
          name: personName.fullName,
          firstName: personName.firstName,
          lastName: personName.lastName,
          passwordHash,
          emailVerified: new Date(),
          role: invite.role,
        } as Prisma.UserCreateInput,
        select: {
          id: true,
        },
      });

  await prisma.workspaceInvite.update({
    where: {
      id: invite.id,
    },
    data: {
      acceptedAt: new Date(),
      acceptedById: acceptedUser.id,
    },
  });

  revalidatePath("/admin/team");
  redirect(`/sign-in?email=${encodeURIComponent(invite.email)}&invited=1`);
}

export async function getWorkspaceInviteByToken(token: string) {
  return getActiveInviteByToken(token);
}
