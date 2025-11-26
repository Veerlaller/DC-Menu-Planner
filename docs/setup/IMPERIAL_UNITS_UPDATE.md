# ✅ Imperial Units Update Complete

**Date**: November 26, 2025  
**Status**: ✅ **All units converted to Imperial**

---

## 🎯 What Changed

### Before (Metric):
- Height: **cm** (centimeters)
- Weight: **kg** (kilograms)

### After (Imperial):
- Height: **inches** (converts to feet/inches for display)
- Weight: **lbs** (pounds)

---

## 📱 Frontend Changes

### 1. TypeScript Types (`mobile/src/types/index.ts`)

```typescript
// Before
interface UserProfile {
  height_cm: number;
  weight_kg: number;
  // ...
}

// After
interface UserProfile {
  height_inches: number; // e.g., 70 = 5'10"
  weight_lbs: number;    // e.g., 154
  // ...
}
```

### 2. Onboarding Form (`BasicInfoScreen.tsx`)

**Input Fields**:
- Height: "Height (inches)" - placeholder: "70" 
- Weight: "Weight (lbs)" - placeholder: "154"
- Added helper text: "Example: 5'10" = 70 inches"

### 3. BMR Calculation (`CompleteScreen.tsx`)

**Updated to convert imperial → metric for formula**:
```typescript
// Convert to metric for BMR calculation
const height_cm = height_inches * 2.54;
const weight_kg = weight_lbs * 0.453592;

// Then use Mifflin-St Jeor (requires metric)
bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + (sex === 'male' ? 5 : -161);
```

**Protein calculation**:
```typescript
// Before: 2g per kg
const targetProtein = weight_kg * 2.0;

// After: 0.9g per lb (equivalent)
const targetProtein = weight_lbs * 0.9;
```

### 4. Profile Display (`ProfileScreen.tsx`)

**Height display converts to feet/inches**:
```typescript
// Shows as: 5'10" instead of 70 inches
value={`${Math.floor(height_inches / 12)}'${height_inches % 12}"`}

// Weight shows as: 154 lbs
value={`${weight_lbs} lbs`}
```

---

## 🔧 Backend Changes

### 1. Database Schema (`server/db/schema.sql`)

```sql
-- Before
CREATE TABLE user_profiles (
  height_cm NUMERIC(5,2) CHECK (height_cm > 0),
  weight_kg NUMERIC(5,2) CHECK (weight_kg > 0),
  -- ...
);

-- After
CREATE TABLE user_profiles (
  height_inches NUMERIC(5,2) CHECK (height_inches > 0),
  weight_lbs NUMERIC(6,2) CHECK (weight_lbs > 0),
  -- ...
);
```

### 2. API Types (`server/src/types/api.ts`)

```typescript
// Before
interface OnboardingRequest {
  height_cm: number;
  weight_kg: number;
  // ...
}

// After
interface OnboardingRequest {
  height_inches: number;
  weight_lbs: number;
  // ...
}
```

### 3. Validation (`server/src/routes/onboarding.ts`)

```typescript
// Before
if (!body.height_cm || !body.weight_kg) { ... }
if (body.height_cm <= 0 || body.weight_kg <= 0) { ... }

// After
if (!body.height_inches || !body.weight_lbs) { ... }
if (body.height_inches <= 0 || body.weight_lbs <= 0) { ... }
```

---

## 📊 Example Data

### Input Example:
```
Height: 70 inches (5'10")
Weight: 154 lbs
Age: 20
Sex: Male
Goal: Cut
Activity: Moderate
```

### Calculated Targets:
```
Calories: ~2,100 kcal
Protein: ~140g (154 lbs × 0.9)
Carbs: ~255g
Fat: ~58g
```

### Saved to Database:
```json
{
  "height_inches": 70,
  "weight_lbs": 154,
  "age": 20,
  "sex": "male",
  "goal": "cut",
  "target_calories": 2100,
  "target_protein_g": 140
}
```

### Displayed in Profile:
```
Height: 5'10"
Weight: 154 lbs
Age: 20 years
Sex: Male
```

---

## 🔄 Conversion Reference

### Height:
- **Inches to Feet/Inches**: 
  - Feet: `Math.floor(inches / 12)`
  - Remaining Inches: `inches % 12`
  - Example: 70" = 5'10"

- **Inches to CM** (for calculations):
  - CM: `inches * 2.54`
  - Example: 70" = 177.8 cm

### Weight:
- **Pounds to KG** (for calculations):
  - KG: `lbs * 0.453592`
  - Example: 154 lbs = 69.85 kg

---

## 🧪 Testing

### Test the Conversion:

1. **Open app**: http://localhost:19006
2. **Start onboarding**
3. **Enter**:
   - Height: 70 (inches)
   - Weight: 154 (lbs)
   - Age: 20
   - Sex: Male
4. **Complete onboarding**
5. **Check Profile screen**: Should show "5'10"" and "154 lbs"
6. **Check database**: Should store `height_inches: 70`, `weight_lbs: 154`

---

## 🎯 Benefits

### For Users:
- ✅ Familiar units (US/Imperial)
- ✅ No mental conversion needed
- ✅ Feet/inches display is intuitive
- ✅ Pounds instead of kilograms

### For Developers:
- ✅ Consistent units throughout app
- ✅ Accurate BMR calculations (converts internally)
- ✅ Type-safe conversions
- ✅ Clear variable names

---

## 📝 Common Heights/Weights

| Height (ft/in) | Inches | Example Weight (lbs) |
|----------------|--------|---------------------|
| 5'0" | 60 | 120-140 |
| 5'3" | 63 | 125-145 |
| 5'6" | 66 | 135-160 |
| 5'9" | 69 | 145-175 |
| 6'0" | 72 | 160-190 |
| 6'3" | 75 | 175-210 |

---

## 🚨 Important Notes

### BMR Calculation:
The Mifflin-St Jeor equation requires **metric units**. We convert behind the scenes:
```typescript
// User enters: 70 inches, 154 lbs
// We convert to: 177.8 cm, 69.85 kg
// Calculate BMR with metric
// Return targets in standard units (g, kcal)
```

### Database Migration:
If you have existing data in metric:
```sql
-- Convert existing data (if needed)
UPDATE user_profiles SET
  height_inches = height_cm / 2.54,
  weight_lbs = weight_kg / 0.453592;

-- Then drop old columns
ALTER TABLE user_profiles 
  DROP COLUMN height_cm,
  DROP COLUMN weight_kg;
```

---

## ✅ Files Updated

### Mobile App (8 files):
- ✅ `mobile/src/types/index.ts` - Type definitions
- ✅ `mobile/src/screens/onboarding/BasicInfoScreen.tsx` - Input form
- ✅ `mobile/src/screens/onboarding/CompleteScreen.tsx` - Calculations
- ✅ `mobile/src/screens/main/ProfileScreen.tsx` - Display

### Backend (3 files):
- ✅ `server/db/schema.sql` - Database schema
- ✅ `server/src/types/api.ts` - API types
- ✅ `server/src/routes/onboarding.ts` - Validation

---

## 🎉 Result

Your app now uses **100% imperial units**!

Users can:
- ✅ Enter height in inches
- ✅ See height as feet/inches (5'10")
- ✅ Enter weight in pounds
- ✅ See weight in pounds
- ✅ Get accurate macro calculations

All conversions happen automatically behind the scenes! 🚀

---

**Status**: ✅ **COMPLETE - All Imperial!**

