import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { customSession, twoFactor } from "better-auth/plugins";
import prisma from "./db";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "Lootopia",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Acme <onboarding@figenn.com>",
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Acme <onboarding@figenn.com>",
        to: user.email,
        subject: "Email Verification",
        html: `Click the link to verify your email: ${url}`,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    window: 10,
    max: 100,
  },
  plugins: [
    nextCookies(),
    twoFactor(),
    customSession(async ({ user, session }) => {
      const roles = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
        select: {
          role: true,
        },
      });
      const userSession = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
        select: {
          nickname: true,
          twoFactorEnabled: true,
        },
      });
      return {
        roles,
        user: {
          ...user,
          role: roles?.role,
          nickname: userSession?.nickname,
          twoFactorEnabled: userSession?.twoFactorEnabled,
        },
        session,
      };
    }),
  ],
});
