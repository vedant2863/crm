import { signOut as nextAuthSignOut } from "next-auth/react";
import { useSession as useCustomSession } from "@/contexts/session-context";

// Re-export a useSession hook compatible with NextAuth v4 API shape
// It reads from the custom SessionProvider context
export function useSession() {
  return useCustomSession();
}

export { nextAuthSignOut as signOut };
