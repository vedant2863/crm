import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import { NextAuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
import envConfig from "@/lib/config/envconfig";
import { loginAttemptTracker } from "@/lib/rate-limiter";

if (!process.env.NEXTAUTH_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.NEXTAUTH_URL = process.env.RENDER_EXTERNAL_URL;
}
if (!process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = "true";
}

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

        // 1. Account lockout check (does NOT increment failure counter)
        const lockoutCheck = loginAttemptTracker.isLocked(`login:${email}`);
        if (lockoutCheck.locked) {
          console.warn(`[Auth] Account locked: ${email} (retry in ${lockoutCheck.retryAfterSeconds}s)`);
          throw new Error(
            `Account temporarily locked. Try again in ${lockoutCheck.retryAfterSeconds} seconds.`
          );
        }

        // 2. Connect to database
        try {
          await dbConnect();
        } catch (dbErr) {
          console.error("[Auth] Database connection error during login:", dbErr);
          throw new Error("Database connection unavailable. Please verify MONGODB_URI.");
        }

        // 3. Find user or auto-seed if fresh deployment
        let user = await User.findOne({ email });
        if (!user) {
          try {
            const count = await User.countDocuments();
            if (count === 0) {
              console.log("[Auth] Fresh database with 0 users detected. Auto-seeding initial data...");
              const { seedDatabase } = await import("@/lib/seedData");
              await seedDatabase();
              user = await User.findOne({ email });
            }
          } catch (seedErr) {
            console.error("[Auth] Auto-seeding failed:", seedErr);
          }
        }

        if (!user) {
          loginAttemptTracker.recordFailure(`login:${email}`);
          console.warn(`[Auth] Login rejected: No user found for '${email}'`);
          throw new Error("Invalid email or password");
        }

        // 4. Validate password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          loginAttemptTracker.recordFailure(`login:${email}`);
          console.warn(`[Auth] Login rejected: Incorrect password for '${email}'`);
          throw new Error("Invalid email or password");
        }

        // 5. Successful authentication
        loginAttemptTracker.reset(`login:${email}`);
        console.log(`[Auth] Login successful for: ${email}`);

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
  secret: envConfig.auth.secret,
};

export function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}
