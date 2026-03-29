import { NextResponse } from "next/server";
import { USER_ROLES } from "@academy/shared";

import { registerCredentialsUser } from "@backend/auth/register-credentials-user";
import type {
  RegisterRequest,
  RegisterResponse,
} from "@shared/public-auth/types";
import {
  processDueEmailQueue,
  queueExpertMarketingSequence,
  queueStudentAccountCreatedEmail,
  queueStudentMarketingSequence,
  updateEmailPreferenceForUser,
} from "@/features/email/service";

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequest;
  const result: RegisterResponse = await registerCredentialsUser(body);

  if (result.ok) {
    const resolvedRole =
      result.user.role === USER_ROLES.AUTHOR ? USER_ROLES.AUTHOR : USER_ROLES.STUDENT;

    await updateEmailPreferenceForUser({
      userId: result.user.id,
      enabled: body.marketingEnabled === true,
      source: "sign-up-form",
      consentText: body.marketingEnabled
        ? "Я даю согласие на получение информационных и рекламных рассылок от Академии риэлторов, включая новости о новых курсах, акциях, специальных предложениях и мероприятиях. Я понимаю, что могу отозвать свое согласие в любой момент, перейдя по ссылке в письме или изменив настройки в личном кабинете."
        : "Пользователь зарегистрировался без согласия на маркетинговые письма.",
    });

    await queueStudentAccountCreatedEmail({
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        name: result.user.name,
        role: resolvedRole,
      },
      password: body.password,
    });

    if (body.marketingEnabled) {
      if (resolvedRole === USER_ROLES.AUTHOR) {
        await queueExpertMarketingSequence({
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            name: result.user.name,
            role: resolvedRole,
          },
        });
      } else {
        await queueStudentMarketingSequence({
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            name: result.user.name,
            role: resolvedRole,
          },
        });
      }
    }

    await processDueEmailQueue({ force: true, limit: 10 });
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
