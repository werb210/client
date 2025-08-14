import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, AlertCircle, ExternalLink, ArrowLeft } from "lucide-react";

interface KycSession {
  url?: string;
  providerRef?: string;
  status: string;
  reason?: string;
  success?: boolean;
}

export default function KycStart() {
  const [contactId, setContactId] = useState(
    new URLSearchParams(location.search).get("contactId") || ""
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [session, setSession] = useState<KycSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);

  const startKyc = async () => {
    if (!contactId) {
      setError("Contact ID is required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/client/privacy/kyc/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, email, phone })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to start KYC verification");
      }
      
      setSession(data.session);
      
      // If we get a URL, open it (for real Persona integration)
      if (data.url && !data.url.includes('/client/kyc/mock')) {
        window.open(data.url, '_blank');
      } else if (data.url) {
        // For mock/demo, navigate to mock page
        window.location.href = data.url;
      }
      
      // Refresh sessions list
      await loadSessions();
    } catch (error: any) {
      console.error("KYC start error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (ref: string) => {
    try {
      const response = await fetch(`/api/client/privacy/kyc/status/${ref}`);
      const data = await response.json();
      
      if (response.ok) {
        setSession(data);
        await loadSessions(); // Refresh the sessions list
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  const loadSessions = async () => {
    if (!contactId) return;
    
    try {
      const response = await fetch(`/api/client/privacy/kyc/sessions/${contactId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Load sessions error:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (contactId) {
      loadSessions();
    }
  }, [contactId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Identity Verification
              </h1>
              <p className="text-gray-600 text-sm">Secure KYC verification with Persona</p>
            </div>
          </div>
        </div>

        {/* Start Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Start KYC Verification</CardTitle>
            <p className="text-sm text-gray-600">
              Complete identity verification to access financial services
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="contact-id">Contact ID *</Label>
                <Input
                  id="contact-id"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  placeholder="Enter your contact ID"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            <Button
              onClick={startKyc}
              disabled={!contactId || loading}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {loading ? "Starting..." : "Start Verification"}
            </Button>
          </CardContent>
        </Card>

        {/* Current Session */}
        {session && (
          <Card>
            <CardHeader>
              <CardTitle>Current Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusIcon(session.status)}
                    <span className="ml-1">{session.status}</span>
                  </Badge>
                </div>
                
                {session.providerRef && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reference:</span>
                    <span className="text-sm font-mono">{session.providerRef}</span>
                  </div>
                )}
                
                {session.reason && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Details:</span>
                    <span className="text-sm">{session.reason}</span>
                  </div>
                )}
                
                {session.url && !session.url.includes('/client/kyc/mock') && (
                  <Button
                    onClick={() => window.open(session.url!, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Continue Verification
                  </Button>
                )}
                
                {session.providerRef && (
                  <Button
                    onClick={() => checkStatus(session.providerRef!)}
                    variant="outline"
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Check Status
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Sessions */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((s, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(s.status)}
                        <span className="font-medium">{s.provider}</span>
                        <Badge variant="outline" className={getStatusColor(s.status)}>
                          {s.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {s.provider_ref && (
                      <div className="mt-2 text-xs text-gray-600">
                        Ref: {s.provider_ref}
                      </div>
                    )}
                    
                    {s.reason && (
                      <div className="mt-1 text-sm text-gray-700">
                        {s.reason}
                      </div>
                    )}
                    
                    {s.provider_ref && (
                      <Button
                        onClick={() => checkStatus(s.provider_ref)}
                        size="sm"
                        variant="outline"
                        className="mt-2"
                      >
                        Check Status
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}