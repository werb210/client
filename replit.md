# Financial Application Portal

## Overview

This project is a comprehensive Progressive Web App (PWA) for Boreal Financial's client portal. It facilitates end-users in submitting lending applications through a secure, multi-step process with full offline support, camera document upload, and real-time notifications. Operating as a frontend-only PWA, it securely communicates with a separate staff backend via API calls, delivering a superior mobile-first experience across devices and network conditions. The project aims to provide advanced offline capabilities, push notifications, and native app-like functionality, enhancing the user experience for financial applications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a client-staff separation architecture. The client is a frontend-only React 18 application built with Vite and TypeScript. All data operations are routed through the staff backend API, with no local database on the client side, ensuring a clear division of concerns and data integrity.

**Technology Stack:**
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend (Staff):** Express.js, TypeScript, Drizzle ORM
- **Database (Staff):** PostgreSQL (Neon serverless)
- **Authentication:** Replit OAuth with session management (managed by staff backend)
- **State Management:** TanStack Query for server state, React Context for application state
- **UI Components:** Radix UI primitives with shadcn/ui design system
- **Form Management:** React Hook Form with Zod schemas for validation
- **File Uploads:** Multer middleware (on staff backend)

**Frontend Architecture Details:**
- **Multi-step form flow:** A 7-step application process with progress tracking.
- **Progressive Web App (PWA):** Full PWA implementation with installable app, offline support, push notifications, and background sync.
- **Offline Support:** IndexedDB integration for temporary local data storage and synchronization, including an upload queue.
- **Responsive Design:** Mobile-first approach using Tailwind CSS.
- **File Uploads:** Drag-and-drop document upload with progress tracking.

**System Design Choices:**
- **Client-Staff Separation:** Ensures a clear division of concerns, with the client handling UI/UX and the staff backend managing core business logic and data.
- **API-Centric Communication:** All interactions between client and staff backend occur via a centralized API layer, ensuring consistency and security.
- **Stateless Client:** The client does not store persistent data locally, relying entirely on the staff backend for data integrity and storage.
- **Unified Field Access:** A system (`lib/fieldAccess.ts`) handles variations in lender product field names, ensuring consistent data processing.
- **Document Mapping System:** Centralized mapping (`lib/documentMapping.ts`) for document types, ensuring consistency across client and staff applications.
- **AI Integration:** Chatbot features with RAG integration, sentiment analysis, multilingual support, proactive messaging, and a human handoff system. Chatbot context is enhanced by live lender product data.
- **Comprehensive Validation:** Preflight tests, smart field validation, and runtime alerts are implemented across the application lifecycle, including strict document validation for application progression.
- **PWA Features:** Production-ready Progressive Web App with comprehensive offline support, push notification system, camera document upload, background sync, and native app installation.
- **Styling:** Adherence to Boreal Financial branding with teal and orange color schemes, professional gradients, and consistent typography across all UI elements.
- **E-Signature Interface:** A mock e-signature interface with parameter validation and error handling, integrated with a document packs demo.
- **Reliability Testing Framework:** An HTTP-based reliability testing framework validates all application routes without browser dependencies, ensuring application stability.

## External Dependencies

- **Neon Database:** Serverless PostgreSQL hosting.
- **Replit OAuth:** Authentication service.
- **Drizzle ORM:** Type-safe database operations.
- **TanStack Query:** Server state management and caching.
- **Radix UI:** Accessible UI component primitives.
- **Tailwind CSS:** Utility-first CSS framework.
- **Lucide React:** Icon library.
- **Vite:** Frontend build tool and development server.
- **TypeScript:** Programming language for type safety.
- **Express.js:** Web application framework for the staff backend.
- **Multer:** Node.js middleware for handling `multipart/form-data`.
- **IndexedDB:** Client-side storage for offline support.
- **Socket.IO:** For real-time communication with the chatbot and staff.
- **OpenAI:** For chatbot intelligence (GPT-4o model).
- **html2canvas:** For screenshot capture in issue reporting.
- **react-datepicker:** Date picker component for form fields.
- **idb-keyval:** For reliable IndexedDB persistence.
- **react-cookie-consent:** For GDPR/CCPA cookie consent management.
- **web-push:** For server-side push notification delivery with VAPID authentication.