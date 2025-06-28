import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/authApi';


const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/reset-password/:token');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const token = params?.token;
  
  // Dev-only bypass for faster testing
  const devBypassToken = import.meta.env.DEV ? 'dev-bypass-token' : null;

  const onSubmit = async (data: ResetPasswordFormData) => {
    const resetToken = token || devBypassToken;
    
    if (!resetToken) {
      toast({
        title: 'Invalid Reset Link',
        description: 'The password reset link is invalid or expired.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const res = await AuthAPI.resetPassword(resetToken, data.newPassword);
      
      if (res.ok) {
        setIsSuccess(true);
        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been updated successfully.',
        });
        // Navigate to login with success parameter
        setTimeout(() => {
          setLocation('/login?reset=success');
        }, 2000);
      } else {
        const errorText = await res.text();
        setError(errorText);
        toast({
          title: 'Reset Failed',
          description: errorText || 'Unable to reset password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Unable to connect to server. Please try again.');
      toast({
        title: 'Reset Error',
        description: 'Unable to connect to server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!match || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-teal-700">Boreal Financial</h1>
            </div>
            <CardTitle className="text-xl text-red-600">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              The password reset link is invalid or has expired.
            </p>
            <Link href="/request-reset">
              <Button className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-teal-700">Boreal Financial</h1>
            </div>
            <CardTitle className="text-xl text-green-600">Password Updated</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Link href="/login">
              <Button className="w-full">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-teal-700">Boreal Financial</h1>
          </div>
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Please enter your new password below.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className={errors.newPassword ? 'border-red-500' : ''}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-teal-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}