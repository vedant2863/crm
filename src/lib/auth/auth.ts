import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import { NextAuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
import envConfig from "@/lib/config/envconfig";
import { loginAttemptTracker } from "@/lib/rate-limiter";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const email = credentials.email.toLowerCase().trim();

        // Account lockout: 5 failed attempts = 15 min lockout
        const lockoutCheck = loginAttemptTracker.check(`login:${email}`);
        if (!lockoutCheck.allowed) {
          throw new Error(
            `Account temporarily locked. Try again in ${lockoutCheck.retryAfterSeconds} seconds.`
          );
        }

        await dbConnect();
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("No user found with this email");
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
          company: user.company || "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.company = (user as { company?: string }).company;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const customUser = session.user as { id?: string; role?: string; company?: string };
        customUser.id = token.id as string;
        customUser.role = token.role as string;
        customUser.company = token.company as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  cookies: envConfig.app.isProd
    ? {
        sessionToken: {
          name: "__Secure-next-auth.session-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
      }
    : undefined,
  secret: envConfig.auth.secret,
};

export function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}
