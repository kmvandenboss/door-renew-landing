import React, { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { QuoteFormProps, FormData, SubmissionState } from './types';

const QuoteForm: React.FC<QuoteFormProps> = ({ 
  isLocationSpecific = false, 
  location 
}) => {
  const [formState, setFormState] = useState<FormData>({
    firstName: '',
    phone: '',
    email: '',
    doorIssue: '',
    contactTime: '',
    location: ''
  });
  
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    error: null,
    success: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionState(prev => ({ ...prev, isSubmitting: true, error: null }));
  
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formState,
          location: isLocationSpecific ? location?.toLowerCase() : formState.location
        }),
      });
  
      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit form');
      }
  
      setSubmissionState(prev => ({ ...prev, success: true, isSubmitting: false }));
      setFormState({
        firstName: '',
        phone: '',
        email: '',
        doorIssue: '',
        contactTime: '',
        location: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit form',
        isSubmitting: false
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submissionState.error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg">
          <p>{submissionState.error}</p>
        </div>
      )}
      
      {submissionState.success && (
        <div className="bg-green-50 text-green-800 p-3 rounded-lg">
          <p>Thank you! We&apos;ll be in touch shortly.</p>
        </div>
      )}
  
      <div className="flex items-center justify-between gap-2 bg-green-100 text-green-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield size={20} />
          <span className="font-semibold">Get Your 100% Free Quote</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
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
      </div>

      <input
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Email Address"
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formState.email}
        onChange={handleInputChange}
      />

      <select 
        name="doorIssue"
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formState.doorIssue}
        onChange={handleInputChange}
      >
        <option value="">What&apos;s Wrong With Your Door?</option>
        <option value="weathered">Weathered/Faded</option>
        <option value="damaged">Damaged/Dented</option>
        <option value="peeling">Peeling Paint/Stain</option>
        <option value="other">Other Issue</option>
      </select>

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
    </form>
  );
};

export default QuoteForm;