# Ya Flight Search

## Project Overview
Modern flight search interface with AI-powered natural language processing.

## Core Features
- Flight search with form validation
- Natural language search via OpenAI
- Interactive flight results display
- Smart filter suggestions
- Real-time form updates

## Tech Stack
- Next.js 15.1.0
- TypeScript
- React Query
- Zod
- Tailwind CSS
- shadcn/ui components
- OpenAI

## Development Guidelines
- Use React Query for API state management
- Validate all data with Zod schemas
- Follow shadcn/ui component patterns
- Keep AI prompts focused and efficient
- Maintain type safety throughout the codebase

## Common Tasks
- Adding new form fields: Update SearchFormDataSchema in types/search.ts
- Adding API features: Extend SearchState and SearchResponse types
- UI changes: Follow shadcn/ui patterns and maintain responsive design
- New filters: Add to SuggestedFilterSchema and update API response

## Project Structure
- /src/app: Next.js app router pages
- /src/components: React components
- /src/lib: Utilities and API client
- /src/types: TypeScript types and Zod schemas

## Links
- shadcn/ui docs: https://ui.shadcn.com/
- Next.js docs: https://nextjs.org/docs
