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
import { LocationConfig, sharedTestimonials } from '@/config/locations';
import QuoteForm from '@/components/landing/QuoteForm';
import EnhancedBanner from './EnhancedBanner';
import Link from 'next/link';
import { trackTimeOnPage } from '@/utils/analytics';

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

interface LandingPageProps {
  isLocationSpecific?: boolean;
  location?: string;
  locationData?: LocationConfig;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  isLocationSpecific = false, 
  location = '',
  locationData 
}) => {
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [hasScrolledToForm, setHasScrolledToForm] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isLocationSpecific && location) {
      // Send ViewContent event
      fetch('/api/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          url: window.location.href,
        }),
      }).catch(error => {
        console.error('Error sending view event:', error);
      });
    }
  }, [isLocationSpecific, location]); // Only run when location changes

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

  useEffect(() => {
    trackTimeOnPage();
  }, []);

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

  const socialProof: Review[] = sharedTestimonials;

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

  return (
    <div className="min-h-screen bg-white">

<div className="flex items-center justify-center md:justify-between px-6 py-4 bg-white border-b">
  <Link href="/" className="flex items-center">
    <Image
      src="/images/door-renew-logo.png"
      alt="Door Renew Logo"
      width={120} // Made slightly smaller by default
      height={60}
      className="h-auto w-auto md:w-[150px]" // Larger on desktop
      priority
    />
  </Link>
</div>
      {/* Top Banner */}
      <EnhancedBanner 
  isLocationSpecific={isLocationSpecific} 
  location={location}
  phoneNumber={locationData?.phoneNumber}
/>

      {/* Hero Section - 40vh on mobile */}
      <div className="bg-white px-4 py-8 md:py-16 min-h-[40vh] md:min-h-0 flex items-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
            Transform Your Front Door&apos;s Beauty Without The Cost Of Replacement
          </h1>
          
          <p className="text-xl md:text-2xl mb-6 text-gray-600">
            Save thousands while restoring your door to its original elegance. Our craftsmen bring new life to worn, weathered doors at a fraction of replacement cost.
          </p>
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
            {[
              {
                src: '/images/door-renew-before-after-2.jpg',
                alt: 'Door Transformation - Classic Wood Restoration'
              },
              {
                src: '/images/door-renew-before-after-4.jpg',
                alt: 'Door Transformation - Complete Surface Renewal'
              },
              {
                src: '/images/door-renew-before-after-6.jpg',
                alt: 'Door Transformation - Professional Refinishing'
              }
            ].map((image, index) => (
              <div 
                key={index}
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedImage(image.src)}
              >
                <div className="aspect-[4/3] relative overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill={true}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
                  />
                </div>
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
      <QuoteForm 
        isLocationSpecific={isLocationSpecific} 
        location={location} 
      />
    </div>
  </div>
</div>

{/* Desktop Sticky Form */}
<div className="hidden md:block fixed right-4 bottom-4 w-96 z-40">
  <div className="bg-white rounded-lg shadow-xl">
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">Get Your Free Quote</h3>
      <QuoteForm 
        isLocationSpecific={isLocationSpecific} 
        location={location} 
      />
    </div>
  </div>
</div>

      {/* Footer */}
<div className="px-4 py-8 bg-gray-50 text-center text-gray-600">
  <div className="max-w-4xl mx-auto">
    {/* Add logo here, centered above existing content */}
    <div className="mb-6">
      <Image
        src="/images/door-renew-logo.png"
        alt="Door Renew Logo"
        width={120}
        height={60}
        className="h-auto w-auto mx-auto" // mx-auto centers the image
      />
    </div>
    
    <p className="mb-2">Locally owned and operated by craftsmen in your community</p>
    {isLocationSpecific && (
      <p className="mb-4">Proudly serving {location} and surrounding areas</p>
    )}
    <div className="text-sm">
      <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 transition-colors">
        Privacy Policy
      </Link>
    </div>
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
    <QuoteForm 
      isLocationSpecific={isLocationSpecific} 
      location={location} 
    />
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