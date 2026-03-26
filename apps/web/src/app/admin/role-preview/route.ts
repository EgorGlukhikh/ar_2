import { auth } from "@academy/auth";
import { USER_ROLES, type UserRole } from "@academy/shared";
import { NextResponse } from "next/server";

import { ROLE_PREVIEW_COOKIE } from "@/lib/viewer";

const allowedPreviewRoles: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR,
  USER_ROLES.STUDENT,
];

export async function GET(request: Request) {
  const session = await auth();
  const requestUrl = new URL(request.url);
  const requestedRole = requestUrl.searchParams.get("role")?.trim().toUpperCase();
  const returnTo = requestUrl.searchParams.get("returnTo")?.trim() || "/admin";

  if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));

  if (!requestedRole || requestedRole === USER_ROLES.ADMIN || requestedRole === "OFF") {
    response.cookies.delete(ROLE_PREVIEW_COOKIE);
    return response;
  }

  if (!allowedPreviewRoles.includes(requestedRole as UserRole)) {
    response.cookies.delete(ROLE_PREVIEW_COOKIE);
    return response;
  }

  response.cookies.set(ROLE_PREVIEW_COOKIE, requestedRole, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
