// /config/locations.ts

export interface LocationConfig {
  slug: string;
  name: string;
  state: string;
  phoneNumber: string;
  serviceArea: string[];
  meta: {
    title: string;
    description: string;
  };
  content: {
    heroHeading?: string;
    serviceAreas?: string;
    pricing?: {
      average: number;
      starting: number;
    };
  };
}

// Shared testimonials that will be used across all locations
export const sharedTestimonials = [
{
  quote: "I've told everyone I know about Door Renew. They literally saved me thousands of dollars. My two-door front entry was custom made when our home was built. It didn't weather well and I was worried I needed to buy a new front door. This was worth every penny.",
  author: "Reba M.",
  location: "Orlando, FL"
},
{
  quote: "My neighbors can't get enough. They saw the temporary door and everyone asked what was going on. I think they were skeptical. We sure weren't disappointed! What a difference our renewed front door has made!",
  author: "Jessica R.",
  location: "Rhode Island"
},
{
  quote: "Best service! Our door looks amazing now.",
  author: "Michael S.",
  location: "Royal Oak, MI"
}
];

const locations: LocationConfig[] = [
  {
    slug: 'detroit',
    name: 'Detroit',
    state: 'MI',
    phoneNumber: '3132174052',
    serviceArea: ['Royal Oak', 'Troy', 'Birmingham', 'Bloomfield Hills'],
    meta: {
      title: 'Door Renew Detroit - Professional Door Refinishing',
      description: 'Transform your old door into new for a fraction of the replacement cost. Serving Detroit, Royal Oak, Troy, and surrounding areas.',
    },
    content: {
      heroHeading: 'Detroit\'s Trusted Door Restoration Experts',
      serviceAreas: 'Serving Detroit and the entire Metro Detroit area including Royal Oak, Troy, Birmingham, and Bloomfield Hills.',
      pricing: {
        average: 1200,
        starting: 899
      }
    }
  },
  {
    slug: 'chicago',
    name: 'Chicago',
    state: 'IL',
    phoneNumber: '3132174052',
    serviceArea: ['Oak Park', 'Evanston', 'Naperville', 'Schaumburg'],
    meta: {
      title: 'Door Renew Chicago - Professional Door Refinishing',
      description: 'Transform your old door into new for a fraction of the replacement cost. Serving Chicago and Chicagoland areas.',
    },
    content: {
      heroHeading: 'Chicago\'s Premier Door Restoration Service',
      serviceAreas: 'Serving Chicago and surrounding suburbs including Oak Park, Evanston, Naperville, and Schaumburg.',
      pricing: {
        average: 1300,
        starting: 949
      }
    }
  },
  {
    slug: 'orlando',
    name: 'Orlando',
    state: 'FL',
    phoneNumber: '4074621545',
    serviceArea: ['Orlando', 'Ocala', 'Daytona', 'Longwood', 'Dr. Phillips', 'Maitland', 'Winter Park', 'Altamonte Springs', 'Oviedo', 'Kissimmee', 'Winter Garden', 'Windermere', 'Lake Nona'],
    meta: {
      title: 'Door Renew Orlando - Professional Door Refinishing',
      description: 'Transform your old door into new for a fraction of the replacement cost. Serving Orlando and surrounding areas.',
    },
    content: {
      heroHeading: 'Orlando\'s Premier Door Restoration Service',
      serviceAreas: 'Serving Orlando and surrounding areas including Maitland, Winter Park, Altamonte Springs, Oviedo, Kissimmee, Winter Garden, Windermere, Lake Nona, Ocala, Daytona, Longwood, Dr. Phillips, and Melbourne.',
      pricing: {
        average: 1300,
        starting: 949
      }
    }
  },
  {
    slug: 'providence',
    name: 'Providence',
    state: 'RI',
    phoneNumber: '4013005685',
    serviceArea: ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Fall River', 'New Bedford', 'Taunton', 'Attleboro'],
    meta: {
      title: 'Door Renew Providence - Professional Door Refinishing',
      description: 'Transform your old door into new for a fraction of the replacement cost. Serving Rhode Island and Southeast Massachusetts.',
    },
    content: {
      heroHeading: 'Providence\'s Premier Door Restoration Service',
      serviceAreas: 'Serving Rhode Island and Southeast Massachusetts including Providence, Warwick, Cranston, Pawtucket, East Providence, Fall River, New Bedford, Taunton, and Attleboro.',
      pricing: {
        average: 1300,
        starting: 949
      }
    }
  }
];

export const getLocations = () => locations;

export const getLocationBySlug = (slug: string): LocationConfig | undefined => {
return locations.find(location => location.slug === slug);
};

export const getLocationSlugs = () => {
return locations.map(location => location.slug);
};