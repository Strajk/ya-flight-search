import { test, expect } from "@playwright/test"
import { format } from "date-fns"

test.describe("Flight Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("basic search workflow", async ({ page }) => {
    // Verify initial page load
    await expect(page.getByText("Hello 👋")).toBeVisible()
    await expect(page.getByText("Where do we fly next?")).toBeVisible()

    // Verify default form values
    await expect(page.getByText("Madrid")).toBeVisible()
    await expect(page.getByText("Dublin")).toBeVisible()

    // Open date picker
    await page.getByRole("button", { name: /Return/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    // Select dates
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    await page.getByLabel("Departure date").click()
    await page.getByRole("button", { name: format(tomorrow, "d MMMM yyyy") }).click()

    await page.getByLabel("Return date").click()
    await page.getByRole("button", { name: format(nextWeek, "d MMMM yyyy") }).click()

    // Close date picker
    await page.getByRole("button", { name: "Done" }).click()

    // Set passengers and bags
    await page.getByRole("button", { name: /1 passenger/i }).click()
    await page.getByRole("button", { name: "Add passenger" }).click()
    await page.getByRole("button", { name: "Add bag" }).click()
    await page.getByRole("button", { name: "Done" }).click()

    // Submit search
    await page.getByRole("button", { name: /Search/i }).click()

    // Wait for search results
    await expect(page.getByText("Searching for flights...")).toBeVisible()
    await expect(page.getByText("Searching for flights...")).not.toBeVisible({ timeout: 10000 })

    // Verify search results
    const flightCards = page.locator(".flex-none.bg-muted\\/50")
    await expect(flightCards).toHaveCount(3)

    // Verify flight details are visible
    await expect(page.getByText(/Direct|stops?/)).toBeVisible()
    await expect(page.getByText(/Book flight/)).toBeVisible()

    // Test filter functionality
    const filters = page.locator("button", { hasText: /Flights under|Non-stop|Morning/ })
    await expect(filters).toHaveCount(4)

    // Click a filter
    await filters.first().click()

    // Verify new search is performed
    await expect(page.getByText("Searching for flights...")).toBeVisible()
    await expect(page.getByText("Searching for flights...")).not.toBeVisible({ timeout: 10000 })

    // Verify chat functionality
    await page.getByPlaceholder(/Ask me anything/i).fill("Show me cheaper flights")
    await page.getByPlaceholder(/Ask me anything/i).press("Enter")

    // Verify chat response
    await expect(page.getByText(/Assistant:/)).toBeVisible({ timeout: 10000 })
  })

  test("handles no results gracefully", async ({ page }) => {
    // Set an impossible date combination to trigger no results
    await page.getByRole("button", { name: /Return/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    const farFuture = new Date()
    farFuture.setFullYear(farFuture.getFullYear() + 1)
    
    await page.getByLabel("Departure date").click()
    await page.getByRole("button", { name: format(farFuture, "d MMMM yyyy") }).click()
    await page.getByRole("button", { name: "Done" }).click()

    await page.getByRole("button", { name: /Search/i }).click()

    // Verify no results message
    await expect(page.getByText(/No flights found/i)).toBeVisible({ timeout: 10000 })
  })

  test("responsive design", async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText("Hello 👋")).toBeVisible()

    // Verify form is properly stacked
    const searchForm = page.locator("form").first()
    await expect(searchForm).toBeVisible()
    
    // Verify flight cards are properly sized
    await page.getByRole("button", { name: /Search/i }).click()
    await expect(page.getByText("Searching for flights...")).not.toBeVisible({ timeout: 10000 })
    
    const flightCard = page.locator(".flex-none.bg-muted\\/50").first()
    const boundingBox = await flightCard.boundingBox()
    expect(boundingBox?.width).toBeLessThanOrEqual(375)
  })
}) 