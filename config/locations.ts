// /config/locations.ts

export interface LocationConfig {
    slug: string;            // URL-friendly name (e.g., 'detroit')
    name: string;           // Display name (e.g., 'Detroit')
    state: string;          // State abbreviation (e.g., 'MI')
    serviceArea: string[];  // List of areas served
    meta: {
      title: string;       // SEO title
      description: string; // SEO description
    };
    content: {
      heroHeading?: string;    // Optional custom hero heading
      serviceAreas?: string;   // Description of service areas
      testimonials?: {         // Location-specific testimonials
        quote: string;
        author: string;
        location: string;
      }[];
      pricing?: {              // Location-specific pricing
        average: number;
        starting: number;
      };
    };
  }
  
  const locations: LocationConfig[] = [
    {
      slug: 'detroit',
      name: 'Detroit',
      state: 'MI',
      serviceArea: ['Royal Oak', 'Troy', 'Birmingham', 'Bloomfield Hills'],
      meta: {
        title: 'Door Renew Detroit - Professional Door Refinishing',
        description: 'Transform your old door into new for a fraction of the replacement cost. Serving Detroit, Royal Oak, Troy, and surrounding areas.',
      },
      content: {
        heroHeading: 'Detroit\'s Trusted Door Restoration Experts',
        serviceAreas: 'Serving Detroit and the entire Metro Detroit area including Royal Oak, Troy, Birmingham, and Bloomfield Hills.',
        testimonials: [
          {
            quote: "Best service in Detroit! Our door looks amazing now.",
            author: "Michael S.",
            location: "Royal Oak, MI"
          }
        ],
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
      serviceArea: ['Oak Park', 'Evanston', 'Naperville', 'Schaumburg'],
      meta: {
        title: 'Door Renew Chicago - Professional Door Refinishing',
        description: 'Transform your old door into new for a fraction of the replacement cost. Serving Chicago and Chicagoland areas.',
      },
      content: {
        heroHeading: 'Chicago\'s Premier Door Restoration Service',
        serviceAreas: 'Serving Chicago and surrounding suburbs including Oak Park, Evanston, Naperville, and Schaumburg.',
        testimonials: [
          {
            quote: "Incredible transformation of our vintage door!",
            author: "Jennifer L.",
            location: "Oak Park, IL"
          }
        ],
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
        serviceArea: ['Orlando', 'Ocala', 'Daytona', 'Longwood', 'Dr. Phillips', 'Maitland', 'Winter Park', 'Altamonte Springs', 'Oviedo', 'Kissimmee', 'Winter Garden', 'Windermere', 'Lake Nona'],
        meta: {
          title: 'Door Renew Orlando - Professional Door Refinishing',
          description: 'Transform your old door into new for a fraction of the replacement cost. Serving Chicago and Chicagoland areas.',
        },
        content: {
          heroHeading: 'Orlando\'s Premier Door Restoration Service',
          serviceAreas: 'Serving Orlando and surrounding areas including Maitland, Winter Park, Altamonte Springs, Oviedo, Kissimmee, Winter Garden, Windermere, Lake Nona, Ocala, Daytona, Longwood, Dr. Phillips, and Melbourne.',
          testimonials: [
            {
              quote: "I&apos;ve told everyone I know about Door Renew. They literally saved me thousands of dollars. My two-door front entry was custom made when our home was built. It didn&apos;t weather well and I was worried I needed to buy a new front door. This was worth every penny.",
              author: "Reba M.",
              location: "Orlando, FL"
            }
          ],
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