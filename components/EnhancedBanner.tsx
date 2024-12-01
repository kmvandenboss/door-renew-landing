import React, { useState } from 'react';
import { Phone, Star, Check } from 'lucide-react';

// Removed location from CallButtonProps since it's not used
interface CallButtonProps {
  phoneNumber: string;
  onCallClick: () => void;
}

declare global {
  interface Window {
    gtag: (event: string, action: string, params: object) => void;
  }
}

const CallButton: React.FC<CallButtonProps> = ({ phoneNumber, onCallClick }) => {
  const [isNumberVisible, setIsNumberVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatPhoneNumber = (number: string): string => {
    return number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const handleClick = () => {
    onCallClick();
    if (!isMobile) {
      setIsNumberVisible(true);
    }
  };

  return (
    <div className="flex justify-center">
      {isMobile ? (
        <a
          href={`tel:+1${phoneNumber.replace(/\D/g, '')}`}
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-800 px-6 py-2 rounded-full transition-colors text-xl font-semibold"
        >
          <Phone className="w-6 h-6" />
          <span>Call Now</span>
        </a>
      ) : (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-800 px-6 py-2 rounded-full transition-colors text-xl font-semibold ${
            isNumberVisible ? 'cursor-default hover:bg-white' : ''
          }`}
        >
          <Phone className="w-6 h-6" />
          <span>
            {isNumberVisible ? formatPhoneNumber(phoneNumber) : 'Click to Call Now'}
          </span>
        </button>
      )}
    </div>
  );
};

interface EnhancedBannerProps {
  isLocationSpecific: boolean;
  location?: string;
  phoneNumber?: string;
}

const EnhancedBanner: React.FC<EnhancedBannerProps> = ({ 
  isLocationSpecific, 
  location = '',
  phoneNumber 
}) => {
  // Only show call button if we have both location and phone number
  const showCallButton = isLocationSpecific && phoneNumber;

  const handleCallClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'call_button_click', {
        'event_category': 'lead_conversion',
        'event_label': location || 'general'
      });
    }
  };

  return (
    <div className="bg-blue-50 px-4 py-3">
      <div className="text-center text-sm md:text-base font-medium text-blue-800 mb-3">
        {isLocationSpecific ? `${location}'s` : "America's"} Trusted Door Restoration Experts
      </div>
      
      {/* Trust indicators */}
    <div className="flex items-center justify-center gap-4 mt-2 text-sm text-blue-800">
      <div className="flex items-center gap-1">
        <Star className="text-yellow-500 w-4 h-4" fill="currentColor" />
        <span>4.9/5 Rating</span>
      </div>
      <div className="flex items-center gap-1">
        <Check className="text-green-500 w-4 h-4" />
        <span>1000+ Doors Restored</span>
      </div>
    </div>
      
      
      {showCallButton && phoneNumber && (
        <div className="mt-4"> {/* Changed from mt-3 to mt-4 for more spacing */}
        <CallButton 
          phoneNumber={phoneNumber}
          onCallClick={handleCallClick}
        />
      </div>
      )}
    </div>
  );
};

export default EnhancedBanner;