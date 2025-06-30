import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (!result.success) {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
        return;
      }

      // Save email to localStorage for future auth redirects
      localStorage.setItem('user-email', data.email);

      if (result.otpRequired) {
        // Store email for OTP verification
        sessionStorage.setItem('otpEmail', data.email);
        toast({
          title: 'OTP Sent',
          description: 'Check your phone for verification code',
        });
        setLocation('/verify-otp');
      } else {
        // Login successful, redirect to dashboard
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        setLocation('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'Unable to connect to server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-modern-primary flex items-center justify-center p-modern-lg">
      <Card className="w-full max-w-md card-modern">
        <CardHeader className="text-center p-modern-xl">
          <div className="mb-modern-lg">
            <h1 className="heading-modern-h2 text-brand-blue-700">Boreal Financial</h1>
          </div>
          <CardTitle className="heading-modern-h3">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="p-modern-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-modern-lg">
            <div className="space-y-modern-sm">
              <Label htmlFor="email" className="body-modern-small font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={`form-modern-input ${errors.email ? 'border-error-500' : ''}`}
              />
              {errors.email && (
                <p className="body-modern-small text-error-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-modern-sm">
              <Label htmlFor="password" className="body-modern-small font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={`form-modern-input ${errors.password ? 'border-error-500' : ''}`}
              />
              {errors.password && (
                <p className="body-modern-small text-error-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full btn-modern btn-modern-primary" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-modern-xl text-center space-y-modern-sm">
            <Link href="/request-reset" className="body-modern-small text-brand-blue-600 hover:text-brand-blue-700">
              Forgot your password?
            </Link>
            <p className="body-modern-small text-modern-secondary">
              Don't have an account?{' '}
              <Link href="/register" className="text-brand-blue-600 hover:text-brand-blue-700">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}