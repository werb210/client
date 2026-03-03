export type ApiResponse<T> = {
  data: T;
};

export interface DocumentCounts {
  required_count: number;
  received_count: number;
}

export interface ApplicationDocumentsResponse {
  documents: unknown[];
  document_review?: unknown;
  documentReview?: unknown;
  required_count?: number;
  received_count?: number;
}

export interface PipelineResponse {
  stages: unknown[];
  steps: unknown[];
}

export type ApiError = {
  response?: {
    data?: unknown;
    status?: number;
  };
};
