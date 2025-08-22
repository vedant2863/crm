"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Mail,
  Phone,
  Building,
  Save,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  RefreshCw
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dealUpdates: boolean;
  taskReminders: boolean;
  contactActivities: boolean;
  weeklyReports: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordStrength: string;
  loginHistory: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    timezone: 'UTC-8',
    language: 'en'
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    dealUpdates: true,
    taskReminders: true,
    contactActivities: false,
    weeklyReports: true
  });
  
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordStrength: 'medium',
    loginHistory: true
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/settings');
          if (response.ok) {
            const data = await response.json();
            const user = data.user;
            
            setProfile({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              company: user.company || '',
              position: user.position || '',
              timezone: user.timezone || 'UTC',
              language: user.language || 'en'
            });
            
            if (user.notifications) {
              setNotifications({
                emailNotifications: user.notifications.emailNotifications ?? true,
                pushNotifications: user.notifications.pushNotifications ?? false,
                dealUpdates: user.notifications.dealUpdates ?? true,
                taskReminders: user.notifications.taskReminders ?? true,
                contactActivities: user.notifications.contactActivities ?? false,
                weeklyReports: user.notifications.weeklyReports ?? true
              });
            }
            
            if (user.security) {
              setSecurity({
                twoFactorAuth: user.security.twoFactorAuth ?? false,
                sessionTimeout: user.security.sessionTimeout ?? 30,
                passwordStrength: 'medium',
                loginHistory: user.security.loginHistory ?? true
              });
            }
          }
        } catch (error) {
          console.error('Failed to fetch user settings:', error);
        }
      }
    };
    
    fetchUserSettings();
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          notifications,
          security: {
            twoFactorAuth: security.twoFactorAuth,
            sessionTimeout: security.sessionTimeout,
            loginHistory: security.loginHistory
          }
        }),
      });
      
      if (response.ok) {
        setSaveSuccess('Profile updated successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveSuccess('Failed to update profile. Please try again.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          notifications,
          security: {
            twoFactorAuth: security.twoFactorAuth,
            sessionTimeout: security.sessionTimeout,
            loginHistory: security.loginHistory
          }
        }),
      });
      
      if (response.ok) {
        setSaveSuccess('Notification preferences updated!');
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update notifications');
      }
    } catch (error) {
      console.error('Failed to save notifications:', error);
      setSaveSuccess('Failed to update notifications. Please try again.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          notifications,
          security: {
            twoFactorAuth: security.twoFactorAuth,
            sessionTimeout: security.sessionTimeout,
            loginHistory: security.loginHistory
          }
        }),
      });
      
      if (response.ok) {
        setSaveSuccess('Security settings updated!');
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update security settings');
      }
    } catch (error) {
      console.error('Failed to save security settings:', error);
      setSaveSuccess('Failed to update security settings. Please try again.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    const currentPassword = prompt('Please enter your current password:');
    if (!currentPassword) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword
        }),
      });
      
      if (response.ok) {
        setSaveSuccess('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert(error instanceof Error ? error.message : 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile,
      exportDate: new Date().toISOString(),
      contacts: 'Sample contact data...',
      deals: 'Sample deal data...',
      tasks: 'Sample task data...'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'data', label: 'Data & Privacy', icon: Database }
  ];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and configuration</p>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-800 text-sm font-medium">{saveSuccess}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeTab === tab.key 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                          : 'text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <Input
                        value={profile.company}
                        onChange={(e) => setProfile({...profile, company: e.target.value})}
                        placeholder="Enter your company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position/Title
                      </label>
                      <Input
                        value={profile.position}
                        onChange={(e) => setProfile({...profile, position: e.target.value})}
                        placeholder="Enter your position"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="UTC-12">UTC-12:00</option>
                        <option value="UTC-8">UTC-08:00 (PST)</option>
                        <option value="UTC-5">UTC-05:00 (EST)</option>
                        <option value="UTC+0">UTC+00:00 (GMT)</option>
                        <option value="UTC+8">UTC+08:00 (CST)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="flex items-center gap-2">
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'General email notifications', desc: 'Receive updates via email' },
                      { key: 'dealUpdates', label: 'Deal updates', desc: 'Notifications when deals change status' },
                      { key: 'taskReminders', label: 'Task reminders', desc: 'Reminders for upcoming task deadlines' },
                      { key: 'contactActivities', label: 'Contact activities', desc: 'Updates on contact interactions' },
                      { key: 'weeklyReports', label: 'Weekly reports', desc: 'Summary of weekly activities and metrics' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications[item.key as keyof NotificationSettings] as boolean}
                            onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">Browser notifications</h4>
                      <p className="text-sm text-gray-500 mt-1">Show push notifications in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={loading} className="flex items-center gap-2">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading || !newPassword || !confirmPassword}>
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure additional security options for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { 
                        key: 'twoFactorAuth', 
                        label: 'Two-Factor Authentication', 
                        desc: 'Add an extra layer of security to your account' 
                      },
                      { 
                        key: 'loginHistory', 
                        label: 'Login History Tracking', 
                        desc: 'Keep track of login activities and locations' 
                      }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={security[item.key as keyof SecuritySettings] as boolean}
                            onChange={(e) => setSecurity({...security, [item.key]: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSecurity} disabled={loading} className="flex items-center gap-2">
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data & Privacy Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Your Data
                  </CardTitle>
                  <CardDescription>
                    Download a copy of all your CRM data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Export all data</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Download contacts, deals, tasks, and account information as JSON
                      </p>
                    </div>
                    <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Import */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Data
                  </CardTitle>
                  <CardDescription>
                    Import contacts and deals from external sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Import from CSV</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload a CSV file with your contacts or deals
                        </p>
                      </div>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
