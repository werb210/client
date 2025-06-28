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

import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  phone: z.string().regex(/^\+1[0-9]{10}$/, 'Phone must be +1 followed by 10 digits'),
  email: z.string().email('Invalid email address').optional(),
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
        setLocation('/verify-otp');
      } else {
        // Login successful, redirect to application
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        setLocation('/step1-financial-profile');
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-teal-700">Boreal Financial</h1>
          </div>
          <CardTitle className="text-xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/request-reset" className="text-sm text-teal-600 hover:underline">
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-teal-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}