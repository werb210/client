export interface MarketingTracking {
  ga_client_id?: string;
  msclkid?: string;
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export type BaseSubmissionRequest = Record<string, unknown>;

export type SubmitApplicationRequest = BaseSubmissionRequest & MarketingTracking;
