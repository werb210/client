import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerifyOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const email = sessionStorage.getItem('otpEmail');

  const { refreshUser } = useAuth();

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email || '', code: data.otp }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'OTP verification failed' }));
        toast({
          title: 'Verification Failed',
          description: errorData.message || 'Invalid or expired OTP code',
          variant: 'destructive',
        });
        return;
      }

      const result = await response.json();
      sessionStorage.removeItem('otpEmail');
      await refreshUser();
      
      toast({
        title: 'Verification Successful',
        description: result.message || 'Phone number verified successfully!',
      });
      
      setLocation('/application');
    } catch (error) {
      toast({
        title: 'Verification Error',
        description: 'Unable to connect to server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email not found. Please try logging in again.',
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await apiFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to resend OTP' }));
        toast({
          title: 'Resend Failed',
          description: errorData.message || 'Unable to resend OTP',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'OTP Sent',
        description: 'A new verification code has been sent to your phone.',
      });
    } catch (error) {
      toast({
        title: 'Resend Error',
        description: 'Unable to resend OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-teal-700">Boreal Financial</h1>
          </div>
          <CardTitle className="text-xl">Verify Phone Number</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Please enter the 6-digit verification code sent to your phone.
          </p>
          {email && (
            <p className="text-sm text-gray-500">
              Account: {email}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                className={`text-center text-lg tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
                {...register('otp')}
              />
              {errors.otp && (
                <p className="text-sm text-red-600 mt-1">{errors.otp.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-sm text-teal-600"
            >
              {isResending ? 'Sending...' : "Didn't receive a code? Resend"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}