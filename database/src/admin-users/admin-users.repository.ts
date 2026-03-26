import { prisma } from "@academy/db";
import { USER_ROLES } from "@academy/shared";

type AdminUsersQuery = {
  query?: string;
  role?: string;
  access?: string;
  authSource?: string;
};

const roleOptions = [
  { value: "all", label: "Все роли" },
  { value: USER_ROLES.ADMIN, label: "Администраторы" },
  { value: USER_ROLES.AUTHOR, label: "Авторы" },
  { value: USER_ROLES.CURATOR, label: "Кураторы" },
  { value: USER_ROLES.SALES_MANAGER, label: "Продажи" },
  { value: USER_ROLES.STUDENT, label: "Студенты" },
] as const;

const roleLabelMap = {
  ADMIN: "Администратор",
  AUTHOR: "Автор",
  CURATOR: "Куратор",
  SALES_MANAGER: "Продажи",
  STUDENT: "Студент",
} as const;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: Date) {
  return dateFormatter.format(value);
}

function resolveAuthSourceLabel(user: {
  passwordHash: string | null;
  accounts: Array<{ provider: string }>;
}) {
  if (user.accounts.some((account) => account.provider === "yandex")) {
    return "Яндекс";
  }

  if (user.passwordHash) {
    return "Почта и пароль";
  }

  return "Внутренний доступ";
}

export async function getAdminUsersSnapshot(query: AdminUsersQuery) {
  const normalizedQuery = (query.query ?? "").trim();
  const normalizedRole = query.role && query.role !== "all" ? query.role : undefined;
  const normalizedAccess = query.access && query.access !== "all" ? query.access : undefined;
  const normalizedAuthSource =
    query.authSource && query.authSource !== "all" ? query.authSource : undefined;

  const totalUsers = await prisma.user.count();

  const users = await prisma.user.findMany({
    where: {
      ...(normalizedQuery
        ? {
            OR: [
              {
                name: {
                  contains: normalizedQuery,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: normalizedQuery,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(normalizedRole ? { role: normalizedRole as keyof typeof roleLabelMap } : {}),
      ...(normalizedAccess === "with-access"
        ? {
            enrollments: {
              some: {},
            },
          }
        : {}),
      ...(normalizedAccess === "without-access"
        ? {
            enrollments: {
              none: {},
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
      enrollments: {
        select: {
          course: {
            select: {
              title: true,
            },
          },
        },
        take: 5,
      },
      _count: {
        select: {
          enrollments: true,
          progress: true,
        },
      },
    },
  });

  const filteredUsers = users.filter((user) => {
    if (normalizedAuthSource === "yandex") {
      return user.accounts.some((account) => account.provider === "yandex");
    }

    if (normalizedAuthSource === "credentials") {
      return Boolean(user.passwordHash);
    }

    if (normalizedAuthSource === "manual") {
      return !user.passwordHash && user.accounts.length === 0;
    }

    return true;
  });

  return {
    totalUsers,
    filteredUsers: filteredUsers.length,
    roleOptions: [...roleOptions],
    users: filteredUsers.map((user) => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      role: roleLabelMap[user.role],
      authSourceLabel: resolveAuthSourceLabel(user),
      enrollmentCount: user._count.enrollments,
      progressCount: user._count.progress,
      createdAtLabel: formatDate(user.createdAt),
      latestCourses: user.enrollments.map((enrollment) => enrollment.course.title),
    })),
  };
}
