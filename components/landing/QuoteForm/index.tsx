import React, { useState, useCallback, useEffect } from 'react';
import { Shield, ArrowRight, Upload, X } from 'lucide-react';
import { QuoteFormProps, LeadFormData, SubmissionState, SecondStepData, ImagePreview } from './types';
import { MAX_FILES } from '@/utils/upload';
import { trackFormSubmission, trackSecondStepSubmission, trackEvent } from '@/utils/analytics';
import { getStoredClickId } from '@/utils/click-tracking';

const QuoteForm: React.FC<QuoteFormProps> = ({ 
  isLocationSpecific = false, 
  location 
}) => {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [formState, setFormState] = useState<LeadFormData>({
    firstName: '',
    phone: '',
    email: '',
    doorIssue: '',
    contactTime: '',
    location: ''
  });
  
  const [secondStepData, setSecondStepData] = useState<SecondStepData>({
    images: [],
    comments: ''
  });

  const [imagePreview, setImagePreview] = useState<ImagePreview[]>([]);
  
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    error: null,
    success: false,
    showSecondStep: false,
    secondStepSubmitted: false
  });

  const [hasStartedForm, setHasStartedForm] = useState(false);

  // Track form abandonment
  useEffect(() => {
    if (!hasStartedForm) return;

    const handleBeforeUnload = () => {
      if (!submissionState.success) {
        trackEvent('FormAbandon', { location: location || 'not specified' })
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStartedForm, submissionState.success, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Track first interaction with form
    if (!hasStartedForm) {
      setHasStartedForm(true);
      trackEvent('FormStart', { location: location || 'not specified' })
    }

    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = secondStepData.images.length + newFiles.length;

    if (totalFiles > MAX_FILES) {
      setSubmissionState(prev => ({
        ...prev,
        error: `Maximum ${MAX_FILES} files allowed`
      }));
      return;
    }

    // Create image previews
    const newPreviews = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreview(prev => [...prev, ...newPreviews]);
    setSecondStepData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
  };

  const removeImage = useCallback((index: number) => {
    URL.revokeObjectURL(imagePreview[index].preview);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setSecondStepData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, [imagePreview]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSecondStepData(prev => ({
      ...prev,
      comments: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!submissionState.showSecondStep) {
      // First step submission
      if (!formState.firstName || !formState.phone) {
        setSubmissionState(prev => ({
          ...prev,
          error: 'Please fill in all required fields'
        }));
        return;
      }
  
      if (!isLocationSpecific && !formState.location) {
        setSubmissionState(prev => ({
          ...prev,
          error: 'Please select your location'
        }));
        return;
      }
  
      setSubmissionState(prev => ({ ...prev, isSubmitting: true, error: null }));
      trackFormSubmission();
  
      try {
        // Get UTM parameters from URL
        const searchParams = new URLSearchParams(window.location.search);
        const utmSource = searchParams.get('utm_source');
        const utmMedium = searchParams.get('utm_medium');
        const utmCampaign = searchParams.get('utm_campaign');
  
        const response = await fetch('/api/submit-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formState.firstName,
            phone: formState.phone,
            location: isLocationSpecific ? location?.toLowerCase() : formState.location,
            utmSource,
            utmMedium,
            utmCampaign,
            fbc: getStoredClickId()
          }),
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to submit form');
        }

        setLeadId(data.leadId);
  
        setSubmissionState(prev => ({ 
          ...prev, 
          success: true, 
          isSubmitting: false,
          showSecondStep: true 
        }));
      } catch (error) {
        console.error('First step submission error:', error);
        setSubmissionState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to submit form',
          isSubmitting: false
        }));
      }
    } else {
      // Second step submission
      if (!leadId) {
        setSubmissionState(prev => ({
          ...prev,
          error: 'Unable to update lead information. Please try again.',
          isSubmitting: false
        }));
        return;
      }
      
      trackSecondStepSubmission(secondStepData.images.length > 0);
      setSubmissionState(prev => ({ ...prev, isSubmitting: true, error: null }));
      
      try {
        let imageUrls: string[] = []
        
        // Upload images if any exist
        if (secondStepData.images.length > 0) {
          const formData = new FormData();
          secondStepData.images.forEach((file) => {
            formData.append('images', file);
          });
  
          const uploadResponse = await fetch('/api/upload-images', {
            method: 'POST',
            body: formData,
          });
  
          const uploadResult = await uploadResponse.json();
          
          if (!uploadResponse.ok) {
            throw new Error(uploadResult.error || 'Failed to upload images');
          }
  
          imageUrls = uploadResult.urls;
        }
  
        // Update lead with additional information
        const response = await fetch('/api/update-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId,  // Add this line
            email: formState.email,
            doorIssue: formState.doorIssue,
            imageUrls,
            comments: secondStepData.comments
          }),
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to submit additional information');
        }
  
        setSubmissionState(prev => ({ 
          ...prev, 
          secondStepSubmitted: true,
          isSubmitting: false 
        }));
      } catch (error) {
        console.error('Second step submission error:', error);
        setSubmissionState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to submit additional information',
          isSubmitting: false
        }));
      }
    }
  };

  // Cleanup function for image previews
  React.useEffect(() => {
    return () => {
      imagePreview.forEach(preview => {
        URL.revokeObjectURL(preview.preview);
      });
    };
  }, [imagePreview]);

  if (submissionState.secondStepSubmitted) {
    return (
      <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center">
        <h3 className="font-semibold text-lg mb-2">Thank you!</h3>
        <p>We&apos;ve received your additional information and will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submissionState.error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg">
          <p>{submissionState.error}</p>
        </div>
      )}
      
      {submissionState.success && (
        <div className="bg-green-50 text-green-800 p-3 rounded-lg">
          <p>Step 2: Project Details</p>
        </div>
      )}

      {!submissionState.showSecondStep ? (
        <>
          <div className="flex items-center justify-between gap-2 bg-green-100 text-green-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield size={20} />
              <span className="font-semibold">Save Up to 80% vs Replacement</span>
            </div>
          </div>
          
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            placeholder="First Name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formState.firstName}
            onChange={handleInputChange}
          />
          
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="Phone Number (Required)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formState.phone}
            onChange={handleInputChange}
          />

          {!isLocationSpecific && (
            <select 
              name="location"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formState.location}
              onChange={handleInputChange}
            >
              <option value="">Select Your Location</option>
              <option value="detroit">Detroit</option>
              <option value="chicago">Chicago</option>
              <option value="orlando">Orlando</option>
              <option value="providence">Rhode Island</option>
            </select>
          )}
        
          <button 
            type="submit"
            disabled={submissionState.isSubmitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              submissionState.isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {submissionState.isSubmitting ? 'Sending...' : 'Get Your Free Quote Now'}
            <ArrowRight size={20} />
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield size={16} />
            <p>Your information is secure and will never be shared</p>
          </div>
        </>
      ) : (
        <>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            value={formState.email}
            onChange={handleInputChange}
          />

          <select 
            name="doorIssue"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            value={formState.doorIssue}
            onChange={handleInputChange}
          >
            <option value="">What&apos;s Wrong With Your Door?</option>
            <option value="weathered">Weathered/Faded</option>
            <option value="damaged">Damaged/Dented</option>
            <option value="peeling">Peeling Paint/Stain</option>
            <option value="other">Other Issue</option>
          </select>

          <div className="flex items-center justify-between gap-2 bg-green-100 text-green-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Upload size={20} />
              <span className="font-semibold">Want to get your quote faster? Upload a picture of your door</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Image upload section */}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="door-images"
                disabled={imagePreview.length >= MAX_FILES}
              />
              <label
                htmlFor="door-images"
                className={`cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg ${
                  imagePreview.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'
                }`}
              >
                <Upload size={20} />
                <span>Click to upload images (optional)</span>
              </label>
              <p className="text-sm text-gray-500">
                Upload up to {MAX_FILES} images, 10MB max each
              </p>
            </div>

            {/* Image previews */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={preview.preview} className="relative">
                    <img
                      src={preview.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Comments section */}
            <div>
              <textarea
                name="comments"
                placeholder="Additional comments (optional)"
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={secondStepData.comments}
                onChange={handleCommentChange}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={submissionState.isSubmitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              submissionState.isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {submissionState.isSubmitting ? 'Sending...' : 'Submit Additional Information'}
            <ArrowRight size={20} />
          </button>
        </>
      )}
    </form>
  );
};

export default QuoteForm;