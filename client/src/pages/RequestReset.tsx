import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Auth } from '@/lib/auth';
import MainLayout from '@/components/layout/MainLayout';


const resetRequestSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type ResetRequestFormData = z.infer<typeof resetRequestSchema>;

export default function RequestReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetRequestFormData>({
    resolver: zodResolver(resetRequestSchema),
  });

  const onSubmit = async (data: ResetRequestFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await Auth.requestReset(data.phone);
      const responseData = await res.json();
      
      if (res.ok) {
        setIsSubmitted(true);
        toast({
          title: 'Reset SMS Sent',
          description: responseData.message || `We've sent a password reset link to ${data.phone}. Check your SMS for the reset link.`,
        });
      } else {
        setError(responseData.error);
        toast({
          title: 'Request Failed',
          description: responseData.error || 'Unable to process reset request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setError('Unable to connect to server. Please try again.');
      toast({
        title: 'Request Error',
        description: 'Unable to connect to server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-modern-primary flex items-center justify-center p-modern-lg">
          <Card className="w-full max-w-md card-modern">
            <CardHeader className="text-center p-modern-xl">
              <CardTitle className="heading-modern-h2">Check Your SMS</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-modern-lg p-modern-xl">
              <p className="body-modern text-modern-secondary">
                We've sent password reset instructions to:
              </p>
              <p className="body-modern-large font-medium text-modern-foreground">
                {getValues('phone')}
              </p>
              <p className="body-modern-small text-modern-muted">
                Check your SMS for the reset link. The link will expire in 1 hour.
              </p>
              <div className="pt-modern-lg">
                <Link href="/login">
                  <Button variant="outline" className="w-full btn-modern">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-modern-primary flex items-center justify-center p-modern-lg">
        <Card className="w-full max-w-md card-modern">
          <CardHeader className="text-center p-modern-xl">
            <CardTitle className="heading-modern-h2">Reset Password</CardTitle>
            <p className="body-modern text-modern-secondary mt-modern-sm">
              Enter your phone number and we'll send you a link to reset your password.
            </p>
          </CardHeader>
          <CardContent className="p-modern-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-modern-lg">
              <div>
                <Label htmlFor="phone" className="body-modern-small font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                  className={`form-modern mt-modern-sm ${errors.phone ? 'border-error-500' : ''}`}
                />
                {errors.phone && (
                  <p className="body-modern-small text-error-600 mt-modern-xs">{errors.phone.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-modern" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-modern-lg text-center">
              <Link href="/login" className="body-modern-small text-brand-blue-600 hover:text-brand-blue-700">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}