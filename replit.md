# Financial Application Portal

## Overview

This is a client-side financial application portal for Boreal Financial that allows end users to submit lending applications through a multi-step form interface. The system is architected as a frontend-only application that communicates with a separate staff backend via secure API calls.

## System Architecture

The application follows a client-staff separation architecture:

- **Client**: Frontend-only React 18 + Vite + TypeScript application (this repository)
- **Staff Backend**: Separate application managing shared database and business logic
- **API Communication**: Centralized via `/lib/api.ts` to staff backend at `https://staff.borealfinance.app/api`
- **No Local Database**: All data operations route through staff backend API

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: Replit OAuth with session management
- **State Management**: TanStack Query for server state, React Context for application state
- **File Uploads**: Multer middleware
- **UI Components**: Radix UI primitives with shadcn/ui design system

## Key Components

### Frontend Architecture
- **Multi-step form flow**: 7-step application process with progress tracking
- **Offline support**: IndexedDB integration for local data storage and synchronization
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Component library**: shadcn/ui components built on Radix UI primitives
- **Form validation**: React Hook Form with Zod schemas
- **File uploads**: Drag-and-drop document upload with progress tracking

### Client Architecture
- **Frontend-only**: No backend database or business logic
- **API Communication**: Centralized through `/lib/api.ts` for all staff backend calls
- **Authentication**: Session-based OAuth routing through staff backend
- **File handling**: Direct upload to staff backend with progress tracking
- **Error handling**: API error management with 401 redirect handling
- **Offline support**: IndexedDB for temporary form data and upload queue

## Data Flow

1. **Authentication**: Users authenticate via staff backend OAuth integration
2. **Application Creation**: Multi-step form process with API calls to staff backend
3. **Document Upload**: Direct file uploads to staff backend with progress tracking
4. **Form Submission**: Complete application data submitted via API to staff backend
5. **Offline Sync**: Local IndexedDB data synchronized with staff backend when online

### State Management
- **Server state**: TanStack Query for API data caching and synchronization
- **Form state**: React Hook Form for individual step validation
- **Application state**: React Context for cross-step data persistence
- **Offline state**: IndexedDB for local storage and sync management

## External Dependencies

### Core Dependencies
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit OAuth**: Authentication service integration
- **Drizzle ORM**: Type-safe database operations
- **TanStack Query**: Server state management and caching

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### Development Dependencies
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon serverless connection

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: ESBuild bundle for Node.js execution
- **Deployment**: Single process serving API and static files

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OAuth issuer endpoint

## Changelog

```
Changelog:
- June 27, 2025: Initial setup
- June 28, 2025: Completed client-staff architecture migration
  - Removed all local database logic (Drizzle, schema, storage)
  - Created centralized API layer (/lib/api.ts) for staff backend communication
  - Updated routing to staff backend at https://staff.borealfinance.app/api
  - Simplified authentication flow for frontend-only operation
  - Added architectural documentation in /docs/ARCHITECTURE.md
  - Implemented real file uploads using FormData to staff backend
  - Added SignNow redirect flow integration (no iframe)
  - Created comprehensive testing checklist (/testing route)
  - Configured offline storage to sync with staff backend when online
  - Added proper error handling for 401 redirects to login
  - Completed multi-step form implementation:
    * Step 1: Financial Profile with business basics
    * Step 2: AI-powered recommendations with match scores
    * Step 3: Business details with incorporation date and address validation
    * Step 4: Financial information with currency formatting and net worth calculation
    * Step 5: Document upload with drag-and-drop, category-based requirements, and progress tracking
    * Step 6: SignNow e-signature integration with redirect flow and status polling
    * Step 7: Final submission page with complete application review and POST /api/applications/submit
  - Added date picker components and Zod validation for business registration data
  - Implemented comprehensive document upload system with file validation and real-time status
  - Created SignNow redirect integration calling POST /api/sign/:applicationId for secure e-signature workflow
  - Built final submission workflow with application summary, completion validation, and success redirect
  - Implemented comprehensive testing suite with 33 tests covering all workflow aspects
  - Added production configuration with retry logic, timeout handling, and error recovery
  - Created ApplicationStatusMonitor for real-time application status tracking
  - Built RetryFailedUploads component for handling upload failures gracefully
  - Optimized mobile responsiveness across all form steps and components
  - Configured production API endpoints with environment variable support
  - Added comprehensive error handling and retry mechanisms for network requests
  - Applied complete Boreal Financial branding with teal (#7FB3D3) and orange (#E6B75C) color scheme
  - Updated all company references from "Canadian Business Financing" to "Boreal Financial"
  - Implemented brand-consistent typography, component styling, and color variables
  - Created hero section with gradient background matching brand guidelines
  - Applied responsive branding across Landing page, Dashboard, and all form components
  - Updated production configuration to connect to deployed staff backend at https://staffportal.replit.app/api
  - Enhanced error handling for network connectivity and staff backend unavailability
  - Configured graceful degradation for offline/unreachable backend scenarios
  - Created comprehensive CORS diagnostic tools at /cors-test and /simple-test for troubleshooting
  - Generated complete technical report (TECHNICAL_REPORT.md) documenting CORS configuration requirements
  - Application ready for deployment pending staff backend CORS allowlist configuration
  - All 7 application steps completed with proper API integration and error handling
  - June 28, 2025: Completed SMS OTP authentication integration with staff backend
    * Fixed environment variables: VITE_API_BASE_URL=https://staffportal.replit.app/api
    * Updated SIGNNOW_REDIRECT_URL to https://clientportal.replit.app/step6-signature
    * Enhanced AuthAPI with proper credentials: 'include' and mode: 'cors'
    * Created comprehensive testing suite: /auth-flow-test, /backend-test, /cors-test
    * Fixed authentication guard to include all testing routes as public
    * Implemented complete registration → OTP verification → authentication flow
    * Added backend connectivity diagnostics for troubleshooting CORS issues
    * Registration flow properly redirects: /register → /verify-otp → /application
    * All API calls use cookie-based sessions with proper CORS configuration
    * Implemented unified apiFetch function using import.meta.env.VITE_API_BASE_URL
    * Created production-ready .env.production with correct API endpoints
    * Simplified authentication flow with direct API calls instead of AuthAPI wrapper
    * All registration and OTP verification uses apiFetch with proper error handling
    * Authentication guard supports both testing routes and protected application routes
    * FINAL: Implemented phone number formatting with libphonenumber-js and react-input-mask
    * Created dedicated staffApi client for proper CORS handling and JSON responses
    * Built comprehensive network diagnostic tool at /network-diagnostic
    * Generated complete technical report (CHATGPT_TECHNICAL_REPORT.md) for handoff
    * System ready for deployment pending staff backend CORS configuration
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Architecture Compliance

All development must comply with the architecture and security standards defined in /docs/ARCHITECTURE.md.