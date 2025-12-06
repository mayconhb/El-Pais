# Protocolo Gelatina Reductora - Advertorial

## Overview
This is a static HTML/CSS/JS advertorial/quiz flow application for a weight loss product called "Protocolo Gelatina Reductora". The app features an interactive quiz that collects user information and presents a sales pitch for the product.

## Technology Stack
- **Frontend**: Static HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Styling**: Custom CSS with performance optimizations
- **Fonts**: Merriweather (serif), Inter (sans-serif) via Google Fonts
- **Video**: Wistia player integration
- **Analytics**: Custom tracking system with Supabase database
- **Hosting**: Vercel with serverless API functions

## Project Structure
```
.
├── index.html                 # Main HTML page with quiz container
├── assets/
│   ├── style.css              # All CSS styles (optimized)
│   ├── script.js              # Quiz logic and smart preloading
│   ├── analytics.js           # Client-side analytics tracking
│   └── images/                # All images (24 files)
├── api/
│   ├── track-event.js         # Vercel serverless API for tracking events
│   └── analytics.js           # Vercel serverless API for dashboard data
├── dashboard/
│   └── index.html             # Analytics dashboard page
├── supabase/
│   └── schema.sql             # Database schema for Supabase
├── package.json               # Dependencies (@supabase/supabase-js)
├── vercel.json                # Vercel deployment configuration
└── replit.md                  # Project documentation
```

## Features
- Interactive multi-step quiz flow (19 steps)
- Testimonials from verified customers
- Dynamic BMI visualization
- Loading animations with progress bar
- Responsive mobile-first design
- Spanish language interface
- **Ultra-fast page loading** with smart preloading system
- **Analytics Dashboard** with funnel visualization, answer distributions, and conversion metrics

## Performance Optimizations (December 02, 2025)

### HTML Head Optimizations
- **DNS Prefetch**: Pre-resolves DNS for fonts, analytics, and Wistia
- **Preconnect**: Early connection to Google Fonts and analytics
- **Preload**: Critical CSS and hero images loaded with high priority
- **All quiz images preloaded**: Prevents visible loading during navigation

### Smart JavaScript Preloading System
- **Step-based image preloading**: Preloads images for next 3 steps
- **Aggressive background preload**: All images loaded after 2 seconds
- **Wistia video preloading**: SDK loaded at step 14 (ready by step 18)
- **Checkout preconnect**: Hotmart connections established at step 16+

### CSS Performance
- **aspect-ratio**: Prevents layout shift on image load
- **background-color placeholders**: Shows placeholder color while images load
- **will-change hints**: Optimizes animations and transitions
- **contain property**: Improves rendering performance

### Checkout Speed
- Dynamic preconnect to Hotmart domains (pay.hotmart.com, sec.hotmart.com, etc.)
- Page prefetch for checkout URL
- UTM/xcod parameter injection on link click

## Analytics Dashboard Setup

### Required Environment Variables (Vercel)
Set these in your Vercel project settings:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- `DASHBOARD_PASSWORD` - Password to access the analytics dashboard

### Database Setup (Supabase)
1. Go to your Supabase project SQL Editor
2. Copy and run the contents of `supabase/schema.sql`
3. This creates the tables: sessions, step_events, answers, checkouts
4. Also creates RPC functions for analytics aggregation

### Accessing the Dashboard
1. Navigate to `/dashboard` on your deployed site
2. Enter your DASHBOARD_PASSWORD
3. View funnel analytics, answer distributions, and conversion metrics

## Recent Changes (December 06, 2025)
- **Dashboard Metrics Adjustments**:
  - Conversion rate now calculated based on sessions (checkouts / sessions)
  - Quiz completion rate now calculated based on sessions (step 18 views / sessions)
  - Removed slider answers from answer distributions (peso atual, altura, peso objetivo)
  - Updated dashboard labels to indicate "Baseado em sessoes"
- **Improved Date Filters**: Updated dashboard with better date filter options
  - New filter options: Hoje (Today), Ontem (Yesterday), 7 dias, 30 dias, Personalizado
  - Custom date picker with calendar inputs for start and end dates
  - API updated to support custom date ranges with start_date and end_date parameters
  - Fixed server.js to correctly serve subdirectory index.html files (dashboard route)
- **Analytics Dashboard System**: Complete analytics tracking and dashboard
  - Client-side tracking (assets/analytics.js) for sessions, steps, answers, and checkouts
  - Vercel serverless API endpoints (/api/track-event, /api/analytics)
  - Supabase database schema with sessions, step_events, answers, checkouts tables
  - Dashboard page (/dashboard) with:
    - Funnel visualization showing views and abandonment per step
    - Abandonment rate table with detailed metrics for all 19 steps
    - Answer distribution charts for each quiz question
    - Conversion rate metrics (sessions vs checkouts)
    - Time range filters (Today, Yesterday, 7d, 30d, Custom date range)
    - Password-protected access
  - Tracking features:
    - Session tracking with UTM parameters, device type, referrer
    - Step view and completion tracking
    - Answer selection tracking by question
    - Checkout click tracking
    - Abandonment detection on page unload

## Previous Changes (December 02, 2025)
- ✅ **Performance Optimization**: Implemented ultra-fast loading system
  - Smart image preloading for upcoming quiz steps
  - Wistia video SDK preloading starting at step 14
  - Dynamic Hotmart checkout preconnect at step 16+
  - CSS aspect-ratio and background placeholders
  - All images preloaded in background after 2 seconds
