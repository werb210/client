export type ApiResponse<T> = {
  data: T;
};

export type ApiError = {
  response?: {
    data?: unknown;
    status?: number;
  };
};
