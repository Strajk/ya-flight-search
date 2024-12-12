import { getFlights, getDestinationCode, kiwiSearchApiSchema } from './app/api/kiwi';
import { z } from 'zod';

const testGetFlights = async () => {
  const dummyData = {
    fly_from: 'Praha', // Prague Airport code
    fly_to: 'London',   // John F. Kennedy International Airport code
    curr: "CZK"
    // Include other necessary parameters if needed
  };

  try {
    const apiRequest = kiwiSearchApiSchema.parse(dummyData);

    // Call getFlights with the validated data
    const flights = await getFlights(apiRequest);

    // Log the results
    console.log('Flights:', flights);
  } catch (error) {
    console.error('Error:', error);
  }
};

const testGetDestinationCode = async () => {
  const cityName = 'New York'; // Example city name

  try {
    const code = await getDestinationCode(cityName);
    console.log(`The code for ${cityName} is:`, code);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Uncomment the following line to test getDestinationCode
// testGetDestinationCode();

testGetFlights();