- ✅ **Project Cleanup**: Removed all unnecessary files
  - Removed React components, TypeScript files, and Node.js server
  - Removed unused images (kept only 24 used images)
  - Pure static site: just HTML, CSS, and JavaScript
- ✅ **Added tracking script**: UTM/xcod parameter injection for checkout links

## Previous Changes (December 01, 2025)
- ✅ **Reverted Tracking Parameter Implementation**: Removed custom trackingParams.ts to allow GTM to handle parameter propagation natively
  - GTM is responsible for passing xcod, utm_*, sck parameters to checkout URL
  - CTA uses static Hotmart URL; GTM rewrites it with tracking parameters on click
- ✅ **GitHub Integration**: Project successfully pushed to GitHub repository

## Previous Changes (November 30, 2025)
- ✅ Added complete analytics tracking system
- ✅ Created professional dashboard with charts
- ✅ Implemented Vercel serverless API for events
- ✅ Added password protection for dashboard
- ✅ Tracking: quiz start, step views, answers, completions, abandonments
- ✅ Time tracking per step
- ✅ Funnel visualization
- ✅ Answer distribution charts
- ✅ Date range filters (24h, 7d, 30d, 90d, all time)
- ✅ **Supabase Integration**: Analytics data now persists in Supabase PostgreSQL database
- ✅ Dashboard shows data source indicator (Local, Supabase, or Mixed)
- ✅ **VTurb CTA Tracking for Meta Ads**: Fixed InitiateCheckout event tracking
- ✅ **Wistia Video Player**: Migrated from VTurb to Wistia for video hosting

## Wistia/Meta Ads Integration

### How It Works
The application tracks actual video playback time (ignoring pauses) and shows a custom CTA button after 8 minutes and 10 seconds of watched content. When clicked, it sends an `initiate_checkout` event to the dataLayer for Google Tag Manager and Meta Ads.

### Video Player
- **Platform**: Wistia
- **Media ID**: 8xc87ip699
- **Scripts**: `fast.wistia.com/player.js` and `fast.wistia.com/embed/8xc87ip699.js`

### Implementation Details (QuizFlow.tsx)
1. **Wistia API**: Uses Wistia's JavaScript API via `window._wq` queue
2. **Play/Pause Detection**: Uses Wistia's `play` and `pause` events
3. **Time Tracking**: Uses Wistia's `secondchange` event to track watched time
4. **Time Accumulation**: Calculates delta between time updates, only when video is playing
5. **Threshold Trigger**: Shows CTA button after user watches 8 minutes and 10 seconds of actual content
6. **CTA Link**: Yellow "ACCEDER A MI PROTOCOLO PERSONALIZADO AHORA" link appears below the video
7. **GTM Link Click Detection**: Uses `<a>` tag (not `<button>`) so GTM can detect link clicks to pay.hotmart.com
8. **InitiateCheckout Event**: When link is clicked, pushes event to dataLayer for additional tracking
9. **Duplicate Prevention**: Uses `ctaTrackedRef` to ensure the event only fires once per session

### IMPORTANT: GTM Link Click Detection
The GTM script is configured to detect clicks on links (`<a>` tags) that point to `pay.hotmart.com`. 
The CTA must use an `<a>` element (not `<button>`) with `href="https://pay.hotmart.com/..."` for GTM to:
- Automatically detect the link click event (`gtm.linkClick`)
- Apply UTM parameters and tracking cookies to the checkout URL
- Fire the `begin_checkout` and `InitiateCheckout` tags

### DataLayer Event Format
```javascript
{
  'event': 'initiate_checkout',
  'event_category': 'ecommerce',
  'event_label': 'cta_link_click',
  'cta_source': 'custom_cta_link'
}
```

### GTM Configuration Required
The GTM container automatically detects link clicks to `pay.hotmart.com` and fires:
- Google Analytics `begin_checkout` event
- Meta Pixel `InitiateCheckout` standard event

### Debug Logs
The implementation includes console logs prefixed with `[Video Tracker]` and `[CTA Link]` for debugging:
- `[Video Tracker] Starting Wistia playback tracking - CTA appears after X seconds watched`
- `[Video Tracker] Wistia player ready`
- `[Video Tracker] PLAY - now tracking time. Accumulated so far: Xs`
- `[Video Tracker] PAUSE - stopped tracking. Total watched: Xs`
- `[Video Tracker] ENDED - Total watched: Xs`
- `[Video Tracker] THRESHOLD REACHED! Watched Xs - SHOWING CTA BUTTON`
- `[CTA Link] Link clicked - pushing InitiateCheckout to dataLayer`

### Configuration
- **CTA_THRESHOLD_SECONDS**: Currently set to 490 seconds (8 minutes and 10 seconds)

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

## Deployment (GitHub + Vercel)

### Configuration
1. Connect your GitHub repository to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. The `vercel.json` file is already configured for:
   - API routes (`/api/*`)
   - SPA routing

### Environment Variables (Optional)
- `DASHBOARD_PASSWORD`: Custom password for dashboard (default: quiz2024)

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
18. Sales/Video page

## Notes
- Analytics data persists in localStorage for development
- In production (Vercel), data is also sent to serverless API
- Dashboard requires password authentication
- Tailwind CSS is loaded via CDN (consider installing as dependency for production optimization)
