// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: string;
      userId?: string;
    };
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}