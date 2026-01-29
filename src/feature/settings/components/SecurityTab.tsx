"use client";

import { useState } from "react";
import { Save, RefreshCw, Shield, Eye, EyeOff, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SecuritySettings {
    twoFactorAuth: boolean;
    loginHistory: boolean;
    sessionTimeout: number;
}

interface SecurityTabProps {
    security: SecuritySettings;
    setSecurity: (security: SecuritySettings) => void;
    loading: boolean;
    onSave: () => void;
    onPasswordChange: (e: React.FormEvent) => void;
    newPassword: string;
    setNewPassword: (val: string) => void;
    confirmPassword: string;
    setConfirmPassword: (val: string) => void;
}

export function SecurityTab({
    security,
    setSecurity,
    loading,
    onSave,
    onPasswordChange,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
}: SecurityTabProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" /> Change Password
                    </CardTitle>
                    <CardDescription>Keep your account secure with a strong password.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={onPasswordChange} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="bg-background border-none ring-1 ring-border pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-background border-none ring-1 ring-border"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading || !newPassword} className="shadow-md">
                                Update Password
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </div>

            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" /> Security Settings
                    </CardTitle>
                    <CardDescription>Extra layers of protection for your account.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Smartphone className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-bold uppercase tracking-tight">Two-Factor Authentication</Label>
                                    <p className="text-xs text-muted-foreground">Require a verification code to log in.</p>
                                </div>
                            </div>
                            <Switch
                                checked={security.twoFactorAuth}
                                onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-bold uppercase tracking-tight">Login History</Label>
                                    <p className="text-xs text-muted-foreground">Keep track of all devices using your account.</p>
                                </div>
                            </div>
                            <Switch
                                checked={security.loginHistory}
                                onCheckedChange={(checked) => setSecurity({ ...security, loginHistory: checked })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Select
                            value={security.sessionTimeout.toString()}
                            onValueChange={(val) => setSecurity({ ...security, sessionTimeout: parseInt(val) })}
                        >
                            <SelectTrigger id="sessionTimeout" className="w-[180px] bg-background border-none ring-1 ring-border">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={onSave} disabled={loading} className="px-8 shadow-lg hover:shadow-xl transition-all">
                            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Security
                        </Button>
                    </div>
                </CardContent>
            </div>
        </div>
    );
}
