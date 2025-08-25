// DO NOT USE: client-side S3 uploads are forbidden.
// Any import here will immediately throw in DEV so we can find stragglers.
export function s3Upload() {
  throw new Error("s3Upload() called from client — forbidden. Use uploadDocument() to Staff API.");
}

export function requestS3PresignedUrl() {
  throw new Error("requestS3PresignedUrl() called from client — forbidden. Use uploadDocument() to Staff API.");
}

export function uploadFileToS3() {
  throw new Error("uploadFileToS3() called from client — forbidden. Use uploadDocument() to Staff API.");
}

export function calculateFileSHA256() {
  throw new Error("calculateFileSHA256() called from client — forbidden. Use uploadDocument() to Staff API.");
}

export function uploadDocumentToS3() {
  throw new Error("uploadDocumentToS3() called from client — forbidden. Use uploadDocument() to Staff API.");
}

export function uploadFileWithS3Validation() {
  throw new Error("uploadFileWithS3Validation() called from client — forbidden. Use uploadDocument() to Staff API.");
}

export function uploadMultipleFiles() {
  throw new Error("uploadMultipleFiles() called from client — forbidden. Use uploadDocument() to Staff API.");
}

export default function deprecated() {
  throw new Error("S3 upload module called from client — forbidden. Use uploadDocument() to Staff API.");
}