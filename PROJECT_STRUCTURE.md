# Door Renew Landing Page Project Structure

## Root Directory Files

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

### `/pages`
Next.js pages directory (file-based routing)
- `_app.tsx` - Custom App component for page initialization
- `_document.tsx` - Custom Document component for page structure
- `[location].tsx` - Dynamic route page for location-specific content
- `index.tsx` - Homepage
- `/api`
  - `hello.ts` - Example API route
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
  - `door-renew-before-after-hero-sample.jpg` - Hero image for before/after comparison

### `/styles`
Styling files
- `globals.css` - Global CSS styles

### `/config`
Configuration directory
- `locations.ts` - Configuration file for location-specific data

## Project Overview
This is a Next.js project with TypeScript integration, using Tailwind CSS for styling. The project follows a standard Next.js file structure with pages-based routing and component-based architecture. It includes custom fonts (Geist), various SVG assets, and image resources for the door renovation landing page.