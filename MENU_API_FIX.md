# Menu API Fix - Summary

## Problem
The MenusScreen in the mobile app was using mock API data instead of fetching real menu items from Supabase. There was no server endpoint to retrieve menu data from the database.

## Solution

### 1. Created New Server Route: `/server/src/routes/menus.ts`

Added two new API endpoints:

#### `GET /api/menus/available`
- Fetches all menu items for a specific date (defaults to today)
- Query params: `date` (YYYY-MM-DD format, optional)
- Returns menu items with full nutrition data, dining hall info, and dietary flags

#### `GET /api/menus/:hall/:mealType`
- Fetches menu items for a specific dining hall and meal type
- Path params: `hall` (Latitude, Cuarto, Segundo, Tercero), `mealType` (breakfast, lunch, dinner)
- Query params: `date` (YYYY-MM-DD format, optional)

### 2. Updated Server Index: `/server/src/index.ts`
- Registered the new menus route

### 3. Updated Mobile App: `/mobile/src/screens/main/MenusScreen.tsx`
- Changed from using `useMockApi.getAvailableMenus()` to `getAvailableMenus()`
- Fixed filter to use `meal_type` instead of `category`

### 4. Updated Type Definitions: `/mobile/src/types/index.ts`
- Added `meal_type` and `date` fields to `MenuItem` interface
- Updated `MenuItemWithNutrition` to properly type nullable fields

## Database Query Structure

The API performs complex joins to fetch:
```
menu_items
  → menu_days (meal type, date)
    → dining_halls (hall info)
  → nutrition_facts (nutrition data)
```

All data is flattened into a single response for easy consumption by the mobile app.

## Testing

### Prerequisites
1. Ensure the scraper has populated the database with menu data
2. Server must be running on port 4000
3. Mobile app must have valid authentication

### Test Steps

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Verify the endpoint works:**
   ```bash
   # Test getting all menus for today
   curl http://localhost:4000/api/menus/available

   # Test getting Cuarto lunch menu
   curl http://localhost:4000/api/menus/Cuarto/lunch
   ```

3. **Test in mobile app:**
   - Open the app and navigate to the "Menus" tab
   - Select different dining halls (Latitude, Cuarto, Segundo, Tercero)
   - Select different meal types (Breakfast, Lunch, Dinner)
   - Verify menu items load from Supabase
   - Check that nutrition data displays correctly
   - Verify dietary flags (Vegan, Vegetarian, Contains Gluten) appear

## Data Flow

1. User opens Menus tab
2. `MenusScreen.tsx` calls `getAvailableMenus()`
3. API client (`mobile/src/api/client.ts`) makes request to `/api/menus/available`
4. Server (`server/src/routes/menus.ts`) queries Supabase
5. Data is transformed and returned to mobile app
6. MenusScreen filters by selected hall and meal type
7. Menu items are displayed with nutrition info

## Error Handling

- Returns 500 status if database query fails
- Logs detailed error messages on server
- Mobile app shows loading state while fetching
- Shows "No menu available" message if no items found

## Related Files Modified

- ✅ `server/src/routes/menus.ts` (NEW)
- ✅ `server/src/index.ts`
- ✅ `mobile/src/screens/main/MenusScreen.tsx`
- ✅ `mobile/src/types/index.ts`

## Next Steps

1. Ensure database has menu data (run scraper)
2. Test the endpoints directly with curl/Postman
3. Test the mobile app with real data
4. Consider adding:
   - Caching to reduce database queries
   - Pagination for large menu lists
   - Search/filter functionality
   - Date picker to view future menus

