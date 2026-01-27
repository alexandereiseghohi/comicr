/**
 * Sign Up Form Component
 * @description Registration form with validation and password confirmation
 */

'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
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
import { emailValidator, passwordValidator } from '@/types/validation';

/**
 * Sign up form validation schema
 */
const signUpSchema = z
  .object({
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string().min(1, 'Password confirmation required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Sign Up Form Component
 */
export function SignUpForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * Handle form submission
   */
  async function onSubmit(data: SignUpFormData): Promise<void> {
    startTransition(async () => {
      try {
        // TODO: Call server action to create user
        // const result = await createUserAction({ email: data.email, password: data.password });

        toast.success('Account created successfully');

        // Auto sign in after registration
        const signInResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (!signInResult?.ok) {
          router.push('/auth/sign-in');
          return;
        }

        router.push('/');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create account');
        console.error(error);
      }
    });
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Email</FormLabel>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Password</FormLabel>
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

          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 mt-1"
              disabled={isPending}
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              I agree to the{' '}
              <a href="#" className="text-blue-500 hover:text-blue-400">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-500 hover:text-blue-400">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isPending}
          >
            {isPending ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
