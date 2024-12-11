## 2024-03-19 15:00:00
When the frontend queries the backend, it sends the full status of the current search, including the search inputs, the chat history, and the search results.

Example API call:
```bash
curl -X POST https://fast-api-flights.replit.app/search-flights \
-H "Content-Type: application/json" \
-d '{
  "sessionId": "test123",
  "formData": {
    "departurePlace": "PRG",
    "returnPlace": "LON",
    "departureDate": "2024-03-01",
    "returnDate": "2024-03-01"
  },
  "messages": [
    {
      "role": "user",
      "content": "Maybe I want to fly to Viena instead?"
    }
  ],
  "trigger": "chat"
}'
```

## 2024-03-19 15:01:00
Prefil the search form with example valid values

## 2024-03-19 15:02:00
Search api should also respond with list of suggested textual filters based on the returned flights, e.g. "early departures", "sunday evening returns", "under 100$", "under 500$". It should be contextual.
Render these under the results so user can click on them.