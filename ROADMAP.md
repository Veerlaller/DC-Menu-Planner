# DC Menu Planner - Development Roadmap

## 🎯 Project Vision

A mobile app that helps UC Davis students make healthy dining choices by:
- Tracking daily macro intake (protein, carbs, fat)
- Recommending meals from dining halls based on nutritional goals
- Logging consumed meals automatically
- Providing real-time "I'm hungry now" suggestions

## 📋 Development Phases

### Phase 1: Foundation (✅ COMPLETE)

**Scraper Infrastructure**
- [x] TypeScript project setup
- [x] Data models and types
- [x] CLI scraper tool
- [x] Mock data generation
- [x] JSON export functionality

**Deliverables:**
- Working scraper that generates structured menu data
- Documentation for next steps
- Foundation for backend integration

### Phase 2: Real Data Collection (2-3 days)

**Tasks:**
- [ ] Install and configure Puppeteer
- [ ] Implement browser automation for UC Davis menus
- [ ] Parse JavaScript-rendered menu content
- [ ] Extract nutrition information
- [ ] Match menu items with nutrition data
- [ ] Set up error handling and retries

**Alternative:**
- [ ] Research UC Davis API endpoints
- [ ] Contact UC Davis IT for official API access
- [ ] Implement direct API integration

**Goal:** Replace mock data with real, daily updated menus

### Phase 3: Backend API (3-4 days)

**Supabase Setup**
- [ ] Create Supabase project
- [ ] Design database schema:
  - Users table (id, email, metrics, goals, preferences)
  - MenuItems table (from scraper data)
  - MealLogs table (user_id, menu_item_id, date, meal_period)
  - DailyPlans table (user_id, date, recommended_items)
- [ ] Set up authentication (email/password)
- [ ] Enable Row Level Security (RLS) policies

**API Endpoints**
- [ ] POST /api/onboarding - Save user metrics and goals
- [ ] GET /api/menu/:date - Get day's menu across all halls
- [ ] GET /api/menu/:hall/:date - Get specific hall menu
- [ ] POST /api/meal-log - Log consumed meal
- [ ] GET /api/daily-plan - Get personalized meal recommendations
- [ ] GET /api/progress/:date - Get user's macro consumption
- [ ] GET /api/hungry-now - Real-time meal recommendations

**Scraper Integration**
- [ ] Deploy scraper as scheduled job (cron/GitHub Actions)
- [ ] Store scraped data in Supabase
- [ ] Handle duplicates and updates
- [ ] Add data validation

### Phase 4: Mobile App - Core Features (5-7 days)

**Setup**
- [ ] Create Expo app with TypeScript template
- [ ] Set up navigation (React Navigation)
- [ ] Configure environment variables
- [ ] Connect to Supabase

**Onboarding Flow**
- [ ] Welcome screen with app benefits
- [ ] Basic info (name, age, gender)
- [ ] Physical metrics (height, weight)
- [ ] Activity level selection
- [ ] Goal selection (maintain, lose, gain weight)
- [ ] Macro target calculation (using Mifflin-St Jeor equation)
- [ ] Dietary preferences (allergies, vegetarian, etc.)
- [ ] Favorite dining halls

**Today/Home Screen**
- [ ] Display user's macro targets
- [ ] Show consumed macros (progress bars)
- [ ] List recommended meals for today
- [ ] Quick "I'm Hungry Now" button
- [ ] Meal logging interface
- [ ] Visual macro breakdown (pie/bar charts)

**Menu Browser**
- [ ] Filter by dining hall
- [ ] Filter by meal period
- [ ] Search menu items
- [ ] View nutrition details
- [ ] Sort by protein/calories/etc
- [ ] Mark items as favorites

**Meal Logger**
- [ ] Browse available meals
- [ ] Add meal with single tap
- [ ] Undo recent logs
- [ ] Adjust portions (0.5x, 1x, 2x)
- [ ] See updated macro totals

**"I'm Hungry Now" Feature**
- [ ] Calculate remaining macros
- [ ] Find currently open dining halls
- [ ] Recommend optimal meal based on goals
- [ ] Show hall location and hours
- [ ] Alternative recommendations

### Phase 5: Enhanced Features (3-5 days)

