import { USER_ROLES, type UserRole } from "@academy/shared";

export function canViewWorkspaceOverview(role: UserRole) {
  return role === USER_ROLES.ADMIN;
}

export function canViewCourseWorkspace(role: UserRole) {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.AUTHOR;
}

export function canViewStudentWorkspace(role: UserRole) {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.CURATOR;
}

export function canViewUserWorkspace(role: UserRole) {
  return role === USER_ROLES.ADMIN;
}

export function canViewHomeworkWorkspace(role: UserRole) {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.CURATOR;
}

export function canViewEmailWorkspace(role: UserRole) {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.SALES_MANAGER;
}

export function canViewAnalyticsWorkspace(role: UserRole) {
  return role === USER_ROLES.ADMIN;
}

export function canViewTeamWorkspace(role: UserRole) {
  return role === USER_ROLES.ADMIN;
}

export function getWorkspaceTitle(role: UserRole) {
  if (role === USER_ROLES.AUTHOR) {
    return "Кабинет автора";
  }

  if (role === USER_ROLES.CURATOR) {
    return "Кабинет куратора";
  }

  if (role === USER_ROLES.SALES_MANAGER) {
    return "Коммерческий контур";
  }

  if (role === USER_ROLES.STUDENT) {
    return "Кабинет студента";
  }

  return "Рабочий контур команды";
}

export function getWorkspaceDescription(role: UserRole, email?: string | null) {
  if (role === USER_ROLES.AUTHOR) {
    return `Режим автора для создания программ, структуры курсов и наполнения уроков. ${email ?? ""}`.trim();
  }

  if (role === USER_ROLES.CURATOR) {
    return `Режим куратора для проверки домашних заданий и сопровождения студентов. ${email ?? ""}`.trim();
  }

  if (role === USER_ROLES.SALES_MANAGER) {
    return `Режим коммерческой команды для писем, коммуникаций и контроля воронки. ${email ?? ""}`.trim();
  }

  if (role === USER_ROLES.STUDENT) {
    return `Режим студента показывает только учебный путь и не открывает внутренние разделы команды. ${email ?? ""}`.trim();
  }

  return `Режим администратора для управления системой, курсами, пользователями и аналитикой. ${email ?? ""}`.trim();
}
