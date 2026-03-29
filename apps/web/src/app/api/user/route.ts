import { auth } from "@academy/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  return NextResponse.json({
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          name: session.user.name,
          role: session.user.role,
        }
      : null,
  });
}
