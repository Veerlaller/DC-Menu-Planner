# DC Menu Planner - MVP Feature Development Plan

## Overview

This document outlines the strategy for parallel development of MVP features using multiple Cursor AI agents working simultaneously on different branches. We'll use **Git Worktrees** to enable clean, isolated development environments for each agent.

## Table of Contents

1. [Git Worktree Primer](#git-worktree-primer)
2. [Development Tracks](#development-tracks)
3. [Setup: Creating Worktrees](#setup-creating-worktrees)
4. [Working with Multiple Cursor Agents](#working-with-multiple-cursor-agents)
5. [Agent-Specific Instructions](#agent-specific-instructions)
6. [Coordination Workflow](#coordination-workflow)
7. [Cleanup Instructions](#cleanup-instructions)
8. [Troubleshooting](#troubleshooting)

---

## Git Worktree Primer

### What are Git Worktrees?

Git worktrees allow you to have **multiple working directories** from a single Git repository. Each worktree:
- Has its own physical directory
- Is checked out to a specific branch
- Shares the same `.git` database (commits, branches, etc.)
- Can be worked on independently without affecting other worktrees

### Why Use Worktrees for Multi-Agent Development?

**Traditional approach problems:**
- ❌ Multiple windows point to same directory
- ❌ Must manually switch branches in each window
- ❌ Risk of working on wrong branch
- ❌ Can't run multiple dev servers simultaneously
- ❌ File watchers can interfere with each other

**Git worktree approach benefits:**
- ✅ Each agent gets its own physical directory
- ✅ Each directory is already on the correct branch
- ✅ Complete isolation between agents
- ✅ Can run multiple dev servers if needed
- ✅ No branch confusion or accidental commits
- ✅ Better file system separation

### Directory Structure

After setting up worktrees, your file structure will look like:

```
C:\Users\ygkar\dev\
├── DC-Menu-Planner\                    (main worktree - fix/database-constraints)
├── DC-Menu-Planner-meals\              (worktree - feature/meal-logging)
├── DC-Menu-Planner-menus\              (worktree - feature/menu-browsing)
├── DC-Menu-Planner-recommendations\    (worktree - feature/recommendations)
└── DC-Menu-Planner-mobile\             (worktree - feature/mobile-screens)
```

Each directory is a complete, independent workspace on its own branch.

---

## Development Tracks

The MVP is divided into 5 parallel tracks:

### Track 0: Database Fixes (BLOCKER)
**Branch:** `fix/database-constraints`  
**Status:** Must complete first  
**Agent:** 1  
**Tasks:** Fix auth constraints in database schema

### Track 1: Meal Logging
**Branch:** `feature/meal-logging`  
**Agent:** 2  
**Focus:** Backend endpoints for logging meals  
**Files:**
- `server/src/routes/meals.ts` (new)
- `server/src/types/api.ts` (additions)
- `server/src/index.ts` (route registration)

### Track 2: Menu Data & Browsing
**Branch:** `feature/menu-browsing`  
**Agent:** 3  
**Focus:** Menu import and browsing endpoints  
**Files:**
- `scraper/import-to-db.ts` (new)
- `server/src/routes/menus.ts` (additions)
- `server/src/types/api.ts` (additions)
- `server/src/index.ts` (route registration)

### Track 3: Recommendation Engine
**Branch:** `feature/recommendations`  
**Agent:** 4  
**Focus:** Smart meal recommendation algorithm  
**Files:**
- `server/src/utils/recommendation-engine.ts` (new)
- `server/src/routes/recommendations.ts` (new)
- `server/src/types/api.ts` (additions)
- `server/src/index.ts` (route registration)

### Track 4: Mobile Screens
**Branch:** `feature/mobile-screens`  
**Agent:** 5  
**Focus:** Complete mobile UI implementation  
**Files:**
- `mobile/src/screens/main/*.tsx` (updates)
- `mobile/src/components/*.tsx` (new components)
- `mobile/src/api/*.ts` (API integration)

---

## Setup: Creating Worktrees

### Prerequisites

1. Ensure your main worktree is on the base branch:

```bash
cd C:\Users\ygkar\dev\DC-Menu-Planner
git checkout fix/database-constraints
git pull origin fix/database-constraints
```

2. Ensure the base branch is committed and clean:

```bash
git status
# Should show: "nothing to commit, working tree clean"
```

### Step 1: Create All Worktrees

Run these commands from your main worktree directory:

```bash
# Create worktree for meal logging (Agent 2)
git worktree add ..\DC-Menu-Planner-meals -b feature/meal-logging

# Create worktree for menu browsing (Agent 3)
git worktree add ..\DC-Menu-Planner-menus -b feature/menu-browsing

# Create worktree for recommendations (Agent 4)
git worktree add ..\DC-Menu-Planner-recommendations -b feature/recommendations

# Create worktree for mobile screens (Agent 5)
git worktree add ..\DC-Menu-Planner-mobile -b feature/mobile-screens
```

**What this does:**
- Creates new directories at the parent level (`C:\Users\ygkar\dev\`)
- Creates new branches from current HEAD (fix/database-constraints)
- Checks out each branch in its respective worktree
- Links all worktrees to the same Git database

### Step 2: Verify Worktrees

```bash
git worktree list
```

You should see:

```
C:/Users/ygkar/dev/DC-Menu-Planner              <commit-hash> [fix/database-constraints]
C:/Users/ygkar/dev/DC-Menu-Planner-meals        <commit-hash> [feature/meal-logging]
C:/Users/ygkar/dev/DC-Menu-Planner-menus        <commit-hash> [feature/menu-browsing]
C:/Users/ygkar/dev/DC-Menu-Planner-recommendations <commit-hash> [feature/recommendations]
C:/Users/ygkar/dev/DC-Menu-Planner-mobile       <commit-hash> [feature/mobile-screens]
```

### Step 3: Push Branches to Remote

From the main worktree:

```bash
git push -u origin feature/meal-logging
git push -u origin feature/menu-browsing
git push -u origin feature/recommendations
git push -u origin feature/mobile-screens
```

---

## Working with Multiple Cursor Agents

### Opening Worktrees in Cursor

1. **Open first Cursor window** (you already have this open)
   - Should be in: `C:\Users\ygkar\dev\DC-Menu-Planner`
   - On branch: `fix/database-constraints`
   - **Agent 1** works here

2. **Open second Cursor window** for Agent 2:
   - Press `Ctrl+Shift+N` or **File → New Window**
   - **File → Open Folder**
   - Navigate to: `C:\Users\ygkar\dev\DC-Menu-Planner-meals`
   - This window is automatically on `feature/meal-logging` branch

3. **Open third Cursor window** for Agent 3:
   - Press `Ctrl+Shift+N` or **File → New Window**
   - **File → Open Folder**
   - Navigate to: `C:\Users\ygkar\dev\DC-Menu-Planner-menus`
   - This window is automatically on `feature/menu-browsing` branch

4. **Open fourth Cursor window** for Agent 4:
   - Press `Ctrl+Shift+N` or **File → New Window**
   - **File → Open Folder**
   - Navigate to: `C:\Users\ygkar\dev\DC-Menu-Planner-recommendations`
   - This window is automatically on `feature/recommendations` branch

5. **Open fifth Cursor window** for Agent 5:
   - Press `Ctrl+Shift+N` or **File → New Window**
   - **File → Open Folder**
   - Navigate to: `C:\Users\ygkar\dev\DC-Menu-Planner-mobile`
   - This window is automatically on `feature/mobile-screens` branch

### Organizing Your Workspace

**Pro tip:** Use Windows Snap to organize your Cursor windows:

- **Agent 1** (main): Upper-left quarter
- **Agent 2** (meals): Upper-right quarter  
- **Agent 3** (menus): Lower-left quarter
- **Agent 4** (recommendations): Center-left
- **Agent 5** (mobile): Center-right

Or use Windows virtual desktops (Win+Tab) to separate agents across workspaces.

---

## Agent-Specific Instructions

### 🤖 Agent 1: Database Fixes (BLOCKER)

**Worktree:** `C:\Users\ygkar\dev\DC-Menu-Planner`  
**Branch:** `fix/database-constraints`

**Instructions:**
```
You are Agent 1 working on database constraint fixes.

WORKTREE: C:\Users\ygkar\dev\DC-Menu-Planner
BRANCH: fix/database-constraints (verify with: git branch --show-current)

TASK: Fix authentication constraints in the database schema

Files to modify:
- server/db/remove-auth-constraints.sql (already exists)
- Update any related schema files

When complete:
1. Test the migration
2. Commit: git add . && git commit -m "fix: remove auth constraints from database"
3. Push: git push origin fix/database-constraints
4. Create PR to merge into feat/google_oauth
5. NOTIFY OTHER AGENTS when merged

DO NOT work on meal logging, menus, recommendations, or mobile screens.
```

---

### 🤖 Agent 2: Meal Logging

**Worktree:** `C:\Users\ygkar\dev\DC-Menu-Planner-meals`  
**Branch:** `feature/meal-logging`

**Instructions:**
```
You are Agent 2 working on meal logging functionality.

WORKTREE: C:\Users\ygkar\dev\DC-Menu-Planner-meals
BRANCH: feature/meal-logging (verify with: git branch --show-current)

WAIT for Agent 1 to complete and merge fix/database-constraints before starting.

Once Agent 1 is merged, sync your worktree:
cd C:\Users\ygkar\dev\DC-Menu-Planner-meals
git pull origin feat/google_oauth
git merge feat/google_oauth

YOUR TASK: Implement meal logging backend endpoints

Create these files:
1. server/src/routes/meals.ts
   - POST /api/meals/log - Log a consumed meal
   - GET /api/meals/logs - Get user's meal logs (with date filtering)
   - DELETE /api/meals/log/:id - Remove a logged meal
   - GET /api/meals/today - Get today's logged meals with macro totals

2. Update server/src/types/api.ts
   - Add MealLog types
   - Add request/response types for meal endpoints

3. Update server/src/index.ts
   - Add ONE line: app.use('/api/meals', mealsRoutes);

Reference:
- Look at server/src/routes/onboarding.ts for structure examples
- Use server/src/middleware/auth.ts for authentication
- Query the meal_logs table (see server/db/schema.sql)

When complete:
cd C:\Users\ygkar\dev\DC-Menu-Planner-meals
git add .
git commit -m "feat: implement meal logging endpoints"
git push origin feature/meal-logging

Then create a PR to merge into feat/google_oauth.

DO NOT work on menus, recommendations, or mobile screens.
These are handled by other agents in other worktrees.
```

---

### 🤖 Agent 3: Menu Data & Browsing

**Worktree:** `C:\Users\ygkar\dev\DC-Menu-Planner-menus`  
**Branch:** `feature/menu-browsing`

**Instructions:**
```
You are Agent 3 working on menu data and browsing.

WORKTREE: C:\Users\ygkar\dev\DC-Menu-Planner-menus
BRANCH: feature/menu-browsing (verify with: git branch --show-current)

WAIT for Agent 1 to complete and merge fix/database-constraints before starting.

Once Agent 1 is merged, sync your worktree:
cd C:\Users\ygkar\dev\DC-Menu-Planner-menus
git pull origin feat/google_oauth
git merge feat/google_oauth

YOUR TASK: Create menu import script and browsing endpoints

Create these files:
1. scraper/import-to-db.ts
   - CLI script to import scraped menu data into Supabase
   - Use existing scraper/supabase-storage.ts SupabaseStorage class
   - Read from data/menu.json
   - Insert menu items, dining halls, nutritional info
   - Handle duplicates gracefully

2. Enhance server/src/routes/menus.ts
   - GET /api/menus/today - Get today's menu across all halls
   - GET /api/menus - Get menus with filters (hall, date, meal_period)
   - GET /api/menus/item/:id - Get specific menu item details
   - GET /api/menus/halls - Get list of dining halls

3. Update server/src/types/api.ts
   - Add Menu, MenuItem, DiningHall types
   - Add request/response types

4. Update server/src/index.ts  
   - Add ONE line: app.use('/api/menus', menusRoutes);

Reference:
- scraper/supabase-storage.ts for database operations
- data/menu.json for data structure
- server/db/schema.sql for table structure

When complete:
cd C:\Users\ygkar\dev\DC-Menu-Planner-menus
git add .
git commit -m "feat: add menu import script and browsing endpoints"
git push origin feature/menu-browsing

Then create a PR to merge into feat/google_oauth.

DO NOT work on meal logging, recommendations, or mobile screens.
These are handled by other agents in other worktrees.
```

---

### 🤖 Agent 4: Recommendation Engine

**Worktree:** `C:\Users\ygkar\dev\DC-Menu-Planner-recommendations`  
**Branch:** `feature/recommendations`

**Instructions:**
```
You are Agent 4 working on the recommendation engine.

WORKTREE: C:\Users\ygkar\dev\DC-Menu-Planner-recommendations
BRANCH: feature/recommendations (verify with: git branch --show-current)

WAIT for Agent 1 to complete and merge fix/database-constraints before starting.

Once Agent 1 is merged, sync your worktree:
cd C:\Users\ygkar\dev\DC-Menu-Planner-recommendations
git pull origin feat/google_oauth
git merge feat/google_oauth

YOUR TASK: Build the recommendation engine and endpoint

Create these files:
1. server/src/utils/recommendation-engine.ts
   - Algorithm to recommend meals based on:
     * User's remaining macros for the day
     * User's dietary preferences
     * Currently available menu items
     * User's meal history (variety)
   - Export function: recommendMeals(userId, currentTime)
   - Return ranked list of menu items with scores

2. server/src/routes/recommendations.ts
   - GET /api/recommendations/now - "I'm Hungry Now" feature
     * Get user's macro targets and consumed macros
     * Find currently open dining halls
     * Call recommendation engine
     * Return top 5 recommendations with reasoning
   - GET /api/recommendations/meal/:meal_period - Get recommendations for specific meal

3. Update server/src/types/api.ts
   - Add Recommendation, RecommendationScore types
   - Add request/response types

4. Update server/src/index.ts
   - Add ONE line: app.use('/api/recommendations', recommendationsRoutes);

Algorithm considerations:
- Macro proximity score (how well it fits remaining macros)
- Preference alignment (dietary restrictions, liked ingredients)
- Variety score (penalize recently eaten items)
- Availability score (is the dining hall open now?)

You can use stub/mock data for menu items if Agent 3 isn't done yet.

Reference:
- See ROADMAP.md for macro calculation logic
- server/db/schema.sql for table structures

When complete:
cd C:\Users\ygkar\dev\DC-Menu-Planner-recommendations
git add .
git commit -m "feat: implement recommendation engine"
git push origin feature/recommendations

Then create a PR to merge into feat/google_oauth.

DO NOT work on meal logging, menus, or mobile screens.
These are handled by other agents in other worktrees.
```

---

### 🤖 Agent 5: Mobile Screens

**Worktree:** `C:\Users\ygkar\dev\DC-Menu-Planner-mobile`  
**Branch:** `feature/mobile-screens`

**Instructions:**
```
You are Agent 5 working on mobile UI screens.

WORKTREE: C:\Users\ygkar\dev\DC-Menu-Planner-mobile
BRANCH: feature/mobile-screens (verify with: git branch --show-current)

You can start immediately (doesn't depend on Agent 1).
However, you'll need to use mock data until backend agents finish.

YOUR TASK: Complete the main mobile app screens

Enhance these screens:
1. mobile/src/screens/main/TodayScreen.tsx
   - Display macro progress bars (use MacroProgressBar component)
   - Show today's logged meals
   - Add "Log Meal" button
   - Integrate with /api/meals/today endpoint

2. mobile/src/screens/main/MenusScreen.tsx
   - List menu items from current dining halls
   - Add filters (hall, meal period, dietary prefs)
   - Search functionality
   - Nutrition detail modal
   - Integrate with /api/menus endpoints

3. mobile/src/screens/main/HungryNowScreen.tsx
   - Call /api/recommendations/now endpoint
   - Display top 5 recommendations
   - Show recommendation reasoning
   - Display dining hall info (location, hours)
   - Quick "Log This Meal" action

4. Create new components as needed:
   - mobile/src/components/MealCard.tsx
   - mobile/src/components/MenuItemCard.tsx
   - mobile/src/components/RecommendationCard.tsx
   - mobile/src/components/NutritionLabel.tsx

5. Update mobile/src/api/client.ts
   - Add functions for new endpoints
   - Use proper TypeScript types from mobile/src/types/index.ts

UI Guidelines:
- Follow existing theme (mobile/src/constants/theme.ts)
- Use modern, clean design
- Add loading states
- Add error handling
- Make it responsive

Start with MOCK DATA in the components, then integrate real APIs once available.

When complete:
cd C:\Users\ygkar\dev\DC-Menu-Planner-mobile
git add .
git commit -m "feat: implement main mobile screens"
git push origin feature/mobile-screens

Then create a PR to merge into feat/google_oauth.

DO NOT work on backend endpoints (meals, menus, recommendations).
These are handled by other agents in other worktrees.
```

---

## Coordination Workflow

### Phase 1: Setup (You as coordinator)

1. ✅ Create all worktrees (see Setup section above)
2. ✅ Open 5 Cursor windows, each in a different worktree
3. ✅ Give each agent their specific instructions (copy-paste from above)

### Phase 2: Agent 1 Works (Blocker)

1. **Agent 1** completes database fixes
2. **Agent 1** commits and pushes to `fix/database-constraints`
3. **You** review and merge PR into `feat/google_oauth`
4. **You** notify other agents that they can start

### Phase 3: Sync Worktrees

After Agent 1's work is merged, sync all other worktrees:

```bash
# In DC-Menu-Planner-meals worktree
cd C:\Users\ygkar\dev\DC-Menu-Planner-meals
git pull origin feat/google_oauth
git merge feat/google_oauth

# In DC-Menu-Planner-menus worktree
cd C:\Users\ygkar\dev\DC-Menu-Planner-menus
git pull origin feat/google_oauth
git merge feat/google_oauth

# In DC-Menu-Planner-recommendations worktree
cd C:\Users\ygkar\dev\DC-Menu-Planner-recommendations
git pull origin feat/google_oauth
git merge feat/google_oauth

# DC-Menu-Planner-mobile can start immediately (no dependency)
```

### Phase 4: Agents 2, 3, 4, 5 Work (Parallel)

All four agents can now work simultaneously:
- **Agent 2** builds meal logging endpoints
- **Agent 3** builds menu import and browsing
- **Agent 4** builds recommendation engine
- **Agent 5** builds mobile screens

They work independently in their own worktrees without conflicts.

### Phase 5: Agents Complete and Push

As each agent finishes:

```bash
# In their respective worktree
git add .
git commit -m "feat: descriptive message"
git push origin <their-branch>
```

Then create a PR for review.

### Phase 6: Merge PRs (Sequential)

Merge PRs one at a time to avoid conflicts:

1. **Merge PR from Agent 2** (feature/meal-logging → feat/google_oauth)
   - Conflicts likely in: `server/src/index.ts`, `server/src/types/api.ts`
   - Resolve by combining changes

2. **Merge PR from Agent 3** (feature/menu-browsing → feat/google_oauth)
   - Conflicts in same files as above
   - Resolve by adding new routes and types

3. **Merge PR from Agent 4** (feature/recommendations → feat/google_oauth)
   - Conflicts in same files
   - Resolve by adding new routes and types

4. **Merge PR from Agent 5** (feature/mobile-screens → feat/google_oauth)
   - Should have no conflicts (different directory)

### Resolving Common Conflicts

**In `server/src/index.ts`:**

All agents add route registrations. Combine them:

```typescript
// After merging all features
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/meals', mealsRoutes);          // From Agent 2
app.use('/api/menus', menusRoutes);          // From Agent 3
app.use('/api/recommendations', recommendationsRoutes); // From Agent 4
app.use('/api/today', todayRoutes);
```

**In `server/src/types/api.ts`:**

All agents add types. Keep all additions:

```typescript
// Combine types from all agents
export interface MealLog { /* Agent 2 */ }
export interface MenuItem { /* Agent 3 */ }
export interface Recommendation { /* Agent 4 */ }
```

---

## Cleanup Instructions

### After All Features Are Merged

Once all feature branches are merged into `feat/google_oauth`:

1. **Delete remote branches:**

```bash
git push origin --delete feature/meal-logging
git push origin --delete feature/menu-browsing
git push origin --delete feature/recommendations
git push origin --delete feature/mobile-screens
```

2. **Remove worktrees:**

```bash
cd C:\Users\ygkar\dev\DC-Menu-Planner

# Remove each worktree
git worktree remove ..\DC-Menu-Planner-meals
git worktree remove ..\DC-Menu-Planner-menus
git worktree remove ..\DC-Menu-Planner-recommendations
git worktree remove ..\DC-Menu-Planner-mobile
```

3. **Verify cleanup:**

```bash
git worktree list
# Should only show main worktree

git branch -a
# Verify feature branches are deleted
```

4. **Delete worktree directories (if not auto-deleted):**

```bash
# In File Explorer or:
rmdir /s C:\Users\ygkar\dev\DC-Menu-Planner-meals
rmdir /s C:\Users\ygkar\dev\DC-Menu-Planner-menus
rmdir /s C:\Users\ygkar\dev\DC-Menu-Planner-recommendations
rmdir /s C:\Users\ygkar\dev\DC-Menu-Planner-mobile
```

### Prune Worktree References

If you had issues with worktrees:

```bash
git worktree prune
```

---

## Troubleshooting

### Problem: "fatal: '<branch>' is already checked out"

**Cause:** You're trying to check out a branch that's already checked out in another worktree.

**Solution:** Use a different branch name, or remove the existing worktree first.

```bash
git worktree list  # Find where it's checked out
git worktree remove <path>
```

---

### Problem: Can't remove worktree (files locked)

**Cause:** Cursor or another process has files open in the worktree.

**Solution:**
1. Close the Cursor window for that worktree
2. Wait a few seconds for file watchers to release
3. Try removing again

```bash
git worktree remove <path> --force  # Force removal if needed
```

---

### Problem: Worktree directory still exists after removal

**Cause:** Git removed the worktree link but not the directory.

**Solution:** Manually delete the directory:

```bash
rmdir /s <worktree-path>
```

---

### Problem: Merge conflicts during sync

**Cause:** Your feature branch and base branch modified the same lines.

**Solution:**
1. Open the conflicted files
2. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Keep both changes if they're different features
4. Commit the resolution:

```bash
git add .
git commit -m "chore: merge feat/google_oauth"
```

---

### Problem: Forgot which branch I'm on

**Solution:** Check current branch in any worktree:

```bash
git branch --show-current
```

Or check all worktrees:

```bash
git worktree list
```

---

### Problem: Need to pull latest changes from base branch

**Solution:** Fetch and merge from any worktree:

```bash
git fetch origin
git merge origin/feat/google_oauth
```

---

### Problem: Agent working on wrong feature

**Cause:** Gave agent wrong instructions or they drifted from task.

**Solution:**
1. Stop the agent immediately
2. Verify which worktree/branch you're in: `git branch --show-current`
3. If wrong worktree: Switch to correct Cursor window
4. If wrong work: `git reset --hard HEAD` to undo changes
5. Re-provide correct instructions

---

### Problem: Want to test integration between features

**Cause:** Features are in separate worktrees.

**Solution:**
1. Merge completed features into base branch first
2. Pull base branch into your test worktree
3. Or create a temporary integration worktree:

```bash
git worktree add ..\DC-Menu-Planner-integration -b integration/test
cd ..\DC-Menu-Planner-integration
git merge feature/meal-logging
git merge feature/menu-browsing
# Test here
```

---

### Problem: Cursor not recognizing workspace

**Cause:** Opened a worktree before it was fully created.

**Solution:**
1. Close Cursor window
2. Verify worktree exists: `git worktree list`
3. Verify directory exists in File Explorer
4. Re-open: **File → Open Folder** → Select worktree directory

---

### Problem: Node modules / dependencies out of sync

**Cause:** Worktrees share `.git` but have separate `node_modules`.

**Solution:** Install dependencies in each worktree:

```bash
# In each worktree
cd C:\Users\ygkar\dev\DC-Menu-Planner-meals
npm install

cd C:\Users\ygkar\dev\DC-Menu-Planner-menus
npm install

# etc.
```

---

## Quick Reference Commands

```bash
# Create a worktree
git worktree add <path> -b <branch-name>

# List all worktrees
git worktree list

# Remove a worktree
git worktree remove <path>

# Remove a worktree (force)
git worktree remove <path> --force

# Prune stale worktree references
git worktree prune

# Check current branch
git branch --show-current

# Sync worktree with base branch
git pull origin <base-branch>
git merge <base-branch>

# Push feature branch
git push origin <feature-branch>

# Delete remote branch after merge
git push origin --delete <feature-branch>
```

---

## Summary

Using git worktrees for multi-agent development provides:

1. **Isolation:** Each agent in separate directory
2. **Safety:** No accidental branch switching
3. **Speed:** Parallel development without conflicts
4. **Clarity:** Physical separation matches logical separation
5. **Flexibility:** Can run multiple servers, tests, builds simultaneously

Follow this guide to efficiently coordinate multiple Cursor AI agents working on different features in parallel!

---

*Last Updated: November 28, 2025*

