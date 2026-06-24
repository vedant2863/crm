import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

export async function getServerSession() {
  const session = await nextAuthGetServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}
