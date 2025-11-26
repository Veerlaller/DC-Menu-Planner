/**
 * Types for UC Davis Dining Hall Menu Scraper
 */

export interface MenuItem {
  id: string;
  name: string;
  hall: DiningHall;
  station: string;
  meal: MealPeriod;
  date: string;
  description?: string;
  allergens: string[];
  dietaryFlags: string[]; // vegetarian, vegan, halal, etc.
}

export interface NutritionInfo {
  menuItemName: string;
  servingSize?: string;
  calories?: number;
  protein?: number;      // grams
  carbs?: number;        // grams
  fat?: number;          // grams
  fiber?: number;        // grams
  sugar?: number;        // grams
  sodium?: number;       // mg
  cholesterol?: number;  // mg
}

export interface MenuItemWithNutrition extends MenuItem {
  nutrition?: NutritionInfo;
}

export enum DiningHall {
  LATITUDE = 'Latitude',
  CUARTO = 'Cuarto',
  SEGUNDO = 'Segundo',
  TERCERO = 'Tercero'
}

export enum MealPeriod {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  LATE_NIGHT = 'Late Night'
}

export interface ScraperResult {
  success: boolean;
  menuItems: MenuItemWithNutrition[];
  scrapedAt: string;
  errors?: string[];
}

