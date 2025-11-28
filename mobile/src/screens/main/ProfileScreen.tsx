import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const ProfileScreen: React.FC = () => {
  const { userProfile, userPreferences, reset, setUserProfile } = useStore();
  const { user, signOut } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    weight_lbs: userProfile?.weight_lbs.toString() || '',
    height_inches: userProfile?.height_inches.toString() || '',
    age: userProfile?.age.toString() || '',
  });
  const [preferencesForm, setPreferencesForm] = useState({
    is_vegetarian: userPreferences?.is_vegetarian || false,
    is_vegan: userPreferences?.is_vegan || false,
    is_pescatarian: userPreferences?.is_pescatarian || false,
    is_gluten_free: userPreferences?.is_gluten_free || false,
    is_dairy_free: userPreferences?.is_dairy_free || false,
    is_halal: userPreferences?.is_halal || false,
    is_kosher: userPreferences?.is_kosher || false,
    is_hindu_non_veg: userPreferences?.is_hindu_non_veg || false,
    allergies: userPreferences?.allergies?.join(', ') || '',
  });

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

  const handleEditProfile = () => {
    if (userProfile) {
      setEditForm({
        weight_lbs: userProfile.weight_lbs.toString(),
        height_inches: userProfile.height_inches.toString(),
        age: userProfile.age.toString(),
      });
      setShowEditModal(true);
    }
  };

  const handleEditPreferences = () => {
    if (userPreferences) {
      setPreferencesForm({
        is_vegetarian: userPreferences.is_vegetarian,
        is_vegan: userPreferences.is_vegan,
        is_pescatarian: userPreferences.is_pescatarian,
        is_gluten_free: userPreferences.is_gluten_free,
        is_dairy_free: userPreferences.is_dairy_free,
        is_halal: userPreferences.is_halal,
        is_kosher: userPreferences.is_kosher,
        is_hindu_non_veg: userPreferences.is_hindu_non_veg,
        allergies: userPreferences.allergies?.join(', ') || '',
      });
      setShowPreferencesModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return;

    try {
      setIsUpdating(true);

      const weight = parseFloat(editForm.weight_lbs);
      const height = parseFloat(editForm.height_inches);
      const age = parseInt(editForm.age);

      if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        Alert.alert('Error', 'Please enter valid numbers for all fields');
        return;
      }

      // Update profile in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          weight_lbs: weight,
          height_inches: height,
          age: age,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setUserProfile({
        ...userProfile,
        weight_lbs: weight,
        height_inches: height,
        age: age,
      });

      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user || !userPreferences) return;

    try {
      setIsUpdating(true);

      // Parse allergies from comma-separated string
      const allergiesArray = preferencesForm.allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      // Update preferences in database
      const { error } = await supabase
        .from('user_preferences')
        .update({
          is_vegetarian: preferencesForm.is_vegetarian,
          is_vegan: preferencesForm.is_vegan,
          is_pescatarian: preferencesForm.is_pescatarian,
          is_gluten_free: preferencesForm.is_gluten_free,
          is_dairy_free: preferencesForm.is_dairy_free,
          is_halal: preferencesForm.is_halal,
          is_kosher: preferencesForm.is_kosher,
          is_hindu_non_veg: preferencesForm.is_hindu_non_veg,
          allergies: allergiesArray,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      const { setUserPreferences } = useStore.getState();
      setUserPreferences({
        ...userPreferences,
        is_vegetarian: preferencesForm.is_vegetarian,
        is_vegan: preferencesForm.is_vegan,
        is_pescatarian: preferencesForm.is_pescatarian,
        is_gluten_free: preferencesForm.is_gluten_free,
        is_dairy_free: preferencesForm.is_dairy_free,
        is_halal: preferencesForm.is_halal,
        is_kosher: preferencesForm.is_kosher,
        is_hindu_non_veg: preferencesForm.is_hindu_non_veg,
        allergies: allergiesArray,
      });

      setShowPreferencesModal(false);
      Alert.alert('Success', 'Dietary preferences updated successfully!');
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={handleEditProfile}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>✏️</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonText}>Edit Profile</Text>
                <Text style={styles.actionButtonSubtext}>Update your personal information</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={handleEditPreferences}
          >
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

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.weight_lbs}
                  onChangeText={(text) => setEditForm({ ...editForm, weight_lbs: text })}
                  keyboardType="numeric"
                  placeholder="Enter weight"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (inches)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.height_inches}
                  onChangeText={(text) => setEditForm({ ...editForm, height_inches: text })}
                  keyboardType="numeric"
                  placeholder="Enter height in inches"
                />
                <Text style={styles.inputHint}>
                  {editForm.height_inches ? 
                    `${Math.floor(parseFloat(editForm.height_inches) / 12)}'${parseFloat(editForm.height_inches) % 12}"` 
                    : ''}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.age}
                  onChangeText={(text) => setEditForm({ ...editForm, age: text })}
                  keyboardType="numeric"
                  placeholder="Enter age"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dietary Preferences Modal */}
      <Modal
        visible={showPreferencesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPreferencesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dietary Preferences</Text>
              <TouchableOpacity 
                onPress={() => setShowPreferencesModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalBody}>
                <Text style={styles.preferencesSectionTitle}>Diet Type</Text>
                
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_vegetarian: !preferencesForm.is_vegetarian
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_vegetarian && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>🥗 Vegetarian</Text>
                    <Text style={styles.checkboxSubtext}>No meat or fish</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_vegan: !preferencesForm.is_vegan
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_vegan && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>🌱 Vegan</Text>
                    <Text style={styles.checkboxSubtext}>No animal products</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_pescatarian: !preferencesForm.is_pescatarian
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_pescatarian && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>🐟 Pescatarian</Text>
                    <Text style={styles.checkboxSubtext}>Fish but no other meat</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.preferencesSectionTitle}>Allergens & Intolerances</Text>
                
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_gluten_free: !preferencesForm.is_gluten_free
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_gluten_free && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>🌾 Gluten-Free</Text>
                    <Text style={styles.checkboxSubtext}>No wheat, barley, rye</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_dairy_free: !preferencesForm.is_dairy_free
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_dairy_free && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>🥛 Dairy-Free</Text>
                    <Text style={styles.checkboxSubtext}>No milk products</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.preferencesSectionTitle}>Religious Dietary Laws</Text>
                
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_halal: !preferencesForm.is_halal
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_halal && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>☪️ Halal</Text>
                    <Text style={styles.checkboxSubtext}>Islamic dietary law</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_kosher: !preferencesForm.is_kosher
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_kosher && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>✡️ Kosher</Text>
                    <Text style={styles.checkboxSubtext}>Jewish dietary law</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setPreferencesForm({
                    ...preferencesForm, 
                    is_hindu_non_veg: !preferencesForm.is_hindu_non_veg
                  })}
                >
                  <View style={styles.checkbox}>
                    {preferencesForm.is_hindu_non_veg && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>🕉️ Hindu Non-Veg</Text>
                    <Text style={styles.checkboxSubtext}>No beef or pork</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.preferencesSectionTitle}>Specific Allergies</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>List any specific allergies</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={preferencesForm.allergies}
                    onChangeText={(text) => setPreferencesForm({ ...preferencesForm, allergies: text })}
                    placeholder="e.g., peanuts, shellfish, tree nuts"
                    multiline
                    numberOfLines={3}
                  />
                  <Text style={styles.inputHint}>Separate multiple allergies with commas</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowPreferencesModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSavePreferences}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    width: '100%',
    maxWidth: 500,
    ...shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalBody: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  inputHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: colors.gray300,
  },
  modalButtonSecondaryText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonPrimaryText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  modalScrollView: {
    maxHeight: 500,
  },
  preferencesSectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray50,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  checkboxLabelContainer: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  checkboxLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  checkboxSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default ProfileScreen;

