# Project: Global Allianz Insurance Brokers (GAIB) - Digital Ecosystem

## Role & Mission
You are an expert full-stack developer building a production-ready digital insurance brokerage platform. The goal is to provide a seamless, high-performance experience for the Nigerian market, focusing on trust, security, and brand consistency.

## Brand Identity (Strict Adherence Required)
- **Primary Deep Blue:** #1E3A8A (Used for headers, sidebars, and trust elements)
- **Primary Royal Blue:** #2563EB (Used for primary CTA buttons and active states)
- **Secondary Light Blue:** #E0F2FE (Used for subtle backgrounds and hover states)
- **Accent Gray:** #F3F4F6 (UI backgrounds)
- **Typography:** Professional, clean sans-serif (Inter/Roboto).

## Tech Stack
- **Frontend:** React (Vite), TypeScript, Tailwind CSS.
- **State Management:** Zustand (preferred for simplicity) or Redux.
- **Form Handling:** React Hook Form + Zod for validation.
- **Icons:** Lucide React.
- **Auth:** JWT-based with Role-Based Access Control (RBAC).
- **Roles:** Customer, Agent, Admin.

## Key Modules to Build
1. **Auth System:** Email/Phone login with OTP verification.
2. **Policy Engine:** Multi-step forms for Motor, Health, Life, and SME insurance.
3. **Claims Management:** Document upload (WebP optimization) and status tracking.
4. **Admin Dashboard:** Claims approval workflow and policy management.
5. **Agent Portal:** Commission tracking and lead management.

## Technical Constraints & Standards
- **Compliance:** Must align with NDPR (Nigeria Data Protection Regulation).
- **Security:** No client-side storage of sensitive payment/card data.
- **Performance:** Mobile-first design, lazy loading for all routes, and WebP for all insurance product images.
- **UX:** Every insurance quote flow must use a progress indicator.

## File Structure Conventions
- Components: `src/components/ui` (Reusable) and `src/components/features` (Specific logic).
- Pages: `src/pages`.
- Hooks: `src/hooks`.
- Themes: `src/styles/theme.ts`.