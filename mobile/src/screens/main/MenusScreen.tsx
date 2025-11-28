import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { MenuItemWithNutrition } from '../../types';
import { MenuItemCard } from '../../components/MenuItemCard';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../constants/theme';
import { getAvailableMenus, logMeal } from '../../api';

const MenusScreen: React.FC = () => {
  const { availableMenus, setAvailableMenus, setIsLoading, isLoading, userPreferences } = useStore();
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDietaryFilters, setShowDietaryFilters] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });
  const [menuDate, setMenuDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [hallSectionCollapsed, setHallSectionCollapsed] = useState(false);
  const [mealSectionCollapsed, setMealSectionCollapsed] = useState(false);

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      const menus = await getAvailableMenus();
      setAvailableMenus(menus);
      
      console.log('📋 Loaded menus:', menus.length);
      if (menus.length > 0) {
        console.log('🏢 Sample dining halls:', menus.slice(0, 5).map(m => ({
          name: m.name,
          hall: m.dining_hall?.short_name,
          meal: m.meal_type,
        })));
      } else {
        console.warn('⚠️ No menus loaded! Check if backend has menu data.');
      }
      
      // Extract date from first menu item
      if (menus.length > 0 && menus[0].date) {
        setMenuDate(menus[0].date);
      }

      // DON'T auto-select hall or meal - let user choose
      // This was causing confusion
    } catch (error) {
      console.error('❌ Failed to load menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenus();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMenus();
  }, []);

  useEffect(() => {
    console.log('🔍 Filters changed:', {
      selectedHall,
      selectedMeal,
      totalMenus: availableMenus.length,
      filteredMenus: filteredMenus.length,
    });
  }, [selectedHall, selectedMeal, availableMenus]);

  // Get unique halls and meals
  const availableHalls = [...new Set(
    availableMenus
      .map(m => m.dining_hall?.short_name)
      .filter(hall => hall && typeof hall === 'string' && hall.length > 0)
  )];
  const availableMeals = [...new Set(
    availableMenus
      .map(m => m.meal_type)
      .filter(meal => meal && typeof meal === 'string' && meal.length > 0)
  )];

  console.log('🏢 Available halls:', availableHalls);
  console.log('🍽️ Available meals:', availableMeals);
  console.log('📊 Total menus:', availableMenus.length);

  // Filter menus
  const filteredMenus = availableMenus.filter((item) => {
    // Hall filter
    if (selectedHall && item.dining_hall?.short_name !== selectedHall) {
      return false;
    }

    // Meal filter
    if (selectedMeal && item.meal_type !== selectedMeal) {
      return false;
    }

    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Dietary filters
    if (dietaryFilters.vegetarian && !item.is_vegetarian) {
      return false;
    }
    if (dietaryFilters.vegan && !item.is_vegan) {
      return false;
    }
    if (dietaryFilters.glutenFree && item.contains_gluten) {
      return false;
    }
    if (dietaryFilters.dairyFree && item.contains_dairy) {
      return false;
    }

    return true;
  });

  const handleLogMeal = async (item: MenuItemWithNutrition) => {
    try {
      console.log('🍽️ Logging meal:', item.name);
      
      // TODO: In the future, show a modal to let user customize servings and notes
      // For now, log with default 1 serving
      await logMeal({
        menu_item_id: item.id,
        servings: 1,
        eaten_at: new Date().toISOString(),
      });
      
      console.log('✅ Meal logged successfully!');
      alert(`✅ ${item.name} logged!\n\nSwitch to the Today tab to see your updated progress.`);
    } catch (error) {
      console.error('❌ Failed to log meal:', error);
      alert('Failed to log meal. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Date Display */}
        {menuDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>
              📅 {new Date(menuDate + 'T12:00:00').toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showDietaryFilters && styles.filterButtonActive]}
            onPress={() => setShowDietaryFilters(!showDietaryFilters)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Dietary Filters */}
        {showDietaryFilters && (
          <View style={styles.dietaryFiltersSection}>
            <Text style={styles.sectionLabel}>Dietary Preferences</Text>
            <View style={styles.filterChips}>
              <FilterChip
                label="Vegetarian"
                active={dietaryFilters.vegetarian}
                onPress={() =>
                  setDietaryFilters({ ...dietaryFilters, vegetarian: !dietaryFilters.vegetarian })
                }
              />
              <FilterChip
                label="Vegan"
                active={dietaryFilters.vegan}
                onPress={() =>
                  setDietaryFilters({ ...dietaryFilters, vegan: !dietaryFilters.vegan })
                }
              />
              <FilterChip
                label="Gluten Free"
                active={dietaryFilters.glutenFree}
                onPress={() =>
                  setDietaryFilters({ ...dietaryFilters, glutenFree: !dietaryFilters.glutenFree })
                }
              />
              <FilterChip
                label="Dairy Free"
                active={dietaryFilters.dairyFree}
                onPress={() =>
                  setDietaryFilters({ ...dietaryFilters, dairyFree: !dietaryFilters.dairyFree })
                }
              />
            </View>
          </View>
        )}
        
        {/* Dining Hall Selector */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setHallSectionCollapsed(!hallSectionCollapsed)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLabel}>Dining Hall</Text>
            <Text style={styles.collapseIcon}>{hallSectionCollapsed ? '▼' : '▲'}</Text>
          </TouchableOpacity>
          {!hallSectionCollapsed && (
            <>
              {availableHalls.length === 0 && !isLoading ? (
                <View style={styles.noDataHint}>
                  <Text style={styles.noDataText}>
                    No dining halls available. Menu data may not be loaded yet.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hallsScroll}
                >
                  <TouchableOpacity
                    style={[styles.hallChip, selectedHall === null && styles.hallChipActive]}
                    onPress={() => setSelectedHall(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.hallText, selectedHall === null && styles.hallTextActive]}>
                      All Halls
                    </Text>
                  </TouchableOpacity>
                  {availableHalls.map((hall) => {
                    if (!hall || typeof hall !== 'string' || hall.length === 0) return null;
                    return (
                      <TouchableOpacity
                        key={hall}
                        style={[styles.hallChip, selectedHall === hall && styles.hallChipActive]}
                        onPress={() => {
                          console.log('🏢 Selected hall:', hall);
                          setSelectedHall(hall);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.hallText, selectedHall === hall && styles.hallTextActive]}>
                          {hall}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </>
          )}
        </View>

        {/* Meal Type Selector */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setMealSectionCollapsed(!mealSectionCollapsed)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLabel}>Meal</Text>
            <Text style={styles.collapseIcon}>{mealSectionCollapsed ? '▼' : '▲'}</Text>
          </TouchableOpacity>
          {!mealSectionCollapsed && (
            <>
              {availableMeals.length === 0 && !isLoading ? (
                <View style={styles.noDataHint}>
                  <Text style={styles.noDataText}>No meal types available</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mealButtons}
                >
                  <TouchableOpacity
                    style={[styles.mealButton, selectedMeal === null && styles.mealButtonActive]}
                    onPress={() => setSelectedMeal(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.mealText, selectedMeal === null && styles.mealTextActive]}>
                      All Meals
                    </Text>
                  </TouchableOpacity>
                  {availableMeals.map((meal) => {
                    if (!meal || typeof meal !== 'string' || meal.length === 0) return null;
                    const displayMeal = meal.charAt(0).toUpperCase() + meal.slice(1);
                    return (
                      <TouchableOpacity
                        key={meal}
                        style={[styles.mealButton, selectedMeal === meal && styles.mealButtonActive]}
                        onPress={() => setSelectedMeal(meal)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.mealText, selectedMeal === meal && styles.mealTextActive]}>
                          {displayMeal}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </>
          )}
        </View>

        {/* Menu Items */}
        <ScrollView
          style={styles.menuList}
          contentContainerStyle={styles.menuListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredMenus.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No results found' : 'No menu available'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Check back later or select a different dining hall'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultsCount}>
                {filteredMenus.length} item{filteredMenus.length !== 1 ? 's' : ''} found
              </Text>
              {filteredMenus.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onLog={() => handleLogMeal(item)}
                  showDiningHall={selectedHall === null}
                />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, active && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
  },
  dateHeader: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  dateText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  searchSection: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text,
    paddingVertical: spacing.lg,
  },
  clearIcon: {
    fontSize: 32,
    color: colors.textLight,
    fontWeight: '300',
  },
  filterButton: {
    width: 56,
    height: 56,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterIcon: {
    fontSize: 24,
  },
  dietaryFiltersSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterChipText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  collapseIcon: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  hallsScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  hallChip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  hallChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hallText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  hallTextActive: {
    color: colors.white,
  },
  mealButtons: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  mealButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  mealButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  mealText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  mealTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  menuList: {
    flex: 1,
  },
  menuListContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 72,
  },
  emptyTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resultsCount: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  noDataHint: {
    padding: spacing.lg,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MenusScreen;

