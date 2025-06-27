# Financial Application Portal

## Overview

This is a full-stack financial application portal that allows clients to submit lending applications through a multi-step form interface. The system uses a modern tech stack with React + TypeScript frontend, Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Client**: React 18 + Vite + TypeScript frontend application
- **Server**: Express.js backend with session-based authentication
- **Shared**: Common database schema and types
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

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

### Backend Architecture
- **RESTful API**: Express.js with typed route handlers
- **Session management**: PostgreSQL-backed sessions with connect-pg-simple
- **File handling**: Multer for multipart form uploads with validation
- **Error handling**: Centralized error middleware with proper HTTP status codes
- **Authentication middleware**: Replit OAuth integration with user context

### Database Schema
- **Users table**: Required for Replit Auth integration
- **Applications table**: Core application data with JSON fields for flexible form data
- **Documents table**: File metadata and upload tracking
- **Lender products table**: Product recommendations and configurations
- **Sessions table**: Session storage (required for Replit Auth)

## Data Flow

1. **Authentication**: Users authenticate via Replit OAuth, creating/updating user records
2. **Application Creation**: Multi-step form process with auto-save functionality
3. **Document Upload**: File uploads with metadata stored in database
4. **Form Submission**: Complete application data saved and status updated
5. **Offline Sync**: Local data synchronized when connection restored

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
- June 27, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```