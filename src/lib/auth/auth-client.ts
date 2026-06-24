import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string" },
      },
    }),
  ],
});

// Custom useSession Hook mimicking next-auth/react
export function useSession() {
  const session = authClient.useSession();
  
  return {
    data: session.data ? {
      user: {
        id: session.data.user.id,
        name: session.data.user.name,
        email: session.data.user.email,
        role: session.data.user.role as string,
      },
      expires: session.data.session.expiresAt.toISOString(),
      accessToken: undefined as string | undefined,
    } : null,
    status: (session.isPending ? "loading" : session.data ? "authenticated" : "unauthenticated") as "loading" | "authenticated" | "unauthenticated",
  };
}

// Custom signOut
export async function signOut(options?: { callbackUrl?: string }) {
  await authClient.signOut();
  if (options?.callbackUrl) {
    window.location.href = options.callbackUrl;
  }
}

// Custom signIn mimicking next-auth credentials signIn
export async function signIn(provider: string, options?: Record<string, unknown>) {
  if (provider === "credentials") {
    const { email, password, redirect = true, callbackUrl = "/dashboard" } = (options || {}) as Record<string, unknown>;
    try {
      const res = await authClient.signIn.email({
        email: email as string,
        password: password as string,
      });
      if (res.error) {
        return { error: res.error.message || "Failed to sign in" };
      }
      if (redirect) {
        window.location.href = callbackUrl as string;
      }
      return { error: null, url: callbackUrl as string };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "An error occurred";
      return { error: errMsg };
    }
  }
  return { error: "Unsupported provider" };
}
