# Database Migrations

This directory contains SQL migration scripts for the DC Menu Planner database.

## 📋 Migration Files

### Initial Setup
- **`schema.sql`** - Complete database schema
  - All tables, indexes, and constraints
  - Seed data for dining halls
  - Triggers for automatic timestamp updates
  - Run this first on a fresh database

### Development Migrations
- **`remove-auth-constraints.sql`** - Remove FK constraints to auth.users
  - Drops foreign key constraints from `user_profiles`, `user_preferences`, and `meal_logs`
  - Allows testing without Supabase Auth
  - **Run after schema.sql**
  - **See [TESTING_MIGRATION.md](./TESTING_MIGRATION.md) for complete testing guide**

### Data Migrations
- **`migrate-to-imperial.sql`** - Convert metric to imperial units
  - Updates user profiles to use imperial units (inches, lbs)
  - Run if you have existing data in metric units

- **`add-religious-restrictions.sql`** - Add religious dietary options
  - Adds `is_halal`, `is_kosher`, `is_hindu_non_veg` columns
  - Extends dietary preference options

## 🚀 How to Run Migrations

### Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of the migration file
5. Click **Run** to execute

### Using Supabase CLI (if installed)
```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run a specific migration
supabase db execute --file server/db/remove-auth-constraints.sql
```

## 📝 Migration Order

For a fresh database setup:
```
1. schema.sql                      # Create all tables
2. remove-auth-constraints.sql     # Remove FK constraints (development)
3. add-religious-restrictions.sql  # Add dietary options (if needed)
```

For existing databases:
```
- Only run the specific migrations you need
- Read the migration file comments carefully
- Consider backing up data first
```

## ⚠️ Important Notes

### Development vs Production
- **`remove-auth-constraints.sql`** is for development only
- In production, use proper Supabase Auth or create a dedicated users table
- Do NOT remove FK constraints in production

### Idempotency
- Most migrations use `IF EXISTS` and `IF NOT EXISTS` clauses
- Safe to re-run if needed
- Check comments in each file for specific details

### Verification
- Each migration file includes verification queries (commented out)
- Uncomment and run these to verify the migration worked correctly

## 🔍 Checking Current Schema

To see all foreign key constraints:
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

To see all tables:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## 📚 Additional Resources

- [Testing Migration Guide](./TESTING_MIGRATION.md) - Complete guide to test FK constraint removal
- [Supabase SQL Editor Documentation](https://supabase.com/docs/guides/database/overview)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Database Schema Design](../../data_model.md)

## 🐛 Troubleshooting

### "constraint does not exist" error
- The constraint may have already been dropped
- Use `IF EXISTS` clause (already included in our migrations)
- Not a problem - migration is idempotent

### "relation does not exist" error
- Table hasn't been created yet
- Run `schema.sql` first
- Check that you're connected to the correct database

### Foreign key violation errors
- Make sure you've run `remove-auth-constraints.sql`
- Check that UUIDs are valid
- Verify no orphaned records exist

---

**Last Updated**: November 28, 2025

