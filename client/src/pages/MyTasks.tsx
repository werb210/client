import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  User
} from "lucide-react";

type DocumentRequest = { 
  id: string; 
  title: string; 
  description?: string; 
  status: string; 
  required: boolean; 
  due_date?: string; 
  application_id: string;
  created_at?: string;
  uploaded_filename?: string;
};

export default function MyTasks() {
  const contactId = new URLSearchParams(location.search).get("contactId") || "";
  const [items, setItems] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string>("");
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`/api/client/docreq?contactId=${encodeURIComponent(contactId)}`);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const tasks = await response.json();
      setItems(Array.isArray(tasks) ? tasks : []);
    } catch (error: any) {
      console.error("Load tasks error:", error);
      setError(error.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (reqId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";
    
    input.onchange = async () => {
      const file = (input.files || [])[0];
      if (!file) return;
      
      setUploading(reqId);
      setError("");
      
      try {
        // Step 1: Get presigned URL
        const presignResponse = await fetch("/api/client/docreq/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contactId, 
            requestId: reqId, 
            filename: file.name, 
            contentType: file.type || "application/octet-stream" 
          })
        });
        
        if (!presignResponse.ok) {
          throw new Error("Failed to get upload URL");
        }
        
        const presignData = await presignResponse.json();
        
        // Step 2: Upload to S3
        const uploadResponse = await fetch(presignData.url, {
          method: "PUT",
          headers: { 
            "Content-Type": file.type || "application/octet-stream" 
          },
          body: file
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }
        
        // Step 3: Finalize upload
        const finalizeResponse = await fetch("/api/client/docreq/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contactId, 
            requestId: reqId, 
            filename: file.name, 
            s3_key: presignData.key, 
            contentType: file.type || "application/octet-stream" 
          })
        });
        
        if (!finalizeResponse.ok) {
          throw new Error("Failed to finalize upload");
        }
        
        // Reload tasks to show updated status
        await loadTasks();
        
      } catch (error: any) {
        console.error("Upload error:", error);
        setError(`Upload failed: ${error.message}`);
      } finally {
        setUploading("");
      }
    };
    
    input.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
      case "uploaded":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "rejected":
      case "missing":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "uploaded":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "missing":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isUploadDisabled = (status: string) => {
    return ["approved", "completed"].includes(status.toLowerCase());
  };

  useEffect(() => {
    if (contactId) {
      loadTasks();
    }
  }, [contactId]);

  if (!contactId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Missing Contact ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Please provide a contactId parameter to view your tasks.</p>
            <div className="mt-4">
              <Input
                placeholder="Enter Contact ID"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value;
                    if (value) {
                      window.location.search = `?contactId=${encodeURIComponent(value)}`;
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              My Tasks
            </h1>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <User className="w-4 h-4" />
              Contact: {contactId}
            </p>
          </div>
          <Button onClick={loadTasks} disabled={loading} variant="outline">
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Document Requests ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your tasks...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tasks found for this contact.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium">Task</th>
                      <th className="text-center p-3 font-medium">Required</th>
                      <th className="text-center p-3 font-medium">Due Date</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-center p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                          )}
                          {task.uploaded_filename && (
                            <div className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {task.uploaded_filename}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {task.required ? (
                            <Badge variant="destructive">Required</Badge>
                          ) : (
                            <Badge variant="secondary">Optional</Badge>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {task.due_date ? (
                            <div className="flex items-center justify-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status}</span>
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {isUploadDisabled(task.status) ? (
                            <span className="text-green-600 font-medium">✓ Complete</span>
                          ) : (
                            <Button
                              onClick={() => uploadDocument(task.id)}
                              disabled={uploading === task.id}
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              {uploading === task.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <Upload className="w-4 h-4 mr-1" />
                              )}
                              {uploading === task.id ? "Uploading..." : "Upload"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Supported File Types:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF documents (.pdf)</li>
                  <li>• Word documents (.doc, .docx)</li>
                  <li>• Excel spreadsheets (.xls, .xlsx)</li>
                  <li>• Images (.png, .jpg, .jpeg)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Upload Process:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click "Upload" to select your file</li>
                  <li>• Files are securely uploaded to cloud storage</li>
                  <li>• Status updates automatically after upload</li>
                  <li>• Required documents must be uploaded to proceed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}