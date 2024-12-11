> npx create-next-app@latest

> v0: Create a flight search web interface...

> Solve issues

MANUAL: Downgrade to React 18, cause React Day Picker 
MANUAL: Disable eslint rules

> Implement search state and API integration:
- Created search types and Zod schemas in src/types/search.ts
- Added API client with React Query in src/lib/api.ts
- Updated FlightSearch component to use types and API integration
- Updated SearchResults component to handle search results
- Updated AIPrompt component to handle messages
- Added React Query and Zod dependencies
- Added React Query provider to app layout

> Fix React Query provider in Next.js 13+:
- Added "use client" directive to layout component
- Moved metadata to a separate file
- Properly initialized QueryClient with useState

> Fix metadata configuration:
- Removed metadata from layout.tsx
- Created separate metadata.ts file
- Exported metadata from page.tsx

> Fix metadata and providers setup:
- Created separate providers.tsx for client-side providers
- Moved React Query provider to providers component
- Kept layout.tsx as a server component with metadata
- Removed metadata from page.tsx

> npx shadcn@latest add --all