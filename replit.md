# Protocolo Gelatina Bariátrica - Advertorial

## Overview
This is a React-based advertorial/quiz flow application for a weight loss product called "Protocolo Gelatina Bariátrica". The app features an interactive quiz that collects user information and presents a sales pitch for the product.

## Technology Stack
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Language**: TypeScript 5.8.2
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **Fonts**: Merriweather (serif), Inter (sans-serif)

## Project Structure
```
.
├── components/
│   ├── Header.tsx          # Top navigation bar
│   ├── NewsFeed.tsx        # Bottom section with news/social proof
│   └── QuizFlow.tsx        # Main quiz component with multi-step flow
├── App.tsx                 # Main app component
├── index.tsx               # Entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Features
- Interactive multi-step quiz flow
- Testimonials from verified customers
- Dynamic BMI visualization
- Loading animations with progress bar
- Responsive mobile-first design
- Spanish language interface

## Recent Changes (November 29, 2025)
- ✅ Configured for Replit environment
- ✅ Changed dev server port from 3000 to 5000
- ✅ Removed GEMINI_API_KEY references (security - not needed for this app)
- ✅ Fixed importmap conflicts by removing external CDN imports
- ✅ Added proper module loading for Vite
- ✅ Configured deployment as static site (builds to `dist/`)

## Development

### Local Development
```bash
npm install
npm run dev
```
The app will run on http://localhost:5000

### Build for Production
```bash
npm run build
```
Output will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Deployment
This project is configured for static deployment:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Deployment Type**: Static

## Quiz Flow Steps
1. Introduction page with call-to-action
2. Weight loss goal selection
3. Body classification
4. Target area for fat reduction
5. Name input
6. Appearance satisfaction
7. Weight loss obstacles
8. Impact on daily life
9. Desired benefits
10-11. Customer testimonials (Gomita, Fernanda)
12. Height slider
13. Goal weight slider
14. Current weight slider
15. Water intake selection
16. Loading/analysis screen
17. Results page with BMI visualization
18. Sales pitch page

## Notes
- This is a marketing/advertorial application (not a genuine health assessment tool)
- Uses placeholder images from picsum.photos
- Tailwind CSS is loaded via CDN (consider installing as dependency for production)
- No backend required - purely client-side application
- No API keys or external services needed
