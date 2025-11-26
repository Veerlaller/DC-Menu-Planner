# DC Menu Planner - Backend API

Backend API server for the UC Davis Diet Tracker mobile application.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Dev Tools:** ts-node-dev for hot reload

## Project Structure

```
server/
├── src/
│   ├── index.ts           # Main Express application
│   ├── routes/
│   │   └── health.ts      # Health check routes
│   └── lib/
│       └── supabase.ts    # Supabase client configuration
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── .env                   # Environment variables (create this)
├── .env.example          # Example environment variables
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Supabase project with the database schema set up
- Supabase service role key (from Supabase dashboard → Settings → API)

### Installation

1. **Install dependencies:**

```bash
cd server
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
PORT=4000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** Never commit your `.env` file. It's already in `.gitignore`.

### Running the Server

#### Development Mode (with hot reload)

```bash
npm run dev
```

This will start the server with automatic restart on file changes.

#### Production Build

```bash
npm run build
npm start
```

#### Type Checking (without running)

```bash
npm run type-check
```

## API Endpoints

### Health Checks

#### `GET /health`

Basic health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-26T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

#### `GET /db-health`

Database connectivity health check.

**Success Response:**
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "timestamp": "2025-01-26T12:00:00.000Z"
}
```

**Error Response (503):**
```json
{
  "status": "error",
  "message": "Database connection failed",
  "error": "Error details here",
  "timestamp": "2025-01-26T12:00:00.000Z"
}
```

## Development

### File Conventions

- Use `.ts` extension for TypeScript files
- ES modules are enabled (`"type": "module"` in package.json)
- Import statements must include `.js` extension (TypeScript quirk for ES modules)

### Adding New Routes

1. Create route handlers in `src/routes/` (to be created)
2. Import and use them in `src/index.ts`
3. Follow RESTful conventions

### Supabase Client

The Supabase client is configured with the **service role key**, which bypasses Row Level Security (RLS) policies. This means:

- ✅ You have full database access
- ⚠️ You must implement your own authorization logic
- ⚠️ Never expose this client directly to the frontend

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Port number for the server | No (default: 4000) |
| `NODE_ENV` | Environment (development/production) | No (default: development) |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase | Yes |

## Troubleshooting

### "Missing Supabase environment variables" error

Make sure you've created a `.env` file and added your Supabase credentials.

### Database connection fails

1. Verify your `SUPABASE_URL` is correct
2. Verify your `SUPABASE_SERVICE_ROLE_KEY` is the service role key (not anon key)
3. Check if your Supabase project is active
4. Ensure your database has the required tables (run migrations first)

### Port already in use

Change the `PORT` in your `.env` file to a different number (e.g., 4001).

To find and kill a process on a specific port:
```bash
# Find process on port 4000
lsof -ti:4000

# Kill the process
lsof -ti:4000 | xargs kill -9
```

## Next Steps

1. ✅ Set up basic Express server
2. ✅ Configure Supabase client
3. ✅ Add health check endpoints
4. 🔜 Create database migrations from `data_model.md`
5. 🔜 Implement API routes (see `api_design.md`)
6. 🔜 Add authentication middleware
7. 🔜 Implement menu scraper integration
8. 🔜 Add request validation
9. 🔜 Set up logging and monitoring

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server with hot reload |
| `build` | `npm run build` | Compile TypeScript to JavaScript |
| `start` | `npm start` | Run compiled JavaScript (production) |
| `type-check` | `npm run type-check` | Check TypeScript types without compiling |

## Resources

- [Express Documentation](https://expressjs.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

