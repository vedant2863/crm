"use client";

import { Save, RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationsTabProps {
    notifications: any;
    setNotifications: (notifications: any) => void;
    loading: boolean;
    onSave: () => void;
}

export function NotificationsTab({ notifications, setNotifications, loading, onSave }: NotificationsTabProps) {
    const settings = [
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Summary of activities delivered to your inbox.' },
        { key: 'dealUpdates', label: 'Deal Updates', desc: 'Instant alerts when a deal changes stage.' },
        { key: 'taskReminders', label: 'Task Reminders', desc: 'Get notified before your tasks are due.' },
        { key: 'contactActivities', label: 'Contact Activities', desc: 'Updates when your contacts interact.' },
        { key: 'weeklyReports', label: 'Weekly Summary', desc: 'A consolidated report of your performance.' },
    ];

    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-bold">Notifications</CardTitle>
                <CardDescription>Control how you receive updates and alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {settings.map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 transition-colors hover:bg-card">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold uppercase tracking-tight">{item.label}</Label>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                            <Switch
                                checked={notifications[item.key]}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={onSave} disabled={loading} className="px-8 shadow-lg hover:shadow-xl transition-all">
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Preferences
                    </Button>
                </div>
            </CardContent>
        </>
    );
}
