import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../constants/theme';

const ProfileScreen: React.FC = () => {
  const { userProfile, userPreferences, reset } = useStore();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            reset();
          },
        },
      ]
    );
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No profile data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.sex === 'male' ? '👨' : userProfile.sex === 'female' ? '👩' : '👤'}
            </Text>
          </View>
          <Text style={styles.greeting}>Your Profile</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Info</Text>
          <View style={styles.statsGrid}>
            <StatItem 
              label="Height" 
              value={`${Math.floor(userProfile.height_inches / 12)}'${userProfile.height_inches % 12}"`} 
            />
            <StatItem label="Weight" value={`${userProfile.weight_lbs} lbs`} />
            <StatItem label="Age" value={`${userProfile.age} years`} />
            <StatItem
              label="Sex"
              value={userProfile.sex.charAt(0).toUpperCase() + userProfile.sex.slice(1)}
            />
          </View>
        </View>

        {/* Goals Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goals & Activity</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Goal:</Text>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>
                {userProfile.goal === 'cut' ? '📉 Cut' : 
                 userProfile.goal === 'bulk' ? '💪 Bulk' : 
                 '⚖️ Maintain'}
              </Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Activity:</Text>
            <Text style={styles.goalValue}>
              {userProfile.activity_level.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
        </View>

        {/* Macro Targets Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Targets</Text>
          <View style={styles.macrosList}>
            <MacroRow
              label="Calories"
              value={userProfile.target_calories || 0}
              unit="kcal"
              color={colors.calories}
            />
            <MacroRow
              label="Protein"
              value={userProfile.target_protein_g || 0}
              unit="g"
              color={colors.protein}
            />
            <MacroRow
              label="Carbs"
              value={userProfile.target_carbs_g || 0}
              unit="g"
              color={colors.carbs}
            />
            <MacroRow
              label="Fat"
              value={userProfile.target_fat_g || 0}
              unit="g"
              color={colors.fat}
            />
          </View>
        </View>

        {/* Dietary Preferences Card */}
        {userPreferences && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dietary Preferences</Text>
            <View style={styles.preferencesList}>
              {userPreferences.is_vegetarian && <PreferencePill text="🥗 Vegetarian" />}
              {userPreferences.is_vegan && <PreferencePill text="🌱 Vegan" />}
              {userPreferences.is_pescatarian && <PreferencePill text="🐟 Pescatarian" />}
              {userPreferences.is_gluten_free && <PreferencePill text="🌾 Gluten-Free" />}
              {userPreferences.is_dairy_free && <PreferencePill text="🥛 Dairy-Free" />}
              {userPreferences.is_halal && <PreferencePill text="☪️ Halal" />}
              {userPreferences.is_kosher && <PreferencePill text="✡️ Kosher" />}
              {userPreferences.is_hindu_non_veg && <PreferencePill text="🕉️ Hindu Non-Veg" />}
              
              {!userPreferences.is_vegetarian &&
                !userPreferences.is_vegan &&
                !userPreferences.is_pescatarian &&
                !userPreferences.is_gluten_free &&
                !userPreferences.is_dairy_free &&
                !userPreferences.is_halal &&
                !userPreferences.is_kosher &&
                !userPreferences.is_hindu_non_veg && (
                  <Text style={styles.noPreferences}>No restrictions</Text>
                )}
            </View>

            {userPreferences.allergies && userPreferences.allergies.length > 0 && (
              <View style={styles.allergySection}>
                <Text style={styles.allergyLabel}>Allergies:</Text>
                <Text style={styles.allergyText}>
                  {userPreferences.allergies.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* User Account Info */}
        {user && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Update Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DC Menu Planner v1.0.0</Text>
          <Text style={styles.footerText}>Made for UC Davis Students</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const MacroRow: React.FC<{ label: string; value: number; unit: string; color: string }> = ({
  label,
  value,
  unit,
  color,
}) => (
  <View style={styles.macroRow}>
    <View style={styles.macroLabel}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroLabelText}>{label}</Text>
    </View>
    <Text style={styles.macroValue}>
      {value} {unit}
    </Text>
  </View>
);

const PreferencePill: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.preferencePill}>
    <Text style={styles.preferencePillText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 56,
  },
  greeting: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  goalLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goalValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  goalBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.full,
  },
  goalBadgeText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  macrosList: {
    gap: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  macroLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  macroLabelText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  preferencesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  preferencePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.secondary + '20',
    borderRadius: borderRadius.full,
  },
  preferencePillText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  noPreferences: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  allergySection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  allergyLabel: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  allergyText: {
    fontSize: fontSize.lg,
    color: colors.error,
    fontWeight: '600',
  },
  accountInfo: {
    gap: spacing.sm,
  },
  accountLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  accountValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  actionsSection: {
    gap: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadow.sm,
  },
  actionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  dangerButton: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  dangerButtonText: {
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;

