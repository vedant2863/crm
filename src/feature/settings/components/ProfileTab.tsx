"use client";

import { Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileTabProps {
    profile: any;
    setProfile: (profile: any) => void;
    loading: boolean;
    onSave: (e: React.FormEvent) => void;
}

export function ProfileTab({ profile, setProfile, loading, onSave }: ProfileTabProps) {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                <CardDescription>Update your personal details and how you're seen in the CRM.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="John Doe"
                                className="bg-background border-none ring-1 ring-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                placeholder="john@example.com"
                                className="bg-background border-none ring-1 ring-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                                className="bg-background border-none ring-1 ring-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={profile.company}
                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                placeholder="Acme Inc."
                                className="bg-background border-none ring-1 ring-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                value={profile.position}
                                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                                placeholder="Manager"
                                className="bg-background border-none ring-1 ring-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                value={profile.timezone}
                                onValueChange={(val) => setProfile({ ...profile, timezone: val })}
                            >
                                <SelectTrigger id="timezone" className="bg-background border-none ring-1 ring-border">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC-8">Pacific Time (PT)</SelectItem>
                                    <SelectItem value="UTC-5">Eastern Time (ET)</SelectItem>
                                    <SelectItem value="UTC+0">Greenwich Mean Time (GMT)</SelectItem>
                                    <SelectItem value="UTC+1">Central European Time (CET)</SelectItem>
                                    <SelectItem value="UTC+5.5">India Standard Time (IST)</SelectItem>
                                    <SelectItem value="UTC+8">China Standard Time (CST)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading} className="px-8 shadow-lg hover:shadow-xl transition-all">
                            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </>
    );
}
