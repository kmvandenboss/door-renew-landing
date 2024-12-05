# Door Renew Landing Page Project Structure

## Root Directory Files

- `.env` - Environment variables configuration
- `.eslintrc.json` - ESLint configuration for code linting
- `.gitignore` - Specifies which files Git should ignore
- `next.config.js` - Next.js configuration file
- `package.json` & `package-lock.json` - Node.js project configuration and dependencies
- `postcss.config.mjs` - PostCSS configuration for CSS processing
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## Core Directories

### `/components`
Contains reusable React components
- `LandingPage.tsx` - Main landing page component
- `EnhancedBanner.tsx` - Enhanced banner component for improved visual presentation
- `/landing` - Landing page specific components
  - `/QuoteForm` - Quote form component directory
    - `index.tsx` - Quote form component implementation
    - `types.ts` - TypeScript types for quote form

### `/pages`
Next.js pages directory (file-based routing)
- `_app.tsx` - Custom App component for page initialization
- `_document.tsx` - Custom Document component for page structure
- `[location].tsx` - Dynamic route page for location-specific content
- `index.tsx` - Homepage
- `privacy-policy.tsx` - Privacy policy page
- `/api`
  - `hello.ts` - Example API route
  - `submit-lead.ts` - API endpoint for lead submission
  - `update-lead.ts` - API endpoint for updating lead information
  - `upload-images.ts` - API endpoint for image uploads
  - `test-blob.ts` - API endpoint for blob storage testing
  - `track-view.ts` - API endpoint for tracking page views
  - `track-events.ts` - API endpoint for tracking user events
- `/fonts`
  - `GeistMonoVF.woff` - Geist Mono variable font
  - `GeistVF.woff` - Geist variable font

### `/public`
Static assets directory
- `favicon.ico` - Website favicon
- `file.svg` - File icon
- `globe.svg` - Globe icon
- `next.svg` - Next.js logo
- `vercel.svg` - Vercel logo
- `window.svg` - Window icon
- `/images`
  - `door-renew-logo.png` - Door Renew logo
  - `door-renew-before-after-hero-sample.jpg` - Hero image for before/after comparison
  - `door-renew-before-after-hero.jpg` - Updated hero image for before/after comparison
  - `door-renew-before-after-2.jpg` - Before/after comparison image
  - `door-renew-before-after-3.jpg` - Before/after comparison image
  - `door-renew-before-after-4.jpg` - Before/after comparison image
  - `door-renew-before-after-5.jpg` - Before/after comparison image
  - `door-renew-before-after-6.jpg` - Before/after comparison image
  - `door-renew-before-after-21.jpg` - Additional before/after comparison image
  - `installed.jpg` - Installation process image
  - `shop.jpg` - Workshop/shop image
  - `van.jpg` - Service van image
  - `/restore` - Restoration process images
    - `installed.jpg` - Installation process image
    - `shop.jpg` - Workshop/shop image
    - `van.jpg` - Service van image

### `/styles`
Styling files
- `globals.css` - Global CSS styles

### `/config`
Configuration directory
- `locations.ts` - Configuration file for location-specific data

### `/prisma`
Database configuration and schema
- `schema.prisma` - Prisma database schema definition

### `/utils`
Utility functions and helpers
- `upload.ts` - Utility functions for handling file uploads
- `meta-api.ts` - Utility functions for API metadata handling
- `analytics.ts` - Utility functions for analytics and tracking
- `click-tracking.ts` - Utility functions for tracking user clicks
- `debug-events.ts` - Utility functions for debugging events
- `ebug-events.ts` - Duplicate debug events file (likely a typo)

## Project Overview
This is a Next.js project with TypeScript integration, using Tailwind CSS for styling and Prisma for database management. The project follows a standard Next.js file structure with pages-based routing and component-based architecture. It includes custom fonts (Geist), various SVG assets, and image resources for the door renovation landing page.
