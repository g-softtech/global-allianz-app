# Global Allianz Insurance Brokers - AI Agent Guidelines

## Purpose
This document defines how the GitHub Copilot AI agent should approach development tasks for the Global Allianz Insurance Brokers (GAIB) web platform.

---

## Project Overview
- **Platform**: Modern digital insurance brokerage system for Nigerian market
- **Type**: Production-ready full-stack web application (not MVP)
- **Users**: Customers, Admins, Agents/Brokers
- **Main Modules**: User module (policy purchase, claims, payments), Admin module (management & analytics)

---

## Recommended Workflow Approach

### 1. **Always Reference the Requirements**
- Consult `PROJECT_OVERVIEW.md` for specifications
- Verify features align with documented requirements before implementation
- Check brand colors and design system for consistency

### 2. **Development Order**
Follow the phased approach outlined in the initial recommendations:
1. Foundation & Infrastructure (project setup, design system)
2. Authentication & User Management (JWT, roles, KYC)
3. Core Features (policies, claims, payments)
4. Admin Features (dashboards, approvals)
5. Advanced Features (AI, fraud detection, chatbot)

### 3. **Code Organization**
```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (Login, Dashboard, etc.)
├── layouts/          # Layout wrappers (navbar, sidebar)
├── services/         # API calls and external services
├── store/            # State management (Zustand/Redux)
├── styles/           # Tailwind + global styles
├── hooks/            # Custom React hooks
├── utils/            # Helper functions
└── types/            # TypeScript interfaces
```

---

## Brand & Design System (Critical)

### Color Palette
- **Primary Blue**: #1E3A8A (Trust, professionalism)
- **Royal Blue**: #2563EB (Action buttons, highlights)
- **Light Blue**: #E0F2FE (Backgrounds)
- **White**: #FFFFFF (Clarity)
- **Success Green**: #16A34A (Approved claims)
- **Error Red**: #DC2626 (Failures, errors)

### Implementation Rules
1. Create Tailwind CSS config that uses these exact colors
2. Build reusable component library using these colors
3. Maintain consistent spacing and typography
4. Always apply dark overlays to hero images for text readability

---

## Technology Stack

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **State Management**: Zustand or Redux
- **Authentication**: JWT tokens (stored securely)

### Backend (TBD - define during backend phase)
- Database collections: Users, Policies, Claims, Payments, Agents, Notifications
- API authentication: JWT with role-based access control (RBAC)

### Deployment
- **Frontend**: Vercel
- **Backend**: Render or AWS
- **Security**: HTTPS, SSL enabled

---

## Key Features to Implement

### User Module
- [x] Registration with OTP verification
- [x] JWT-based authentication
- [x] Dashboard (policies, claims, alerts)
- [x] Multi-step policy purchase flow
- [x] Claims submission & tracking
- [x] Payment integration (Paystack/Flutterwave)
- [x] Profile & KYC management

### Admin Module
- [x] Dashboard with analytics
- [x] User management
- [x] Policy creation & management
- [x] Claims approval system
- [x] Agent management & commission tracking
- [x] Reports & exports

### Advanced Features
- [ ] AI-powered policy recommendations
- [ ] Fraud detection system
- [ ] Chatbot support
- [ ] Referral system
- [ ] Performance optimization (lazy loading, image compression)

---

## Security Requirements

All implementations must include:
- JWT authentication with refresh tokens
- Role-based access control (RBAC) for users, admins, agents
- Password hashing (bcrypt)
- HTTPS/SSL encryption
- NDPR compliance (Nigerian Data Privacy Regulation)
- NO card storage (delegate to payment providers)
- Input validation and sanitization
- CSRF protection

---

## Performance Standards

- Lazy load components and code splitting
- Compress images (use WebP format)
- Implement API response caching
- Optimize bundle size with Vite
- Mobile-first responsive design
- Fast form validation with instant feedback

---

## UX Principles

1. **Simplicity** — Minimal, intuitive interface
2. **Trust** — Clear security indicators, professional branding
3. **Speed** — Fast loading, quick transactions
4. **Mobile-first** — Responsive design for all devices
5. **Progress indication** — Multi-step forms show progress
6. **Validation feedback** — Instant, clear validation messages

---

## When to Ask for Clarification

Contact the project lead when:
- Specifications conflict or are ambiguous
- New features are requested outside the documented scope
- Backend API structure needs definition
- Database schema design needs finalization
- Deployment infrastructure needs configuration

---

## Development Checklist Pattern

For each major feature, verify:
- [ ] Meets requirements in PROJECT_OVERVIEW.md
- [ ] Follows brand color and design system
- [ ] Includes proper error handling
- [ ] Implements security measures (auth, validation, etc.)
- [ ] Responsive on mobile and desktop
- [ ] Has proper TypeScript types/interfaces
- [ ] Includes loading and error states
- [ ] API calls are properly handled
- [ ] User feedback is clear (success, error messages)

---

## File References for Context

- **Requirements**: `PROJECT_OVERVIEW.md` — Full specification document
- **This guide**: `AGENT.md` — AI agent development approach
- **Architecture**: *To be created* — Detailed technical architecture

---

## Last Updated
April 8, 2026

*This document should be updated as the project evolves and new patterns emerge.*
