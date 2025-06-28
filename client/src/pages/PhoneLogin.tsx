import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/authApi';

const phoneLoginSchema = z.object({
  phone: z.string().regex(/^\+1[0-9]{10}$/, 'Phone must be +1 followed by 10 digits (e.g., +15878881837)'),
  email: z.string().email('Valid email address required'),
});

type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;

export default function PhoneLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Check for password reset success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'success') {
      toast({
        title: 'Password Reset Complete',
        description: 'Your password has been successfully updated. You can now log in with your new password.',
      });
      // Clean the URL
      window.history.replaceState({}, '', '/login');
    }
  }, [toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneLoginFormData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: '+15878881837', // Pre-fill test phone for development
      email: '',
    },
  });

  const onSubmit = async (data: PhoneLoginFormData) => {
    setIsLoading(true);
    try {
      // First attempt login to see if user exists
      const loginResponse = await AuthAPI.login({ 
        email: data.email, 
        password: 'temp' // Temporary password for OTP flow 
      });

      if (loginResponse.ok) {
        // User exists, OTP should be sent
        const result = await loginResponse.json();
        localStorage.setItem('user-email', data.email);
        localStorage.setItem('user-phone', data.phone);
        sessionStorage.setItem('otpEmail', data.email);
        sessionStorage.setItem('otpPhone', data.phone);
        
        toast({
          title: 'OTP Sent',
          description: `Verification code sent to ${data.phone}`,
        });
        setLocation('/verify-otp');
        
      } else if (loginResponse.status === 401 || loginResponse.status === 404) {
        // User doesn't exist, register them
        const registerResponse = await AuthAPI.register({
          email: data.email,
          phone: data.phone,
          password: 'OtpUser123!' // Default password for OTP users
        });

        if (registerResponse.ok) {
          const result = await registerResponse.json();
          localStorage.setItem('user-email', data.email);
          localStorage.setItem('user-phone', data.phone);
          sessionStorage.setItem('otpEmail', data.email);
          sessionStorage.setItem('otpPhone', data.phone);
          
          toast({
            title: 'Account Created',
            description: `Verification code sent to ${data.phone}`,
          });
          setLocation('/verify-otp');
          
        } else {
          const errorData = await registerResponse.json().catch(() => ({ message: 'Registration failed' }));
          toast({
            title: 'Registration Failed',
            description: errorData.message || 'Unable to create account',
            variant: 'destructive',
          });
        }
      } else {
        const errorData = await loginResponse.json().catch(() => ({ message: 'Login failed' }));
        toast({
          title: 'Login Failed',
          description: errorData.message || 'Unable to verify user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
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
            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">B</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Your Account
          </CardTitle>
          <p className="text-gray-600">
            Enter your phone number to receive a verification code
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+15878881837"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Format: +1 followed by 10 digits
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By continuing, you agree to receive SMS verification codes
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Having trouble?{' '}
              <Link href="/backend-test" className="text-teal-600 hover:underline">
                Test Connection
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}