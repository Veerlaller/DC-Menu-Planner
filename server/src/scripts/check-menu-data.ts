/**
 * Diagnostic script to check what menu data exists in Supabase
 * Run with: npx tsx src/scripts/check-menu-data.ts
 */

import { supabase } from '../lib/supabase.js';

async function checkMenuData() {
  console.log('🔍 Checking Supabase menu data...\n');

  try {
    // 1. Check dining halls
    console.log('1️⃣ DINING HALLS:');
    const { data: halls, error: hallsError } = await supabase
      .from('dining_halls')
      .select('*')
      .order('name');

    if (hallsError) {
      console.error('❌ Error fetching dining halls:', hallsError);
    } else if (!halls || halls.length === 0) {
      console.log('⚠️  No dining halls found in database!');
    } else {
      console.log(`✅ Found ${halls.length} dining halls:`);
      halls.forEach(hall => {
        console.log(`   - ${hall.name} (${hall.short_name}) [${hall.is_active ? 'Active' : 'Inactive'}]`);
      });
    }

    // 2. Check menu_days and available dates
    console.log('\n2️⃣ MENU DAYS:');
    const { data: menuDays, error: daysError } = await supabase
      .from('menu_days')
      .select('id, date, meal_type, dining_hall_id, dining_halls(short_name)')
      .order('date', { ascending: false })
      .limit(20);

    if (daysError) {
      console.error('❌ Error fetching menu days:', daysError);
    } else if (!menuDays || menuDays.length === 0) {
      console.log('⚠️  No menu days found in database!');
    } else {
      console.log(`✅ Found ${menuDays.length} recent menu days (showing last 20):`);
      
      // Group by date
      const dateGroups = menuDays.reduce((acc: any, day: any) => {
        if (!acc[day.date]) acc[day.date] = [];
        acc[day.date].push(day);
        return acc;
      }, {});

      Object.entries(dateGroups).forEach(([date, days]: [string, any]) => {
        console.log(`   📅 ${date}:`);
        days.forEach((day: any) => {
          const hall = day.dining_halls?.short_name || 'Unknown';
          console.log(`      - ${hall}: ${day.meal_type}`);
        });
      });

      // Get all unique dates
      const uniqueDates = [...new Set(menuDays.map((d: any) => d.date))];
      console.log(`\n   📆 Unique dates with data: ${uniqueDates.join(', ')}`);
    }

    // 3. Check menu items
    console.log('\n3️⃣ MENU ITEMS:');
    const { count: itemCount, error: countError } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting menu items:', countError);
    } else {
      console.log(`✅ Total menu items in database: ${itemCount || 0}`);
    }

    // 4. Get sample menu items with full details for the most recent date
    if (menuDays && menuDays.length > 0) {
      const mostRecentDate = menuDays[0].date;
      console.log(`\n4️⃣ SAMPLE MENU ITEMS FOR ${mostRecentDate}:`);

      const { data: sampleItems, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          station,
          is_vegetarian,
          is_vegan,
          menu_days!inner (
            date,
            meal_type,
            dining_halls (
              short_name
            )
          )
        `)
        .eq('menu_days.date', mostRecentDate)
        .limit(10);

      if (itemsError) {
        console.error('❌ Error fetching sample items:', itemsError);
      } else if (!sampleItems || sampleItems.length === 0) {
        console.log(`⚠️  No menu items found for ${mostRecentDate}`);
      } else {
        console.log(`✅ Showing ${Math.min(10, sampleItems.length)} sample items:`);
        sampleItems.forEach((item: any) => {
          const menuDay = Array.isArray(item.menu_days) ? item.menu_days[0] : item.menu_days;
          const hall = menuDay?.dining_halls?.short_name || 'Unknown';
          const meal = menuDay?.meal_type || 'Unknown';
          const tags = [];
          if (item.is_vegan) tags.push('🌱');
          if (item.is_vegetarian && !item.is_vegan) tags.push('🥬');
          
          console.log(`   - ${item.name} ${tags.join(' ')}`);
          console.log(`     ${hall} | ${meal} | Station: ${item.station || 'N/A'}`);
        });
      }
    }

    // 5. Check nutrition_facts
    console.log('\n5️⃣ NUTRITION FACTS:');
    const { count: nutritionCount, error: nutritionError } = await supabase
      .from('nutrition_facts')
      .select('*', { count: 'exact', head: true });

    if (nutritionError) {
      console.error('❌ Error counting nutrition facts:', nutritionError);
    } else {
      console.log(`✅ Total nutrition facts entries: ${nutritionCount || 0}`);
    }

    // 6. Test the /api/menus/available endpoint structure
    if (menuDays && menuDays.length > 0) {
      const testDate = menuDays[0].date;
      console.log(`\n6️⃣ TESTING API QUERY STRUCTURE FOR ${testDate}:`);

      const { data: apiTestData, error: apiError } = await supabase
        .from('menu_items')
        .select(`
          id,
          menu_day_id,
          name,
          station,
          is_vegetarian,
          is_vegan,
          contains_gluten,
          contains_dairy,
          contains_nuts,
          allergen_info,
          menu_days!inner (
            id,
            meal_type,
            date,
            dining_halls!inner (
              id,
              name,
              short_name
            )
          ),
          nutrition_facts (
            calories,
            protein_g,
            carbs_g,
            fat_g
          )
        `)
        .eq('menu_days.date', testDate)
        .limit(3);

      if (apiError) {
        console.error('❌ Error testing API query:', apiError);
      } else if (!apiTestData || apiTestData.length === 0) {
        console.log(`⚠️  No items returned with full join for ${testDate}`);
      } else {
        console.log(`✅ API query structure works! Showing ${apiTestData.length} sample items:`);
        apiTestData.forEach((item: any) => {
          const menuDay = Array.isArray(item.menu_days) ? item.menu_days[0] : item.menu_days;
          const hall = menuDay?.dining_halls?.short_name || 'Missing!';
          const nutrition = Array.isArray(item.nutrition_facts) ? item.nutrition_facts[0] : item.nutrition_facts;
          
          console.log(`\n   📋 ${item.name}`);
          console.log(`      Hall: ${hall}`);
          console.log(`      Meal: ${menuDay?.meal_type || 'Missing!'}`);
          console.log(`      Station: ${item.station || 'N/A'}`);
          console.log(`      Nutrition: ${nutrition ? `${nutrition.calories} cal, ${nutrition.protein_g}g protein` : 'Missing!'}`);
        });
      }
    }

    console.log('\n✅ Diagnostic complete!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    throw error;
  }
}

// Run the diagnostic
checkMenuData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

