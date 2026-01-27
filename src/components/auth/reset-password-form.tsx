/**
 * Reset Password Form Component
 * @description Form for setting a new password after reset request
 */

'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { passwordValidator } from '@/types/validation';

interface ResetPasswordFormProps {
  token: string;
}

/**
 * Reset Password Form Schema
 */
const resetPasswordSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string().min(1, 'Password confirmation required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset Password Form Component
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * Handle form submission
   */
  async function onSubmit(data: ResetPasswordFormData) {
    startTransition(async () => {
      try {
        // TODO: Call server action to reset password with token
        // const result = await resetPasswordAction({
        //   token,
        //   password: data.password,
        // });
        console.log('Reset password with token:', token, 'and password:', data.password);

        toast.success('Password updated successfully');
        router.push('/auth/sign-in');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to reset password');
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">New Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  className="bg-slate-800 border-slate-700 text-white"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <p className="text-xs text-slate-400 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special
                character
              </p>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  className="bg-slate-800 border-slate-700 text-white"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </Form>
  );
}
