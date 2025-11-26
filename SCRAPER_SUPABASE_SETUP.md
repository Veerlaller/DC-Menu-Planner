# Menu Scraper with Supabase Integration

The UC Davis menu scraper now supports storing scraped menu data directly into Supabase, making it available to the backend API and mobile app.

## Prerequisites

1. **Node.js and npm** installed
2. **Supabase project** with the schema from `server/db/schema.sql` deployed
3. **Environment variables** configured (see below)

## Environment Setup

Create a `.env` file in the project root with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

You can find these values in your Supabase project dashboard under **Settings → API**.

> ⚠️ **Security Note**: The service role key bypasses Row Level Security. Keep it secure and never commit it to version control!

## Installation

Install dependencies:

```bash
npm install
```

## Usage

### Basic Commands

```bash
# Scrape all dining halls for today, store in database and JSON
npm run scrape:dev

# Scrape and clear existing data first (recommended for re-scraping)
npm run scrape:db

# Build and run production version
npm run build
node dist/scraper/index.js
```

### Command Line Options

```bash
# Scrape a specific date
npm run scrape:dev -- --date=2025-12-01

# Scrape only one dining hall
npm run scrape:dev -- --hall=Cuarto

# Skip database storage (JSON only)
npm run scrape:dev -- --no-db

# Clear existing data for the date before scraping
npm run scrape:dev -- --clear

# Custom JSON output path
npm run scrape:dev -- --output=./custom/path/menu.json

# Show help
npm run scrape:dev -- --help
```

### Combining Options

```bash
# Clear and re-scrape Segundo for a specific date
npm run scrape:dev -- --date=2025-12-01 --hall=Segundo --clear

# Scrape all halls but only save to JSON (no database)
npm run scrape:dev -- --no-db --output=./backup/menu.json
```

## How It Works

### Data Flow

1. **Scraper** fetches menu data from UC Davis dining hall websites
2. **Supabase Storage Module** (`src/scraper/supabase-storage.ts`):
   - Connects to Supabase using service role key
   - Creates/finds dining hall records
   - Creates/finds menu_day records for each meal period
   - Stores menu items with nutritional information
3. **Database** stores the data in normalized tables:
   - `dining_halls` - Dining location information
   - `menu_days` - Specific meal periods (breakfast, lunch, dinner)
   - `menu_items` - Individual food items
   - `nutrition_facts` - Nutritional information for each item

### Database Schema Mapping

| Scraper Field | Database Table | Database Column |
|--------------|----------------|-----------------|
| `item.hall` | `dining_halls` | `name` (via lookup) |
| `item.date` | `menu_days` | `date` |
| `item.meal` | `menu_days` | `meal_type` |
| `item.name` | `menu_items` | `name` |
| `item.station` | `menu_items` | `station` |
| `item.description` | `menu_items` | `description` |
| `item.allergens` | `menu_items` | `allergen_info` |
| `item.dietaryFlags` | `menu_items` | `is_vegetarian`, `is_vegan` |
| `item.nutrition.*` | `nutrition_facts` | Various columns |

### Error Handling

The scraper includes robust error handling:

- **Connection failures**: Test database connection before scraping
- **Duplicate data**: Use `--clear` flag to remove existing data first
- **Partial failures**: Continue processing even if some items fail
- **Error reporting**: Summary of successes and failures at the end

## Troubleshooting

### "Failed to connect to Supabase"

- Check that your `.env` file exists and contains valid credentials
- Verify the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Ensure your Supabase project is active

### "Failed to create menu_day"

- Ensure the database schema from `server/db/schema.sql` is deployed
- Check that dining halls are seeded in the `dining_halls` table
- Verify the date format is valid (YYYY-MM-DD)

### Permission Denied Errors

- The service role key should have full access to all tables
- If using custom RLS policies, the service role bypasses them
- Check Supabase logs for detailed error messages

### Duplicate Items

- Use the `--clear` flag to remove existing data before scraping
- The scraper doesn't deduplicate items within a single run
- Menu items are identified by their combination of menu_day_id and name

## Scheduled Scraping

To automatically scrape menus daily, you can:

1. **Use cron** (Linux/macOS):
   ```bash
   # Add to crontab (run at 6 AM daily)
   0 6 * * * cd /path/to/DC-Menu-Planner && npm run scrape:db >> logs/scraper.log 2>&1
   ```

2. **Use Task Scheduler** (Windows):
   - Create a new task to run `npm run scrape:db` daily

3. **Use GitHub Actions** (Cloud-based):
   - Create a workflow that runs on schedule
   - Store Supabase credentials as secrets

4. **Use Supabase Edge Functions** (Recommended):
   - Deploy the scraper as an edge function
   - Trigger via cron or webhook

## Development

### File Structure

```
src/scraper/
├── index.ts                  # Main entry point and CLI
├── types.ts                  # TypeScript interfaces
├── ucdavis-menu-scraper.ts   # Web scraping logic
└── supabase-storage.ts       # Database storage (NEW)
```

### Adding New Features

To modify database storage behavior:

1. Edit `src/scraper/supabase-storage.ts`
2. Update the schema in `server/db/schema.sql` if needed
3. Rebuild and test: `npm run build && npm run scrape:dev`

### Testing

```bash
# Test database connection
npm run scrape:dev -- --no-db  # Should work without database

# Test scraping without storing
npm run scrape:dev -- --no-db --output=./test/menu.json

# Test specific date/hall
npm run scrape:dev -- --date=2025-12-01 --hall=Latitude
```

## Integration with Backend

The backend API (`server/`) can now read menu data directly from Supabase:

```typescript
// Example: Fetch today's menu
const { data, error } = await supabase
  .from('menu_days')
  .select(`
    *,
    dining_hall:dining_halls(*),
    menu_items(
      *,
      nutrition:nutrition_facts(*)
    )
  `)
  .eq('date', today)
  .eq('meal_type', 'lunch');
```

## Next Steps

- [ ] Set up automated daily scraping
- [ ] Add monitoring/alerting for scraper failures
- [ ] Implement incremental updates (only new items)
- [ ] Add support for weekly batch scraping
- [ ] Create admin dashboard to view scraper status

