"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </Button>
                </form>

                <div className="mt-8 p-5 rounded-[1.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Demo Access</p>
                    <div className="space-y-1.5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Email Address</span>
                            <code className="text-xs font-black bg-background/50 border border-primary/10 px-3 py-2 rounded-xl text-foreground">vedantjadhav880@gmail.com</code>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Password</span>
                            <code className="text-xs font-black bg-background/50 border border-primary/10 px-3 py-2 rounded-xl text-foreground">vedantjadhav880</code>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Register
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
