import { NextResponse } from "next/server";

import { registerCredentialsUser } from "@backend/auth/register-credentials-user";
import type {
  RegisterRequest,
  RegisterResponse,
} from "@shared/public-auth/types";

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequest;
  const result: RegisterResponse = await registerCredentialsUser(body);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
