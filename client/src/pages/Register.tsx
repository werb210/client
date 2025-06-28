import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import InputMask from 'react-input-mask';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { toE164 } from '@/lib/toE164';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { login } = useAuth();

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...registrationData } = data;
      
      // Format phone number to E164
      const formattedPhone = toE164(phone);
      if (!formattedPhone) {
        setError('Invalid phone number format');
        setIsLoading(false);
        return;
      }

      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: registrationData.email,
          password: registrationData.password,
          phone: formattedPhone
        }),
      });
      console.log('Registration response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        console.error('Registration error:', errorData);
        toast({
          title: 'Registration Failed',
          description: errorData.message || `Server error: ${response.status}`,
          variant: 'destructive',
        });
        return;
      }

      const result = await response.json();
      console.log('Registration result:', result);
      
      // Save email to localStorage for future auth redirects
      localStorage.setItem('user-email', data.email);

      // Check if OTP was sent successfully
      if (result.message === "OTP sent" || result.success || result.otpSent) {
        sessionStorage.setItem('otpEmail', data.email);
        toast({
          title: 'Account Created',
          description: 'SMS verification code sent to your phone.',
        });
        setLocation('/verify-otp');
      } else if (result.message === "User registered successfully") {
        // Direct registration without OTP
        toast({
          title: 'Account Created Successfully',
          description: 'Welcome to Boreal Financial!',
        });
        setLocation('/step1-financial-profile');
      } else {
        // Unexpected response format
        toast({
          title: 'Registration Issue',
          description: result.message || 'Please check your details and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Registration network error:', error);
      toast({
        title: 'Registration Error',
        description: 'Unable to connect to server. Please check your connection.',
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
          <CardTitle className="text-xl">Create Account</CardTitle>
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
              <Label htmlFor="phone">Phone Number</Label>
              <InputMask
                mask="(999) 999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    id="phone"
                    type="tel"
                    placeholder="(587) 888-1837"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                )}
              </InputMask>
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
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

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-600 hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link href="/cors-test" className="text-orange-600 hover:underline">
                Connection Test
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}