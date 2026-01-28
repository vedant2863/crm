"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Bell, Shield, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/feature/settings/components/ProfileTab";
import { NotificationsTab } from "@/feature/settings/components/NotificationsTab";
import { SecurityTab } from "@/feature/settings/components/SecurityTab";
import { DataTab } from "@/feature/settings/components/DataTab";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', company: '', position: '', timezone: 'UTC-8', language: 'en'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true, pushNotifications: false, dealUpdates: true,
    taskReminders: true, contactActivities: false, weeklyReports: true
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false, sessionTimeout: 30, loginHistory: true
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchUserSettings();
    }
  }, [session]);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setProfile({
          name: user.name || '', email: user.email || '', phone: user.phone || '',
          company: user.company || '', position: user.position || '',
          timezone: user.timezone || 'UTC-8', language: user.language || 'en'
        });
        if (user.notifications) setNotifications(user.notifications);
        if (user.security) setSecurity(user.security);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    }
  };

  const handleUpdateSettings = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success("Settings updated successfully");
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const currentPassword = prompt('For security, enter your current password:');
    if (!currentPassword) return;

    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword }),
      });
      if (response.ok) {
        toast.success("Password changed successfully");
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="text-center py-20">Please log in to access settings.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account preferences and global configuration.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <TabsList className="flex flex-col h-auto w-full bg-transparent gap-1 p-0">
              {[
                { value: "profile", label: "Profile", icon: User },
                { value: "notifications", label: "Notifications", icon: Bell },
                { value: "security", label: "Security", icon: Shield },
                { value: "data", label: "Data & Privacy", icon: Database },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="w-full justify-start gap-3 px-4 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all hover:bg-muted font-bold uppercase tracking-wider text-[10px]"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </aside>

          <main className="flex-1">
            <Card className="border-none shadow-none bg-transparent">
              <TabsContent value="profile" className="mt-0 focus-visible:ring-0">
                <Card className="border shadow-sm rounded-2xl overflow-hidden">
                  <ProfileTab
                    profile={profile}
                    setProfile={setProfile}
                    loading={loading}
                    onSave={(e) => {
                      e.preventDefault();
                      handleUpdateSettings({ ...profile, notifications, security });
                    }}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 focus-visible:ring-0">
                <Card className="border shadow-sm rounded-2xl overflow-hidden">
                  <NotificationsTab
                    notifications={notifications}
                    setNotifications={setNotifications}
                    loading={loading}
                    onSave={() => handleUpdateSettings({ ...profile, notifications, security })}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0 focus-visible:ring-0">
                <SecurityTab
                  security={security}
                  setSecurity={setSecurity}
                  loading={loading}
                  onSave={() => handleUpdateSettings({ ...profile, notifications, security })}
                  onPasswordChange={handlePasswordChange}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                />
              </TabsContent>

              <TabsContent value="data" className="mt-0 focus-visible:ring-0">
                <DataTab
                  onExport={() => toast("Exporting data...")}
                  onImport={() => toast("Import feature coming soon")}
                  onDeleteAccount={() => toast.error("Please contact support to delete account")}
                />
              </TabsContent>
            </Card>
          </main>
        </div>
      </Tabs>
    </div>
  );
}