**Smart Recommendations**
- [ ] Machine learning for preference prediction
- [ ] Time-based recommendations (breakfast at 8am, etc.)
- [ ] Weather-based suggestions (soup on cold days)
- [ ] Meal variety tracking (don't recommend same item daily)
- [ ] Nutritional balance scoring

**Social Features**
- [ ] Share meal plans with friends
- [ ] See what friends are eating
- [ ] Group meal planning ("Let's meet at Tercero!")
- [ ] Meal ratings and reviews
- [ ] Popular items dashboard

**Insights & Analytics**
- [ ] Weekly macro trends
- [ ] Most eaten items
- [ ] Favorite stations/halls
- [ ] Goal achievement rate
- [ ] Nutrition score over time
- [ ] Export data to CSV

**UX Improvements**
- [ ] Dark mode support
- [ ] Haptic feedback
- [ ] Animations and transitions
- [ ] Offline mode (cached menus)
- [ ] Push notifications (meal reminders)
- [ ] Widget support (iOS/Android)

### Phase 6: Testing & Polish (2-3 days)

**Testing**
- [ ] Unit tests for calculators
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Test on physical devices
- [ ] Beta testing with UC Davis students

**Performance**
- [ ] Optimize image loading
- [ ] Implement proper caching
- [ ] Reduce API calls
- [ ] Monitor crash analytics
- [ ] Fix memory leaks

**Polish**
- [ ] Consistent design system
- [ ] Accessibility improvements (screen readers, etc.)
- [ ] Error message improvements
- [ ] Loading states
- [ ] Empty states
- [ ] Onboarding tooltips

### Phase 7: Launch (1-2 days)

**App Store Preparation**
- [ ] Create app icon and screenshots
- [ ] Write app store descriptions
- [ ] Set up app store accounts
- [ ] Create privacy policy
- [ ] Set up analytics (Mixpanel/Amplitude)
- [ ] Prepare marketing materials

**Deployment**
- [ ] Build production iOS app
- [ ] Build production Android app
- [ ] Submit to App Store
- [ ] Submit to Google Play
- [ ] Set up backend monitoring
- [ ] Create feedback channels

**Launch**
- [ ] Soft launch to small group
- [ ] Gather initial feedback
- [ ] Fix critical bugs
- [ ] Public launch
- [ ] Share on UC Davis subreddit/social media

## 🛠️ Tech Stack

**Mobile App:**
- Expo (React Native)
- TypeScript
- React Navigation
- Zustand (state management)
- React Hook Form (forms)
- Victory Charts (data visualization)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Node.js scraper with Puppeteer
- GitHub Actions (scheduled scraping)

**Development Tools:**
- VS Code with Cursor
- EAS (Expo Application Services) for builds
- Jest for testing
- ESLint + Prettier

## 📊 Macro Calculation Logic

### Calculate BMR (Basal Metabolic Rate)
**Mifflin-St Jeor Equation:**
- Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
- Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

### Calculate TDEE (Total Daily Energy Expenditure)
BMR × Activity Factor:
- Sedentary (little/no exercise): BMR × 1.2
- Lightly active (1-3 days/week): BMR × 1.375
- Moderately active (3-5 days/week): BMR × 1.55
- Very active (6-7 days/week): BMR × 1.725

### Adjust for Goals
- Maintain weight: TDEE
- Lose weight: TDEE - 500 calories (1 lb/week loss)
- Gain weight: TDEE + 500 calories (1 lb/week gain)

### Macro Split
**Balanced (default):**
- Protein: 30% (4 cal/gram)
- Carbs: 40% (4 cal/gram)
- Fat: 30% (9 cal/gram)

**High Protein:**
- Protein: 40%
- Carbs: 30%
- Fat: 30%

**Low Carb:**
- Protein: 35%
- Carbs: 20%
- Fat: 45%

## 🎯 Success Metrics

**User Engagement:**
- Daily active users (DAU)
- Meals logged per day per user
- Session duration
- Retention rate (Day 1, Day 7, Day 30)

**Feature Adoption:**
- Onboarding completion rate
- "I'm Hungry Now" usage
- Menu browsing behavior
- Favorite items saved

**Business Goals:**
- 100 users in first month
- 50% week-1 retention
- 4+ meals logged per active user per day
- 4.5+ star rating

## 💡 Future Ideas

- Integration with fitness trackers (Apple Health, Google Fit)
- Meal prep suggestions based on dorm kitchen availability
- Budget tracking (dining dollars/meal plan)
- Nutrition education content
- Recipe suggestions using dining hall ingredients
- Community challenges (protein challenge, vegetarian week)
- Integration with class schedules ("Quick lunch before 2pm class")
- Restaurant recommendations off-campus
- Grocery list generator for apartment students

## 📞 Getting Help

- UC Davis Dining Services: dining@ucdavis.edu
- UC Davis IT: ithelp@ucdavis.edu
- Expo Documentation: https://docs.expo.dev/
- Supabase Docs: https://supabase.com/docs
- React Native Docs: https://reactnative.dev/

## 🚀 Quick Commands

```bash
# Scraper
npm run scrape                    # Run scraper
npm run build                     # Build TypeScript

# Mobile App (after Phase 4)
cd mobile/
npx expo start                    # Start development server
npx expo start --ios              # Run on iOS simulator
npx expo start --android          # Run on Android emulator
eas build --platform ios          # Build for App Store
eas build --platform android      # Build for Google Play

# Backend (after Phase 3)
cd server/
npm run dev                       # Start local server
npm run deploy                    # Deploy to production
```

## 📅 Estimated Timeline

- **Phase 1:** ✅ Complete (2 days)
- **Phase 2-3:** 1 week (real scraping + backend)
- **Phase 4:** 1 week (core mobile app)
- **Phase 5:** 1 week (enhanced features)
- **Phase 6:** 3 days (testing)
- **Phase 7:** 2 days (launch)

**Total: ~3-4 weeks of full-time development**

---

*Last Updated: November 26, 2025*

