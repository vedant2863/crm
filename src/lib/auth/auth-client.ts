import { 
  signIn as nextAuthSignIn, 
  signOut as nextAuthSignOut 
} from "next-auth/react";
import { useSession } from "@/components/providers";
import { Session } from "next-auth";

// Re-export custom useSession
export { useSession };

// Custom signIn
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

// Custom signOut
export async function signOut(options?: { callbackUrl?: string }) {
  await nextAuthSignOut({ callbackUrl: options?.callbackUrl });
}
