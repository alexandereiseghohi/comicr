"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Eye,
  Loader2,
  Settings as SettingsIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserSettings {
  emailNotifications: boolean;
  profileVisibility: "public" | "private";
  readingHistoryVisibility: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    profileVisibility: "public",
    readingHistoryVisibility: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/profile/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to update settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  const handleSettingChange = (key: keyof UserSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your settings have been saved",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Save settings error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch("/api/profile/delete-account", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted",
      });

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Delete account error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="h-6 w-6 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-950">Settings</h1>
          </div>
          <p className="text-slate-600">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-slate-500">
                    Receive updates about new chapters and bookmarks
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <CardTitle>Privacy</CardTitle>
              </div>
              <CardDescription>Control who can see your activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility" className="font-medium">
                  Profile Visibility
                </Label>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) =>
                    handleSettingChange("profileVisibility", value as "public" | "private")
                  }
                >
                  <SelectTrigger id="profile-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="private">Private - Only you can view</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  Control who can see your profile information
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reading-history" className="font-medium">
                    Reading History Visibility
                  </Label>
                  <p className="text-sm text-slate-500">
                    Show your reading history on your public profile
                  </p>
                </div>
                <Switch
                  id="reading-history"
                  checked={settings.readingHistoryVisibility}
                  onCheckedChange={(checked) =>
                    handleSettingChange("readingHistoryVisibility", checked)
                  }
                  disabled={settings.profileVisibility === "private"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900">Danger Zone</CardTitle>
              </div>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Delete Account</h4>
                  <p className="text-sm text-slate-500">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleting}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3 sticky bottom-0 bg-slate-50 py-4 border-t border-t-slate-200">
            <Button onClick={handleSave} disabled={!hasChanges || saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push("/profile")} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                all your data from our servers, including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your profile information</li>
                  <li>Reading history and progress</li>
                  <li>Bookmarks and ratings</li>
                  <li>Comments and reviews</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
