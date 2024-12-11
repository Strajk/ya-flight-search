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

## 2024-03-19 15:03:00
Completely rewrite the search API logic.
It receives a search form state, chat messages, and what trigged the request, either submitting the form or sending a message.

It should combine all of that to prompt, and send it to the OpenAI API, requesting a structured response of flights.
Then it should call OpenAI API again twice:
-  with the flights and original prompt, and ask for suggested subsequent filters based on the flights (e.g. Under $xxx, only morning departures, returns on sunday)
- with original prompt, and ask to respond to what to update the original form ui, in the same structured format as it was sent from the client

- The whole response should include:
  - flights
  - suggested filters
  - form data to update the form ui
  - short message about what was done