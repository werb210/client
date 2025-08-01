/**
 * Camera Document Upload Component
 * Enables mobile camera capture for document scanning
 */

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X, Check } from 'lucide-react';

interface CameraDocumentUploadProps {
  onFileCapture: (file: File) => void;
  onClose?: () => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export function CameraDocumentUpload({ 
  onFileCapture, 
  onClose, 
  acceptedTypes = "image/*,application/pdf",
  maxSizeMB = 10 
}: CameraDocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      onFileCapture(file);
      setUploadStatus('success');
      
      setTimeout(() => {
        setUploadStatus('idle');
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setUploadStatus('error');
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Camera className="w-5 h-5 text-teal-600" />
          <span>Upload Document</span>
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {uploadStatus === 'success' && (
          <div className="text-center text-green-600 flex items-center justify-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Document uploaded successfully!</span>
          </div>
        )}
        
        {uploadStatus === 'error' && (
          <div className="text-center text-red-600">
            Upload failed. Please try again.
          </div>
        )}
        
        <div className="grid gap-3">
          {/* Camera Capture (Mobile) */}
          {isMobile && (
            <Button
              onClick={triggerCameraInput}
              disabled={isUploading}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700"
            >
              <Camera className="w-5 h-5 mr-2" />
              {isUploading ? 'Processing...' : 'Take Photo'}
            </Button>
          )}
          
          {/* File Browser */}
          <Button
            onClick={triggerFileInput}
            variant="outline"
            disabled={isUploading}
            className="w-full h-12"
          >
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? 'Processing...' : 'Choose File'}
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>Supported formats: PDF, JPG, PNG</p>
          <p>Maximum size: {maxSizeMB}MB</p>
          {isMobile && (
            <p className="text-teal-600 font-medium mt-2">
              📱 Camera available for quick document scanning
            </p>
          )}
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Camera input with capture attribute for mobile */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment" // Use rear camera
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}

// Hook for camera upload functionality
export function useCameraUpload() {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
    // Check if camera is supported
    const checkSupport = () => {
      setIsSupported(
        'mediaDevices' in navigator && 
        'getUserMedia' in navigator.mediaDevices &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      );
    };
    
    checkSupport();
  }, []);

  const requestCameraPermission = async () => {
    if (!isSupported) return false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      return true;
    } catch (error) {
      setHasPermission(false);
      console.error('Camera permission denied:', error);
      return false;
    }
  };

  return {
    isSupported,
    hasPermission,
    requestCameraPermission
  };
}

// Wrapper component for integration with existing upload flows
export function EnhancedDocumentUpload({ 
  onFileUpload, 
  className = "",
  ...props 
}: {
  onFileUpload: (file: File) => void;
  className?: string;
  [key: string]: any;
}) {
  const [showCameraUpload, setShowCameraUpload] = useState(false);
  const { isSupported } = useCameraUpload();

  const handleFileCapture = (file: File) => {
    onFileUpload(file);
    setShowCameraUpload(false);
  };

  if (showCameraUpload) {
    return (
      <CameraDocumentUpload
        onFileCapture={handleFileCapture}
        onClose={() => setShowCameraUpload(false)}
        {...props}
      />
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => setShowCameraUpload(true)}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
        
        {isSupported && (
          <Button
            onClick={() => setShowCameraUpload(true)}
            variant="outline"
            className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan with Camera
          </Button>
        )}
      </div>
    </div>
  );
}