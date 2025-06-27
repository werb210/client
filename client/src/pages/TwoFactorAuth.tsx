import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Shield, Smartphone, ArrowLeft } from 'lucide-react';

interface TwoFactorStatus {
  is2FAEnabled: boolean;
  phoneNumber?: string;
  twoFactorComplete: boolean;
}

export default function TwoFactorAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check 2FA status
  const { data: twoFactorStatus, refetch: refetchStatus } = useQuery<TwoFactorStatus>({
    queryKey: ['/api/2fa/status'],
  });

  // Initialize step based on user's 2FA status
  useEffect(() => {
    if (twoFactorStatus) {
      if (twoFactorStatus.twoFactorComplete) {
        // User has already completed 2FA, redirect to dashboard
        setLocation('/');
        return;
      }
      
      if (twoFactorStatus.is2FAEnabled && twoFactorStatus.phoneNumber) {
        // User has 2FA enabled, show verification step
        setPhoneNumber(twoFactorStatus.phoneNumber);
        setStep('verify');
      } else {
        // User needs to set up phone number
        setStep('phone');
      }
    }
  }, [twoFactorStatus, setLocation]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const sendCodeMutation = useMutation({
    mutationFn: async (phone: string) => {
      await apiRequest('/api/2fa/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Code Sent",
        description: `Verification code sent to ${formatPhoneNumber(phoneNumber)}`,
      });
      setStep('verify');
      setResendCooldown(60); // 60 second cooldown
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      await apiRequest('/api/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "2FA verification complete",
      });
      refetchStatus();
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 11) return phone;
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phone;
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^\+1\d{10}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid US phone number in format +1XXXXXXXXXX",
        variant: "destructive",
      });
      return;
    }
    sendCodeMutation.mutate(phoneNumber);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate({ phone: phoneNumber, code: verificationCode });
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    sendCodeMutation.mutate(phoneNumber);
  };

  if (!twoFactorStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'phone' ? 'Secure Your Account' : 'Verify Your Phone'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Add your phone number for enhanced security with 2-factor authentication'
              : `Enter the 6-digit code sent to ${formatPhoneNumber(phoneNumber)}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 0 && !value.startsWith('1')) {
                        value = '1' + value;
                      }
                      if (value.length > 11) {
                        value = value.slice(0, 11);
                      }
                      setPhoneNumber(value.length > 0 ? '+' + value : '');
                    }}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  We'll send a verification code to this number
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={sendCodeMutation.isPending}
              >
                {sendCodeMutation.isPending ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={verifyCodeMutation.isPending}
              >
                {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || sendCodeMutation.isPending}
                  className="text-sm"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : sendCodeMutation.isPending 
                      ? 'Sending...' 
                      : 'Resend Code'
                  }
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('phone')}
                  className="text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change Phone Number
                </Button>
              </div>
            </form>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/api/logout'}
              className="text-sm text-gray-500"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}