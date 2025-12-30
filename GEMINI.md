# GEMINI.md

This file provides comprehensive guidance to Gemini when working with code in this repository.

## Project Overview

**RentalEase CRM** is a comprehensive property management system designed for real estate agencies, property managers, and maintenance technicians. The system facilitates job management, property oversight, and streamlined communication between all stakeholders.

### Project Structure

This is a full-stack property management CRM system with three main applications:

- **RentalEase-CRM-Server**: Node.js/Express backend API server
- **RentalEase-CRM**: React/TypeScript frontend application
- **rentalease_website**: Next.js/TypeScript frontend application for the public website.

## Quick Start Commands

### Backend (RentalEase-CRM-Server)
```bash
cd RentalEase-CRM-Server
pnpm install       # Install dependencies
pnpm run dev           # Start development server with nodemon
pnpm start         # Start production server
```

### Frontend (RentalEase-CRM)
```bash
cd RentalEase-CRM
pnpm install       # Install dependencies
pnpm run dev           # Start Vite development server
pnpm run build         # Production build
pnpm run build:check   # Type check and build
pnpm run lint          # Run ESLint
pnpm run preview       # Preview production build
```

### Frontend (rentalease_website)
```bash
cd rentalease_website
pnpm install       # Install dependencies
pnpm run dev           # Start Next.js development server
pnpm run build         # Production build
pnpm run start         # Start production server
pnpm run lint          # Run ESLint
```

## Architecture Deep Dive

### Backend Architecture (`RentalEase-CRM-Server/`)

**Technology Stack:**
- **Framework**: Express.js with ES modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with role-based access control (RBAC)
- **File Storage**: Cloudinary integration for image/document uploads
- **Email Service**: Resend integration for notifications
- **Security**: Helmet, CORS, Morgan logging, Express rate limiting

**Core Models & Entities:**
- `Agency`: Real estate agencies managing properties
- `Property`: Individual properties under management
- `Job`: Maintenance/repair jobs assigned to properties
- `Technician`: Service providers who complete jobs
- `PropertyManager`: Managers overseeing specific properties
- `SuperUser`: System administrators with full access
- `Contact`: Communication records and contact information
- `Invoice`: Billing and payment records
- `Notification`: System notifications and alerts

**API Structure:**
- Base path: `/api/v1/`
- RESTful endpoints with proper HTTP methods
- Consistent response formats with error handling
- Route files organized by entity type
- Middleware for authentication, validation, and rate limiting

**User Roles & Permissions:**
1. **SuperUser**: Full system access, agency management
2. **Agency**: Property portfolio management, job oversight
3. **PropertyManager**: Property-specific management, job assignment
4. **Technician**: Job completion, status updates, payment processing

**File Structure:**
```
RentalEase-CRM-Server/
├── controllers/     # Business logic handlers
├── models/         # Mongoose schemas and models
├── routes/         # Express route definitions
├── middleware/     # Custom middleware functions
├── services/       # External service integrations
├── utils/          # Helper functions and utilities
├── config/         # Configuration files
└── uploads/        # Temporary file storage
```

### Frontend Architecture (`RentalEase-CRM/`)

**Technology Stack:**
- **Framework**: React 18 with TypeScript and Vite
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6 with role-based route protection
- **Styling**: SCSS modules with component-scoped styling
- **Build Tool**: Vite for fast development and optimized builds
- **Linting**: ESLint with TypeScript support

**Key Features:**
- Multi-role authentication with role-specific dashboards
- Property management interface with CRUD operations
- Job workflow management (creation, assignment, tracking, completion)
- Real-time notification system
- File upload capabilities with Cloudinary integration
- Payment processing interface for technicians
- Responsive design for mobile and desktop usage

**State Management Structure:**
- `userSlice`: Authentication state, user profile, role-based permissions
- `notificationSlice`: System notifications and alerts
- `jobSlice`: Job management state and operations
- API services with RTK Query for efficient data fetching

**Component Architecture:**
```
src/
├── components/     # Reusable UI components
├── pages/          # Route-specific page components
├── services/       # API service layer
├── store/          # Redux store configuration
├── config/         # Application configuration
├── utils/          # Helper functions
├── styles/         # Global SCSS styles
└── types/          # TypeScript type definitions
```

**Role-Based Routing:**
- Protected routes based on user roles
- Dynamic navigation menus per role
- Role-specific dashboard layouts
- Permission-based component rendering

### Frontend Architecture (`rentalease_website/`)

