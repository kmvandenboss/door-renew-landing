import React, { useState } from 'react';
import { Star, Check, ArrowRight, Shield } from 'lucide-react';

interface FormData {
  firstName: string;
  phone: string;
  email: string;
  doorIssue: string;
  contactTime: string;
  location: string;
}

interface LandingPageProps {
  isLocationSpecific?: boolean;
  location?: string;
}

interface Benefit {
  title: string;
  description: string;
}

interface Review {
  quote: string;
  author: string;
  location: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  isLocationSpecific = false, 
  location = '' 
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    phone: '',
    email: '',
    doorIssue: '',
    contactTime: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const benefits: Benefit[] = [
    {
      title: "Save Thousands vs Replacement",
      description: "Professional refinishing at a fraction of replacement cost"
    },
    {
      title: "Same-Day Transformation",
      description: "Complete makeover in just one day - no lengthy installations"
    },
    {
      title: "5-Year Warranty",
      description: "Peace of mind with our industry-leading warranty"
    }
  ];

  const socialProof: Review[] = [
    {
      quote: "Our 20-year-old front door looks brand new! Saved thousands compared to replacement.",
      author: "Sarah M.",
      location: "Verified Customer"
    },
    {
      quote: "Professional, on-time, and amazing results. Best home improvement decision we made.",
      author: "Michael R.",
      location: "Verified Customer"
    },
    {
      quote: "Transformed our weather-beaten door in just one day. Incredible service!",
      author: "Jennifer K.",
      location: "Verified Customer"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6 bg-blue-600 text-white w-fit px-4 py-2 rounded-full">
            <Shield size={16} />
            <span className="text-sm font-medium">Licensed & Insured Professional Service</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Transform Your Weathered Door Into<br />
            <span className="text-blue-400">Brand New in Just One Day</span>
          </h1>
          
          <div className="text-xl md:text-2xl mb-8 text-gray-200">
            Professional Door Refinishing & Repair Services
            {isLocationSpecific ? 
              <span className="block mt-2 text-blue-400 font-semibold">in {location}</span> : 
              <span className="block mt-2">Across the United States</span>
            }
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <Star className="text-yellow-400" fill="currentColor" />
              <span>4.9/5 Rating (500+ Reviews)</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <Check className="text-green-400" />
              <span>1000+ Doors Renewed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Why Choose Door Renew?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {socialProof.map((review, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{review.quote}</p>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{review.author}</p>
                  <p className="text-gray-500">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Form */}
      <div className="fixed bottom-0 left-0 right-0 md:relative bg-white shadow-lg md:shadow-none border-t md:border-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 p-3 rounded-lg">
              <Shield size={20} />
              <span className="font-semibold">Get Your 100% Free, No-Obligation Quote</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
              
              <input
                type="tel"
                placeholder="Phone Number (Required)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <select 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.doorIssue}
              onChange={(e) => setFormData({...formData, doorIssue: e.target.value})}
            >
              <option value="">What&apos;s Wrong With Your Door?</option>
              <option value="weathered">Weathered/Faded</option>
              <option value="damaged">Damaged/Dented</option>
              <option value="peeling">Peeling Paint/Stain</option>
              <option value="other">Other Issue</option>
            </select>

            {!isLocationSpecific && (
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                <option value="">Select Your Location</option>
                <option value="detroit">Detroit</option>
                <option value="chicago">Chicago</option>
                {/* Add more locations */}
              </select>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Get Your Free Quote Now
              <ArrowRight size={20} />
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield size={16} />
              <p>Your information is secure and will never be shared</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;