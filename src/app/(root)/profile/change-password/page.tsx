"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/password-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to change password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      });

      reset();
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      console.error("Change password error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-600" />
              <CardTitle className="text-2xl">Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure. Make sure to use a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    {...register("currentPassword")}
                    className={errors.currentPassword ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    {...register("newPassword")}
                    className={errors.newPassword ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                )}
                <p className="text-xs text-slate-500">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              {/* Security Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Password Tips</h4>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Use a unique password you don&apos;t use elsewhere</li>
                  <li>Consider using a password manager</li>
                  <li>Avoid common words and personal information</li>
                  <li>Mix uppercase, lowercase, numbers, and symbols</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
