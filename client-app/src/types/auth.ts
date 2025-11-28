export interface UserSession {
  email: string;
  phone: string;
  applicationStatus: "not_started" | "in_progress" | "submitted";
}

