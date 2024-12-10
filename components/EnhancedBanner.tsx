import React, { useState } from 'react';
import { Phone, Star, Check } from 'lucide-react';
import { trackCallButtonClick } from '@/utils/analytics';
import { sendMetaEvent } from '@/utils/meta-api';
import { hashData } from '@/utils/meta-api';

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior
    
    if (isMobile) {
      // For mobile, proceed with click tracking and calling
      trackCallButtonClick();
      onCallClick();
    } else if (!isNumberVisible) {
      // For desktop, first show the number if it's not visible
      setIsNumberVisible(true);
      trackCallButtonClick();
      onCallClick();
    }
  };

  return (
    <div className="flex justify-center">
      {isMobile ? (
        <a
        href={`tel:${phoneNumber.replace(/\D/g, '')}`}
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
          type="button"
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

  const handleCallClick = async () => {
    // Generate a deterministic event ID
    const eventId = `call_${Date.now()}_${hashData(phoneNumber || '')}`;

    // Send Meta event
    await sendMetaEvent({
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      action_source: 'website',
      event_id: eventId,
      user_data: {
        client_ip_address: undefined,
        client_user_agent: window.navigator.userAgent,
      },
      custom_data: {
        location,
        value: 100,
        currency: 'USD',
        event_id: eventId,
        lead_type: 'phone_call'
      }
    });

    // Keep existing Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'call_button_click', {
        'event_category': 'lead_conversion',
        'event_label': location || 'general'
      });
    }

    // Also call the existing analytics function
    trackCallButtonClick();
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