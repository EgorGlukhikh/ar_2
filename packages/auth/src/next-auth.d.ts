import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      firstName?: string | null;
      lastName?: string | null;
    };
  }

  interface User {
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
  }
}
