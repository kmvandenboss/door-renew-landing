import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Check, 
  ArrowRight, 
  Shield, 
  X, 
  ChevronLeft, 
  ChevronRight,
  DollarSign,
  Clock,
  Award,
  Wrench
} from 'lucide-react';
import Image from 'next/image';
import { LocationConfig } from '../config/locations';

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
  locationData?: LocationConfig;
}

interface Benefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Review {
  quote: string;
  author: string;
  location: string;
}

interface Process {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  isLocationSpecific = false, 
  location = '',
  locationData 
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    phone: '',
    email: '',
    doorIssue: '',
    contactTime: '',
    location: ''
  });
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [hasScrolledToForm, setHasScrolledToForm] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const formSection = document.getElementById('quote-form-section');
      if (formSection) {
        const rect = formSection.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
        setHasScrolledToForm(isVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
  
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          location: isLocationSpecific ? location?.toLowerCase() : formData.location
        }),
      });
  
      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit form');
      }
  
      setSubmitSuccess(true);
      setFormData({
        firstName: '',
        phone: '',
        email: '',
        doorIssue: '',
        contactTime: '',
        location: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits: Benefit[] = [
    {
      title: "Save Up To 80% vs Replacement",
      description: "Professional restoration at a fraction of the cost - typically saving $3,000-8,000 compared to a new door",
      icon: <DollarSign className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Fast, Hassle-Free Process",
      description: "Your beautifully restored door back in just 3 days, with secure protection while we work",
      icon: <Clock className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Premium Quality Guaranteed",
      description: "Expert craftsmen, marine-grade finishes, and an industry-leading 2-year warranty",
      icon: <Award className="w-8 h-8 text-blue-600" />
    }
  ];

  const process: Process[] = [
    {
      title: "Expert Assessment",
      description: "Our craftsman visits your home, examines your door, and provides a detailed quote. We'll discuss finish options and answer any questions about the process.",
      icon: <Shield className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Careful Restoration",
      description: "We carefully remove your door and install a secure temporary barrier. At our workshop, skilled artisans strip away years of wear, repair any damage, and apply premium finishes that protect against the elements.",
      icon: <Wrench className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Perfect Installation",
      description: "Your beautifully restored door returns home, expertly installed and ready to make a lasting impression. We don't leave until you're completely satisfied with every detail.",
      icon: <Check className="w-8 h-8 text-blue-600" />
    }
  ];

  const socialProof: Review[] = locationData?.content?.testimonials || [
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

  const nextReview = () => {
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === socialProof.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousReview = () => {
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === 0 ? socialProof.length - 1 : prevIndex - 1
    );
  };

  // Form component remains unchanged
  const QuoteForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submitError && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg">
          <p>{submitError}</p>
        </div>
      )}
      
      {submitSuccess && (
        <div className="bg-green-50 text-green-800 p-3 rounded-lg">
          <p>Thank you! We&apos;ll be in touch shortly.</p>
        </div>
      )}
  
      <div className="flex items-center justify-between gap-2 bg-green-100 text-green-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield size={20} />
          <span className="font-semibold">Get Your 100% Free Quote</span>
        </div>
        <button 
          type="button" 
          onClick={() => setIsFormVisible(false)}
          className="md:hidden p-1 hover:bg-green-200 rounded-full"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
  <input
    type="text"
    name="firstName"  // Added for autofill
    autoComplete="given-name"  // Added for autofill
    placeholder="First Name"
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    value={formData.firstName}
    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
  />
  
  <input
    type="tel"
    name="phone"  // Added for autofill
    autoComplete="tel"  // Added for autofill
    placeholder="Phone Number (Required)"
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    value={formData.phone}
    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
  />
</div>

<input
  type="email"
  name="email"  // Added for autofill
  autoComplete="email"  // Added for autofill
  placeholder="Email Address"
  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  value={formData.email}
  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
/>

<select 
  name="doorIssue"  // Added for consistency
  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  value={formData.doorIssue}
  onChange={e => setFormData(prev => ({ ...prev, doorIssue: e.target.value }))}
>
  <option value="">What's Wrong With Your Door?</option>
  <option value="weathered">Weathered/Faded</option>
  <option value="damaged">Damaged/Dented</option>
  <option value="peeling">Peeling Paint/Stain</option>
  <option value="other">Other Issue</option>
</select>

{!isLocationSpecific && (
  <select 
    name="location"  // Added for consistency
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    value={formData.location}
    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
  >
    <option value="">Select Your Location</option>
    <option value="detroit">Detroit</option>
    <option value="chicago">Chicago</option>
    <option value="orlando">Orlando</option>
  </select>
)}
  
      <button 
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Sending...' : 'Get Your Free Quote Now'}
        <ArrowRight size={20} />
      </button>
  
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Shield size={16} />
        <p>Your information is secure and will never be shared</p>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-blue-50 px-4 py-3 text-center text-sm md:text-base font-medium text-blue-800">
        {isLocationSpecific ? `${location}'s` : "America's"} Trusted Door Restoration Experts
      </div>

      {/* Hero Section - 40vh on mobile */}
      <div className="bg-white px-4 py-8 md:py-16 min-h-[40vh] md:min-h-0 flex items-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
            Transform Your Front Door&apos;s Beauty Without The Cost Of Replacement
          </h1>
          
          <p className="text-xl md:text-2xl mb-6 text-gray-600">
            Save thousands while restoring your door to its original elegance. Our craftsmen bring new life to worn, weathered doors at a fraction of replacement cost.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <Star className="text-yellow-500" fill="currentColor" />
              <span className="text-gray-800">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <Check className="text-green-500" />
              <span className="text-gray-800">1000+ Doors Restored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Image
            src="/images/door-renew-before-after-hero-sample.jpg"
            alt="Door Refinishing Before and After Transformation"
            width={1920}
            height={1081}
            className="w-full object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Why Replace Section */}
      <div className="px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Why Replace When You Can Restore?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your front door tells a story. Unfortunately, time, weather, and daily use can leave that story looking worn and tired. Many homeowners assume replacement is their only option - but there&apos;s a smarter solution.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            Our specialized restoration process not only preserves your door&apos;s original character but delivers outstanding results at a fraction of replacement cost. Here&apos;s why hundreds of homeowners have chosen Door Renew:
          </p>
        </div>
      </div>

      {/* Benefits Section */}
<div className="px-4 py-12 bg-gray-50">
  <div className="max-w-4xl mx-auto">
    <div className="grid md:grid-cols-3 gap-6">
      {benefits.map((benefit, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-shrink-0">{benefit.icon}</div>
            <h3 className="text-xl font-semibold">{benefit.title}</h3>
          </div>
          <p className="text-gray-600">{benefit.description}</p>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* Recent Transformations */}
      <div className="px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Recent Transformations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <div 
                key={index}
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedImage(`/images/door-renew-before-after-hero-sample.jpg`)}
              >
                <Image
                  src="/images/door-renew-before-after-hero-sample.jpg"
                  alt={`Door Transformation ${index + 1}`}
                  width={400}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <Image
              src={selectedImage}
              alt="Door Transformation"
              width={1920}
              height={1081}
              className="rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Process Section */}
      <div className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Your Door&apos;s Journey to Renewed Beauty
          </h2>
          <div className="space-y-8">
            {process.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className="px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            The Safe Choice for Your Home
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              "Secure temporary barrier",
              "Licensed and insured",
              "Marine-grade finishes",
              "UV-protected coatings",
              "Eco-friendly process"
            ].map((feature, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <Check className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-gray-600">
            <p className="font-medium text-lg">Did You Know?</p>
            <p>A quality front door can last generations with proper care. Our restoration process not only saves you money today but helps preserve your home&apos;s original character for years to come.</p>
          </div>
        </div>
      </div>

      {/* Social Proof - Review Slider */}
      <div className="px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            What Our Customers Say
          </h2>
          <div className="relative">
            {/* Review Cards Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
              >
                {socialProof.map((review, index) => (
                  <div 
                    key={index}
                    className="w-full flex-shrink-0"
                  >
                    <div className="bg-gray-50 p-6 rounded-lg max-w-xl mx-auto">
                      <div className="flex text-yellow-400 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 text-lg">{review.quote}</p>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{review.author}</p>
                        <p className="text-gray-500">{review.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button 
                onClick={previousReview}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft size={24} />
              </button>
              
              {/* Dot Indicators */}
              <div className="flex gap-2">
                {socialProof.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReviewIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentReviewIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>

              <button 
                onClick={nextReview}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Next review"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
<div id="quote-form-section" className="px-4 py-12 bg-white md:hidden">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
      Ready to Transform Your Door?
    </h2>
    <p className="text-center text-gray-600 mb-8">
      Get your free, no-obligation assessment
    </p>
    <div className={`${hasScrolledToForm ? 'block' : 'hidden'}`}>
      <QuoteForm />
    </div>
  </div>
</div>

{/* Desktop Sticky Form */}
<div className="hidden md:block fixed right-4 bottom-4 w-96 z-40">
  <div className="bg-white rounded-lg shadow-xl">
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">Get Your Free Quote</h3>
      <QuoteForm />
    </div>
  </div>
</div>

      {/* Footer */}
      <div className="px-4 py-8 bg-gray-50 text-center text-gray-600">
        <div className="max-w-4xl mx-auto">
          <p className="mb-2">Locally owned and operated by craftsmen in your community</p>
          {isLocationSpecific && (
            <p>Proudly serving {location} and surrounding areas</p>
          )}
        </div>
      </div>

      {/* Mobile Form Slide-up */}
      <div className={`
        fixed inset-x-0 bottom-0 transform md:hidden
        ${isFormVisible ? 'translate-y-0' : 'translate-y-full'}
        transition-transform duration-300 ease-in-out
        bg-white shadow-lg rounded-t-xl z-40
        max-h-[90vh] overflow-y-auto
     `}>
        <div className="p-4">
          <QuoteForm />
        </div>
      </div>

      {/* Sticky CTA Button (Mobile Only) - Hide when form is visible */}
      {!isFormVisible && !hasScrolledToForm && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg md:hidden z-30">
          <button
            onClick={() => setIsFormVisible(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Get Your Free Quote Now
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;