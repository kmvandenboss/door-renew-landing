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