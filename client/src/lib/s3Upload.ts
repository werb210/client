/**
 * S3 Upload System - Pre-signed URL Upload Logic
 * Migrated from local filesystem to Amazon S3
 */

export interface S3UploadRequest {
  applicationId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256Hash?: string;
}

export interface S3UploadResponse {
  success: boolean;
  presignedUrl?: string;
  documentId?: string;
  s3Key?: string;
  error?: string;
}

export interface S3UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Calculate SHA256 hash of file for integrity validation
 */
export async function calculateFileSHA256(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('🔒 [S3] SHA256 calculated:', hashHex.substring(0, 16) + '...');
    return hashHex;
  } catch (error) {
    console.error('❌ [S3] SHA256 calculation failed:', error);
    return '';
  }
}

/**
 * Request pre-signed URL from staff backend
 */
export async function requestS3PresignedUrl(request: S3UploadRequest): Promise<S3UploadResponse> {
  try {
    console.log('📤 [S3] Requesting pre-signed URL:', request);
    
    const response = await fetch('/api/s3-documents-new/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [S3] Failed to get pre-signed URL:', response.status, errorText);
      return {
        success: false,
        error: `Failed to get upload URL: ${response.status}`
      };
    }

    const result = await response.json();
    console.log('✅ [S3] Pre-signed URL received:', { documentId: result.documentId, hasUrl: !!result.presignedUrl });
    
    return result;
  } catch (error) {
    console.error('❌ [S3] Error requesting pre-signed URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Upload file directly to S3 using pre-signed URL
 */
export async function uploadFileToS3(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: S3UploadProgress) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📤 [S3] Starting direct upload to S3:', { fileName: file.name, size: file.size });

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: S3UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
          console.log(`📈 [S3] Upload progress: ${progress.percentage}%`);
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('✅ [S3] File uploaded successfully to S3');
          resolve({ success: true });
        } else {
          console.error('❌ [S3] S3 upload failed:', xhr.status, xhr.statusText);
          resolve({ 
            success: false, 
            error: `S3 upload failed: ${xhr.status} ${xhr.statusText}` 
          });
        }
      };

      xhr.onerror = () => {
        console.error('❌ [S3] Network error during S3 upload');
        resolve({ 
          success: false, 
          error: 'Network error during S3 upload' 
        });
      };

      xhr.ontimeout = () => {
        console.error('❌ [S3] S3 upload timeout');
        resolve({ 
          success: false, 
          error: 'Upload timeout' 
        });
      };

      // Configure request
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 300000; // 5 minute timeout

      // Start upload
      xhr.send(file);
    });

  } catch (error) {
    console.error('❌ [S3] Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload error'
    };
  }
}

/**
 * Complete S3 upload workflow: Request URL + Upload + Confirm
 */
export async function uploadDocumentToS3(
  file: File,
  applicationId: string,
  documentType: string,
  onProgress?: (progress: S3UploadProgress) => void
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    // Step 1: Calculate SHA256 hash for integrity validation
    const sha256Hash = await calculateFileSHA256(file);
    
    // Step 2: Request pre-signed URL
    const urlRequest: S3UploadRequest = {
      applicationId,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      sha256Hash
    };

    const urlResponse = await requestS3PresignedUrl(urlRequest);
    
    if (!urlResponse.success || !urlResponse.presignedUrl) {
      return {
        success: false,
        error: urlResponse.error || 'Failed to get upload URL'
      };
    }

    // Step 3: Upload directly to S3
    const uploadResult = await uploadFileToS3(file, urlResponse.presignedUrl, onProgress);
    
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error
      };
    }

    // Step 4: Confirm upload with staff backend
    try {
      const confirmResponse = await fetch('/api/s3-documents-new/upload-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify({
          documentId: urlResponse.documentId,
          applicationId,
          documentType,
          fileName: file.name,
          fileSize: file.size
        })
      });

      if (confirmResponse.ok) {
        console.log('✅ [S3] Upload confirmed with staff backend');
      } else {
        console.warn('⚠️ [S3] Upload confirmation failed, but file is in S3');
      }
    } catch (confirmError) {
      console.warn('⚠️ [S3] Upload confirmation error:', confirmError);
    }

    return {
      success: true,
      documentId: urlResponse.documentId
    };

  } catch (error) {
    console.error('❌ [S3] Complete upload workflow failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Get S3 download URL for document viewing/downloading
 */
export async function getS3DocumentUrl(
  applicationId: string,
  documentId: string,
  action: 'view' | 'download' = 'view'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log(`📥 [S3] Requesting ${action} URL for document:`, documentId);

    const response = await fetch('/api/s3-documents-new/document-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify({
        applicationId,
        documentId,
        action
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [S3] Failed to get ${action} URL:`, response.status, errorText);
      return {
        success: false,
        error: `Failed to get ${action} URL: ${response.status}`
      };
    }

    const result = await response.json();
    console.log(`✅ [S3] ${action} URL received:`, { hasUrl: !!result.url });

    return result;
  } catch (error) {
    console.error(`❌ [S3] Error getting ${action} URL:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}