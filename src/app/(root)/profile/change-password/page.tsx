"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type ChangePasswordInput, changePasswordSchema } from "@/schemas/password-schema";

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
        toast.error(result.error || "Failed to change password");
        return;
      }

      toast.success("Your password has been changed successfully");

      reset();
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/profile">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
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
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    placeholder="Enter your current password"
                    type={showCurrentPassword ? "text" : "password"}
                    {...register("currentPassword")}
                    className={errors.currentPassword ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    type="button"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword.message}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    placeholder="Enter your new password"
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword")}
                    className={errors.newPassword ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    type="button"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword.message}</p>}
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
                    placeholder="Confirm your new password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <button
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1" disabled={loading} type="submit">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
                <Button disabled={loading} onClick={() => router.push("/profile")} type="button" variant="outline">
                  Cancel
                </Button>
              </div>

              {/* Security Tips */}
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-blue-900">Password Tips</h4>
                <ul className="list-inside list-disc space-y-1 text-xs text-blue-800">
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
