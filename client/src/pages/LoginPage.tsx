import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
// Removed problematic Toast system
import { Settings } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // ARCHIVED: OTP verification step
        // if (result.otpRequired) {
        //   sessionStorage.setItem('otpEmail', formData.email);
        //   toast({
        //     title: "OTP Sent",
        //     description: "Please check your phone for the verification code.",
        //   });
        //   setLocation('/verify-otp');
        // } else {
        
        setErrorMessage("");
        setLocation('/portal');
        
        // }
      } else {
        setErrorMessage("Invalid credentials. Please use any valid email and password (4+ characters).");
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage("Connection error: Unable to reach authentication server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <header className="w-full px-6 py-4 flex justify-between items-center border-b bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-blue-800">Boreal Financial</h1>
        <Button variant="ghost" onClick={() => setLocation('/')}>
          Back to Home
        </Button>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-blue-900">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register" onClick={() => setLocation('/register')}>
                  Register
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{errorMessage}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setLocation('/request-reset')}
                    className="text-sm text-blue-600"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={() => setLocation('/register')}
              className="p-0 text-blue-600 hover:underline"
            >
              Create one now
            </Button>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link href="/backend-diagnostic">
              <Button
                variant="link"
                className="p-0 text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1 mx-auto"
              >
                <Settings className="h-3 w-3" />
                Backend Diagnostics
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}