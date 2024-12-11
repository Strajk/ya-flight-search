> Init Vite React TS project

> Create a flight search web interface that combines deterministic and AI elements.
> Guide customers through the flight search process and provide helpful information, enabling them to find the perfect flight as quickly as possible.
> 
> The interface consists of three main components:  
> * **Search Inputs**: Where users enter their travel details.  
> * **Search Results**: Displays the flights that match the input criteria.  
> * **Prompt Section**: Users can interact with an AI to refine their search.
> 
> All elements are always accessible without scrolling but may expand or shrink.  
> 
> **Details of Each Component:**  
> * Search Inputs:
>   * Drop-down for one-way, roundtrips, or multi-city.  
>   * Selections for the number of passengers and luggage.
>   * Input fields for departure and destination locations, allowing for both standard UI selection (e.g., dropdown menus) and free text entry (e.g., “NYC,” “Paris,” “Middle East,” “Somewhere warm”).  
>   * Date selectors for departure and return dates, with a calendar UI and supporting free text input for dates (e.g., "next weekend", "Thursday or Friday next week").  
> * Search Results
>   * No strict requirements.
> * Prompt Section:  
>   * Integrated to the bottom of the layout as significant fullwidth always visible part. Not separate popup. No collapsable.
>   * Starts with the placeholder: "Find me flights, please!" 
>   * Provides conversational updates and suggestions based on user input, such as asking for preferences between price, duration, departure times, and other parameters when results are too broad.  
>   * Expands as an overlay over flight results when active and retracts when unused so as not to take too much space from the results.

## Implementation Progress

- Created base components for flight search interface:
  - `luggage-input.tsx`: Component for selecting checked and cabin bags
  - `search-results.tsx`: Component for displaying flight search results with loading, error, and empty states
  - `prompt-section.tsx`: AI assistant interface for refining flight search
  - Added utility functions in `utils.ts`
  - Installed required dependencies and shadcn UI components
  - Implemented responsive design with mobile-first approach
  - Added proper TypeScript types and validation with Zod
  - Used modern React patterns with hooks and functional components

