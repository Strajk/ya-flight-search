import {z} from "zod";
import axios from 'axios';

const tequila_api_key = process.env.TEQUILA_API_KEY || "";
const max_results = 5;

export const kiwiSearchApiSchema = z.object({
  fly_from: z.string().describe("Origin city"),
  fly_to: z.string().describe("Destination city"),
  depart_after: z.string().optional().describe("Departure datetime from (YYYY-MM-DDThh:mm)"),
  depart_before: z.string().optional().describe("Departure datetime to (YYYY-MM-DDThh:mm)"),
  rt_depart_after: z.string().optional().describe("Return departure datetime from (YYYY-MM-DDThh:mm)"),
  rt_depart_before: z.string().optional().describe("Return departure datetime to (YYYY-MM-DDThh:mm)"),
  adults: z.number().int().describe("Number of adult passengers"),
  children: z.number().int().describe("Number of child passengers"),
  infants: z.number().int().describe("Number of infant passengers"),
  selected_cabins: z.enum(["M", "W", "C", "F"]).describe("Preferred cabin class"),
  curr: z.string().describe("Currency for prices in response"),
  locale: z.string().optional().describe("Language for city names and deeplinks"),
  max_stopovers: z.number().int().optional().describe("Maximum number of stopovers allowed"),
  vehicle_type: z.enum(["aircraft", "bus", "train"]).describe("Type of transport vehicle"),
  sort: z.enum(["price", "quality", "duration", "date", "popularity"]).describe("Sort results by specified criteria"),
});

export async function getFlights(apiRequest: z.infer<typeof kiwiSearchApiSchema>): Promise<object> {
  const flyFromCode = await getDestinationCode(apiRequest.fly_from);
  const flyToCode = await getDestinationCode(apiRequest.fly_to);

  const updatedApiRequest = {
    ...apiRequest,
    fly_from: flyFromCode,
    fly_to: flyToCode,
  };

  try {
    const response = await axios.get('https://api.tequila.kiwi.com/v2/search', {
      headers: {
        'accept': 'application/json',
        'apikey': tequila_api_key,
      },
      params: {
        ...updatedApiRequest,
        limit: max_results,
      },
    });

    return response.data

  } catch (error) {
    console.error('Error fetching flights:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('HTTP Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
}

export async function getDestinationCode(cityName: string): Promise<string> {
  const locationEndpoint = `https://api.tequila.kiwi.com/locations/query`;
  const headers = {
    'apikey': tequila_api_key,
    'accept': 'application/json',
  };
  const params = {
    term: cityName,
    location_types: 'city',
  };

  try {
    const response = await axios.get(locationEndpoint, {
      headers,
      params,
    });
    const locations = response.data.locations;
    const code = locations[0].code;
    return code;
  } catch (error) {
    console.error('Error fetching destination code:', error);
    throw error;
  }
}