import { 
  useSession as nextAuthUseSession, 
  signIn as nextAuthSignIn, 
  signOut as nextAuthSignOut 
} from "next-auth/react";

// Custom useSession Hook mimicking next-auth/react
export function useSession() {
  const { data: session, status } = nextAuthUseSession();

  return {
    data: session ? {
      user: {
        id: (session.user as { id?: string }).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as { role?: string }).role || "user",
      },
      expires: session.expires,
      accessToken: undefined,
    } : null,
    status,
  };
}

// Custom signOut
export async function signOut(options?: { callbackUrl?: string }) {
  await nextAuthSignOut({ callbackUrl: options?.callbackUrl });
}

// Custom signIn mimicking next-auth credentials signIn
export async function signIn(provider: string, options?: Record<string, unknown>) {
  if (provider === "credentials") {
    const { email, password, redirect = true, callbackUrl = "/dashboard" } = (options || {}) as Record<string, unknown>;
    try {
      const res = await nextAuthSignIn("credentials", {
        email: email as string,
        password: password as string,
        redirect: false,
        callbackUrl: callbackUrl as string,
      });

      if (res?.error) {
        return { error: res.error };
      }

      if (redirect && res?.url) {
        window.location.href = res.url;
      }

      return { error: null, url: res?.url || (callbackUrl as string) };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "An error occurred";
      return { error: errMsg };
    }
  }
  return { error: "Unsupported provider" };
}
