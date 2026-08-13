import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import sql from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
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

        const [user] = await sql<
          { id: string; email: string; display_name: string | null; password_hash: string | null }[]
        >`
          SELECT id, email, display_name, password_hash
          FROM users
          WHERE email = ${email.trim().toLowerCase()}
          LIMIT 1
        `;

        if (!user || !user.password_hash) return null;

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.display_name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Re-read email_verified from the DB on every session check, so
    // verifying via /verify-email is reflected immediately instead of only
    // after the next sign-in.
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        const [row] = await sql<{ email_verified: boolean }[]>`
          SELECT email_verified FROM users WHERE id = ${token.id}
        `;
        session.user.isEmailVerified = row?.email_verified ?? false;
      }
      return session;
    },
  },
});