**Technology Stack:**
- **Framework**: Next.js 15 with TypeScript and Turbopack
- **Styling**: SCSS modules and Tailwind CSS
- **Linting**: ESLint with Next.js specific configuration

**File Structure:**
```
rentalease_website/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Reusable React components
│   ├── config/       # Site configuration
│   └── styles/       # Global and component-specific styles
├── public/           # Static assets
├── next.config.ts    # Next.js configuration
└── tsconfig.json     # TypeScript configuration
```

### Key Integration Points

**Frontend ↔ Backend Communication:**
- RESTful API calls using Axios
- JWT token-based authentication
- Centralized error handling and user feedback
- File upload handling with progress tracking

**Database Integration:**
- MongoDB collections for each entity type
- Mongoose schemas with validation
- Relationships between entities using ObjectIds
- Indexing for performance optimization

**External Service Integration:**
- **Cloudinary**: Image and document storage with automatic optimization
- **Resend**: Transactional email delivery for notifications
- **JWT**: Secure token-based authentication across sessions

## Development Guidelines

### Code Style & Standards

**TypeScript Usage:**
- Strict TypeScript configuration
- Interface definitions for all data structures
- Proper type annotations for function parameters and returns
- Use of generic types where appropriate

**React Best Practices:**
- Functional components with hooks
- Custom hooks for reusable logic
- Proper useEffect dependency arrays
- Performance optimization with useMemo and useCallback
- Error boundaries for graceful error handling

**SCSS Organization:**
- Component-scoped modules
- Consistent naming conventions (BEM methodology)
- Responsive design principles
- Design system variables for consistency

**Backend Patterns:**
- MVC architecture with clear separation of concerns
- Middleware pattern for cross-cutting concerns
- Service layer for business logic
- Repository pattern for data access

### Development Workflow

**Local Development Setup:**
1. Ensure MongoDB is running locally or configure cloud connection
2. Set up environment variables for both frontend and backend
3. Install dependencies using `pnpm` in all three directories
4. Start backend server first (`pnpm dev` in RentalEase-CRM-Server)
5. Start frontend development server for the CRM (`pnpm dev` in RentalEase-CRM)
6. Start frontend development server for the website (`pnpm dev` in rentalease_website)

**Environment Configuration:**
- Backend requires `.env` file with database, JWT, and service credentials
- Frontend uses Vite environment variables for API endpoints
- Different configurations for development, staging, and production

**Testing Strategy:**
- Unit tests for utility functions and services
- Integration tests for API endpoints
- Component testing for React components
- End-to-end testing for critical user workflows

### Security Considerations

**Authentication & Authorization:**
- JWT tokens with appropriate expiration times
- Role-based access control at route and component levels
- Input validation and sanitization
- SQL/NoSQL injection prevention

**Data Protection:**
- Sensitive data encryption
- Secure file upload handling
- Rate limiting on API endpoints
- HTTPS enforcement in production

### Performance Optimization

**Frontend Optimization:**
- Code splitting and lazy loading
- Bundle size optimization
- Image optimization and lazy loading
- Efficient re-rendering with React optimization techniques

**Backend Optimization:**
- Database query optimization with proper indexing
- Efficient pagination for large datasets
- Caching strategies for frequently accessed data
- Connection pooling for database connections

## Deployment & Production

**Frontend Deployment:**
- Build optimization with Vite
- Static asset deployment to CDN
- Environment-specific configuration
- Performance monitoring

**Backend Deployment:**
- Process management with PM2 or similar
- Database connection management
- Log aggregation and monitoring
- Health check endpoints

## Troubleshooting Common Issues

**Development Environment:**
- Port conflicts: Backend typically runs on port 4000, frontend on 5173
- CORS issues: Ensure proper CORS configuration in backend
- Database connection: Verify MongoDB connection string and network access

**Build Issues:**
- TypeScript compilation errors: Check type definitions and imports
- SCSS compilation: Verify SCSS syntax and import paths
- Dependency conflicts: Use `pnpm` consistently and check for version conflicts

## Contributing Guidelines

**Code Quality:**
- Follow ESLint rules and fix all warnings
- Write meaningful commit messages
- Test changes thoroughly before submitting
- Update documentation for new features

**Pull Request Process:**
- Create feature branches from main
- Include tests for new functionality
- Update relevant documentation
- Ensure CI/CD pipeline passes

This comprehensive guide should provide all necessary context for effective development and maintenance of the RentalEase CRM system.