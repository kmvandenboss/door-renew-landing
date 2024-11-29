
export interface QuoteFormProps {
  isLocationSpecific?: boolean;
  location?: string;
}

export interface FormData {
  firstName: string;
  phone: string;
  email: string;
  doorIssue: string;
  contactTime: string;
  location: string;
}

export interface SubmissionState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}