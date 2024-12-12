import dedent from "dedent"

export const flightsPrompt = dedent`
  You are a flight search assistant. 
  Based on the search parameters and chat history, generate a api parameters to call the kiwi search api.
  Make sure all dates and times are in ISO format.
  Prices should be in USD.
  Generate realistic and varied flight options.
`

export const filtersPrompt = dedent`
  Based on the provided flight results and user search request, 
  suggest relevant refinement filters user could find useful.
  Examples:
  - Under $150
  - Non-stop flights only
  - Island destinations only
  - Under 5 hours flight duration
  Consider factors like:
  - Time of day (morning/evening flights)
  - Price ranges
  - Direct vs connecting flights
  - Airlines
  - Duration
  Each filter should be contextual and relevant to the actual flights provided.
  Filters should have following fields:
  - label: string, eg. "Non-stop flights only"
  - prompt: string, e.g "Search for non-stop flights only"
`

export const formUpdatesPrompt = dedent`
  Based on the user's search request and chat history, suggest new state for the search form.
  Consider what fields should be updated based on the user's intent.
  In no changes are needed, return null for all fields.
`
