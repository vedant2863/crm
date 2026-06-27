import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      role: string;
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}