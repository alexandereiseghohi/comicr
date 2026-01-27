/**
 * Forgot Password Form Component
 * @description Form for requesting password reset
 */

'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { emailValidator } from '@/types/validation';

/**
 * Forgot Password Form Schema
 */
const forgotPasswordSchema = z.object({
  email: emailValidator,
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Form Component
 */
export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handle form submission
   */
  async function onSubmit(data: ForgotPasswordFormData): Promise<void> {
    startTransition(async () => {
      try {
        // TODO: Call server action to send password reset email
        // const result = await sendPasswordResetEmailAction({ email: data.email });
        console.log('Reset email sent to:', data.email);

        toast.success('Check your email for password reset instructions');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
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
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </Form>
  );
}
