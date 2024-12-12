import {z} from "zod";
import {faker} from "@faker-js/faker";
import {Flight} from "@/types/search";

export const kiwiSearchApiSchema = z.object({

})


export async function fakeApi(apiRequest: z.infer<typeof kiwiSearchApiSchema>): Promise<Flight[]> {
  const numResults = faker.number.int({min: 1, max: 5})
  return Array.from({length: numResults}, (_, index) => ({
    id: faker.string.uuid(),
    airline: faker.company.name(),
    flightNumber: faker.number.int({min: 1000, max: 9999}).toString(),
    departureTime: faker.date.soon().toISOString(),
    arrivalTime: faker.date.soon().toISOString(),
    price: faker.number.int({min: 100, max: 1000}),
    currency: "USD",
    duration: faker.number.int({min: 1, max: 10}).toString() + "h",
    stops: faker.number.int({min: 0, max: 2}),
  }))
}