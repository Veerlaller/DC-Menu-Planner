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
          <View style={styles.quickSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{userProfile.target_calories}</Text>
              <Text style={styles.summaryLabel}>cal/day</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{userProfile.target_protein_g}g</Text>
              <Text style={styles.summaryLabel}>protein</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {userProfile.goal === 'cut' ? '📉' : userProfile.goal === 'bulk' ? '💪' : '⚖️'}
              </Text>
              <Text style={styles.summaryLabel}>goal</Text>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📋 Personal Info</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatItem 
              icon="📏"
              label="Height" 
              value={`${Math.floor(userProfile.height_inches / 12)}'${userProfile.height_inches % 12}"`} 
            />
            <StatItem 
              icon="⚖️"
              label="Weight" 
              value={`${userProfile.weight_lbs} lbs`} 
            />
            <StatItem 
              icon="🎂"
              label="Age" 
              value={`${userProfile.age} years`} 
            />
            <StatItem
              icon={userProfile.sex === 'male' ? '👨' : '👩'}
              label="Sex"
              value={userProfile.sex.charAt(0).toUpperCase() + userProfile.sex.slice(1)}
            />
          </View>
        </View>

        {/* Goals Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎯 Goals & Activity</Text>
          </View>
          <View style={styles.goalContainer}>
            <View style={styles.goalBadgeLarge}>
              <Text style={styles.goalIconLarge}>
                {userProfile.goal === 'cut' ? '📉' : 
                 userProfile.goal === 'bulk' ? '💪' : 
                 '⚖️'}
              </Text>
              <Text style={styles.goalBadgeTextLarge}>
                {userProfile.goal === 'cut' ? 'Cutting' : 
                 userProfile.goal === 'bulk' ? 'Bulking' : 
                 'Maintaining'}
              </Text>
              <Text style={styles.goalDescription}>
                {userProfile.goal === 'cut' ? 'Losing weight & preserving muscle' : 
                 userProfile.goal === 'bulk' ? 'Building muscle & gaining strength' : 
                 'Maintaining current physique'}
              </Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityIcon}>🏃</Text>
              <View>
                <Text style={styles.activityLabel}>Activity Level</Text>
                <Text style={styles.activityValue}>
                  {userProfile.activity_level.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Macro Targets Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎯 Daily Targets</Text>
            <Text style={styles.cardSubtitle}>Your personalized nutrition goals</Text>
          </View>
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
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🥗 Dietary Preferences</Text>
            </View>
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
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>👤 Account</Text>
            </View>
            <View style={styles.accountInfoRow}>
              <Text style={styles.accountIcon}>📧</Text>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Email Address</Text>
                <Text style={styles.accountValue}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>✏️</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonText}>Edit Profile</Text>
                <Text style={styles.actionButtonSubtext}>Update your personal information</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🍽️</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonText}>Dietary Preferences</Text>
                <Text style={styles.actionButtonSubtext}>Manage restrictions & allergies</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🚪</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                  Sign Out
                </Text>
                <Text style={[styles.actionButtonSubtext, styles.dangerButtonText]}>
                  Log out of your account
                </Text>
              </View>
            </View>
            <Text style={[styles.chevron, styles.dangerButtonText]}>›</Text>
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

const StatItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statIcon}>{icon}</Text>
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
    gap: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  avatarText: {
    fontSize: 56,
  },
  greeting: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  quickSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadow.sm,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.md,
  },
  cardHeader: {
    gap: spacing.xs / 2,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    gap: spacing.xs / 2,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  goalContainer: {
    gap: spacing.lg,
  },
  goalBadgeLarge: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  goalIconLarge: {
    fontSize: 48,
  },
  goalBadgeTextLarge: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  goalDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  activityIcon: {
    fontSize: 32,
  },
  activityLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  activityValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
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
  accountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
  },
  accountIcon: {
    fontSize: 32,
  },
  accountInfo: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  accountLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  accountValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  actionsSection: {
    gap: spacing.lg,
  },
  actionsSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  actionButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadow.sm,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  actionButtonIcon: {
    fontSize: 28,
  },
  actionButtonTextContainer: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  actionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  actionButtonSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 32,
    color: colors.textLight,
    fontWeight: '300',
  },
  dangerButton: {
    borderColor: colors.error + '50',
    backgroundColor: colors.error + '08',
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

