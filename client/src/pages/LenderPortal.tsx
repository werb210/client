import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  MessageCircle, 
  Upload, 
  Send, 
  Building2, 
  DollarSign,
  Clock,
  User,
  AlertCircle
} from "lucide-react";

interface Application {
  id: string;
  product_category: string;
  stage: string;
  amount_requested: string;
}

interface Document {
  id: string;
  filename: string;
  category: string;
  source: string;
  created_at: string;
}

interface Message {
  id: string;
  body: string;
  created_at: string;
  role: string;
  direction: string;
}

export default function LenderPortal() {
  const token = new URLSearchParams(location.search).get("token") || "";
  const [app, setApp] = useState<Application | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load application and documents
      const appResponse = await fetch(`/api/lender/app?token=${encodeURIComponent(token)}`);
      if (!appResponse.ok) {
        const errorData = await appResponse.json();
        throw new Error(errorData.error || "Failed to load application");
      }
      
      const appData = await appResponse.json();
      setApp(appData.application);
      setDocs(appData.documents || []);
      
      // Load messages
      const msgsResponse = await fetch(`/api/lender/messages?token=${encodeURIComponent(token)}`);
      if (msgsResponse.ok) {
        const msgsData = await msgsResponse.json();
        setMsgs(msgsData || []);
      }
    } catch (error: any) {
      console.error("Load data error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageBody.trim()) return;
    
    try {
      const response = await fetch(`/api/lender/messages?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageBody })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }
      
      setMessageBody("");
      await loadData(); // Reload to show new message
    } catch (error: any) {
      console.error("Send message error:", error);
      setError(error.message);
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      
      const response = await fetch(`/api/lender/upload?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentB64: base64,
          category: "lender_submission"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }
      
      await loadData(); // Reload to show new document
      
      // Clear the file input
      event.target.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const setupDemo = async () => {
    try {
      const response = await fetch(`/api/lender/demo/setup?token=${encodeURIComponent(token)}`, {
        method: "POST"
      });
      
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Demo setup error:", error);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "underwriting":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "lender":
        return <Building2 className="w-3 h-3" />;
      case "applicant":
        return <User className="w-3 h-3" />;
      default:
        return <MessageCircle className="w-3 h-3" />;
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No access token provided. Please use the link provided by the application team.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lender workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Lender Workspace
            </h1>
            <p className="text-gray-600 text-sm">Secure access to application documents and communications</p>
          </div>
          {!app && (
            <Button onClick={setupDemo} variant="outline" size="sm">
              Setup Demo Data
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Application Summary */}
        {app && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Application ID</p>
                  <p className="font-mono text-sm">{app.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Type</p>
                  <p className="font-medium">{app.product_category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stage</p>
                  <Badge className={getStageColor(app.stage)}>
                    <Clock className="w-3 h-3 mr-1" />
                    {app.stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Requested</p>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {app.amount_requested}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents ({docs.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm text-gray-600">
                    {uploading ? "Uploading..." : "Click to upload documents"}
                  </span>
                  <input
                    type="file"
                    onChange={uploadFile}
                    disabled={uploading}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                </label>
              </div>

              {/* Documents List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {docs.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No documents uploaded yet</p>
                ) : (
                  docs.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.filename}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {doc.category && (
                              <Badge variant="secondary" className="text-xs">
                                {doc.category}
                              </Badge>
                            )}
                            {doc.source && (
                              <Badge variant="outline" className="text-xs">
                                {doc.source}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages ({msgs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages List */}
              <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {msgs.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No messages yet</p>
                ) : (
                  msgs.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {getRoleIcon(msg.role)}
                        <span className="text-xs font-medium text-gray-700 capitalize">
                          {msg.role || "System"}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{msg.body}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <Separator />
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!messageBody.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>Secure lender portal • All communications are encrypted and logged</p>
        </div>
      </div>
    </div>
  );
}