export interface QuoteFormProps {
  isLocationSpecific?: boolean;
  location?: string;
}

// Renamed from FormData to LeadFormData to avoid conflict
export interface LeadFormData {
  firstName: string;
  phone: string;
  email: string;
  doorIssue: string;
  contactTime: string;
  location: string;
}

export interface SecondStepData {
  images: File[];
  comments: string;
}

export interface SubmissionState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  showSecondStep: boolean;
  secondStepSubmitted: boolean;
}

export interface ImagePreview {
  file: File;
  preview: string;
}

export interface TrackingData {
  location?: string;
  url?: string;
  fbc?: string;
}

export interface MetaUserData {
  client_ip_address?: string;
  client_user_agent?: string;
  em?: string[];
  ph?: string[];
  fbc?: string;
  fbp?: string;
}

export interface MetaEvent {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  action_source: 'website';
  user_data: MetaUserData;
  custom_data?: {
    location?: string;
    value?: number;
    currency?: string;
    doorIssue?: string;
    event_id?: string;
  };
  event_id?: string;
}