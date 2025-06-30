import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { UserPlus, User, Mail, Smartphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '@/components/layout/MainLayout';

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().regex(/^\+1\d{10}$/, "Phone number must be in format +1XXXXXXXXXX")
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Registration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      return await apiRequest('/api/auth/register', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Account created successfully. You'll now receive a verification code.",
      });
      setLocation('/2fa');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    let digits = value.replace(/\D/g, '');
    
    // Ensure it starts with 1 for US numbers
    if (digits.length > 0 && !digits.startsWith('1')) {
      digits = '1' + digits;
    }
    
    // Limit to 11 digits (1 + 10 digit number)
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }
    
    return digits.length > 0 ? '+' + digits : '';
  };

  const onSubmit = (data: RegistrationData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-modern-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-modern">
        <CardHeader className="text-center p-modern-xl">
          <div className="mx-auto w-12 h-12 bg-brand-blue-100 rounded-modern-full flex items-center justify-center mb-modern-lg">
            <UserPlus className="w-6 h-6 text-brand-blue-600" />
          </div>
          <CardTitle className="heading-modern-h2">Create Your Account</CardTitle>
          <CardDescription className="body-modern-small text-modern-secondary">
            Register to access the financial application portal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-modern-xl">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-modern-lg">
            <div className="grid grid-cols-2 gap-modern-lg">
              <div className="space-y-modern-sm">
                <Label htmlFor="firstName" className="body-modern-small font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="form-modern-input pl-10"
                    {...form.register('firstName')}
                  />
                </div>
                {form.formState.errors.firstName && (
                  <p className="body-modern-small text-error-600">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-modern-sm">
                <Label htmlFor="lastName" className="body-modern-small font-medium">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="form-modern-input pl-10"
                    {...form.register('lastName')}
                  />
                </div>
                {form.formState.errors.lastName && (
                  <p className="body-modern-small text-error-600">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-modern-sm">
              <Label htmlFor="email" className="body-modern-small font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="form-modern-input pl-10"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="body-modern-small text-error-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-modern-sm">
              <Label htmlFor="phoneNumber" className="body-modern-small font-medium">Mobile Phone</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="form-modern-input pl-10"
                  {...form.register('phoneNumber', {
                    onChange: (e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      form.setValue('phoneNumber', formatted);
                    }
                  })}
                />
              </div>
              {form.formState.errors.phoneNumber && (
                <p className="body-modern-small text-error-600">{form.formState.errors.phoneNumber.message}</p>
              )}
              <p className="body-modern-small text-modern-tertiary">
                We'll send SMS verification codes to this number
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-modern btn-modern-primary" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account & Verify Phone'}
            </Button>
          </form>

          <div className="text-center mt-modern-lg">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/api/logout'}
              className="body-modern-small text-modern-tertiary hover:text-modern-secondary"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}