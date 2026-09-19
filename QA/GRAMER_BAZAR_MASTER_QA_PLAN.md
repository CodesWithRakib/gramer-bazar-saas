# Gramer Bazar Master QA Plan

## Objective
To execute a fully autonomous, end-to-end quality assurance pass across all roles, features, and environments of Gramer Bazar, ensuring production readiness.

## Scope
- **Roles:** Customer, Seller, Rider, Admin, Super Admin
- **Environments:** Desktop, Mobile
- **Locales:** English (`/en`), Bangla (`/bn`)
- **Key Modules:** Authentication, Authorization, Product Discovery, Cart, Checkout, Order Processing, Delivery Management, Product Requests, Reporting, Roles & Permissions.

## Methodology
1. **Discover:** Analyze existing implementation and document expected behavior.
2. **Test:** Execute journeys mapping to real user interactions.
3. **Capture Evidence:** Record screenshots, console errors, and API failures.
4. **Report Bug:** Classify bugs (P0 - P3) in the Bug Report document.
5. **Fix:** Implement root-cause fixes directly in the codebase.
6. **Retest:** Ensure the fix resolves the issue without regression.
7. **Document:** Finalize readiness status and user documentation.

## Core Journeys to Test
1. Customer E2E Flow (Auth -> Browse -> Cart -> Checkout -> Track)
2. Seller E2E Flow (Auth -> Products -> Inventory -> Process Orders)
3. Rider E2E Flow (Auth -> Assigned -> Pickup -> Deliver)
4. Admin E2E Flow (Auth -> Dashboard -> Assign Riders -> Manage Users/Products)
5. Product Request Flow (Customer Request -> Admin Source -> Product Create)

## Critical Constraints
- Do not invent features outside the current design scope.
- Maintain locale state consistently across navigation.
- Ensure strict Role-Based Access Control (RBAC).
