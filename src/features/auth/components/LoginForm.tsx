"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { loginUser } from "@/lib/auth/session";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser({ email, password });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    const demoEmail = "vedantjadhav880@gmail.com";
    const demoPassword = "vedantjadhav880";

    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const result = await loginUser({ email: demoEmail, password: demoPassword });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/60 backdrop-blur-xl border border-border/40 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-primary/20">
      {/* Decorative colored glow inside the card */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="space-y-1 text-center pb-2 relative z-10">
        <CardTitle className="text-3xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground/80 text-sm">
          Enter your credentials to access your sales workspace
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="pl-10 bg-background/40 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-10 bg-background/40 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 rounded-xl"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-destructive text-center bg-destructive/10 border border-destructive/20 p-3 rounded-xl font-semibold animate-shake">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-6 font-bold shadow-lg shadow-primary/25 rounded-xl hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In to CRM"
            )}
          </Button>
        </form>

        {/* Dynamic Demo Credentials Block with instant autofill + submit */}
        <div className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/15 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Demo Environment
              </span>
            </div>
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/25 rounded-full px-2 py-0.5 font-bold">
              Ready
            </span>
          </div>

          <p className="text-xs text-muted-foreground/85 mb-4 leading-normal">
            No registration needed. Press the quick login button below to instantly populate fields and sign in.
          </p>

          <Button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            variant="outline"
            className="w-full bg-background/50 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs font-semibold py-5 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300"
          >
            One-Click Demo Login
            <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="justify-center pb-6 border-t border-border/10 pt-4 relative z-10 bg-muted/10">
        <p className="text-xs text-muted-foreground">
          New to the platform?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-bold transition-all"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
