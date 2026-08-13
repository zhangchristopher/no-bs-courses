import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import sql from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const {
  handlers: ownerHandlers,
  auth: ownerAuth,
  signIn: ownerSignIn,
  signOut: ownerSignOut,
} = NextAuth({
  basePath: "/api/owner-auth",
  session: { strategy: "jwt" },
  pages: { signIn: "/owner/signin" },
  cookies: {
    sessionToken: {
      name: "owner-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [owner] = await sql<
          { id: string; email: string; name: string | null; password_hash: string | null }[]
        >`
          SELECT id, email, name, password_hash
          FROM owners
          WHERE email = ${email.trim().toLowerCase()}
          LIMIT 1
        `;

        if (!owner || !owner.password_hash) return null;

        const valid = await verifyPassword(password, owner.password_hash);
        if (!valid) return null;

        return { id: owner.id, email: owner.email, name: owner.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Re-read the display name from the DB on every session check (not just
    // at sign-in) so a change on /owner/profile shows up immediately instead
    // of only after the owner signs out and back in.
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        const [owner] = await sql<{ name: string | null; email_verified: boolean }[]>`
          SELECT name, email_verified FROM owners WHERE id = ${token.id}
        `;
        session.user.name = owner?.name ?? null;
        session.user.isEmailVerified = owner?.email_verified ?? false;
      }
      return session;
    },
  },
});
