import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useListingStore } from '../../store/listingStore';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { FoodCard } from '../../components/FoodCard';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function NGODashboard() {
  const { user } = useAuthStore();
  const { listings } = useListingStore();
  
  const availableFood = listings.filter(l => l.status === 'available');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header — subdued text-lg, weight 500, neutral-600, greeting + name */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            <Text style={{ fontFamily: typography.fonts.bold }}>{availableFood.length}</Text> new donations near you
          </Text>
        </View>

        {/* Stat strip — blue-100 fill, no border, unequal widths */}
        <View style={styles.statStrip}>
          <View style={[styles.statBox, { flex: 2.2 }]}>
            <Text style={styles.statLabel}>Total Collected</Text>
            <Text style={styles.statValue}>124 kg</Text>
          </View>
          <View style={[styles.statBox, { flex: 1.4 }]}>
            <Text style={styles.statLabel}>Meals</Text>
            <Text style={styles.statValue}>372</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Urgent Available</Text>
        <View style={styles.list}>
          {availableFood.map(listing => (
            <FoodCard key={listing.id} listing={listing} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral0,
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.s24,
  },
  greeting: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral600,
    lineHeight: typography.size.lg.lineHeight,
  },
  name: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral900,
    lineHeight: typography.size.lg.lineHeight,
  },
  banner: {
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue200,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: spacing.s24,
  },
  bannerText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.md.fontSize,
    color: colors.blue600,
  },
  statStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.s32,
  },
  statBox: {
    backgroundColor: colors.blue100,
    borderRadius: radius.card,
    padding: 14,
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.xs.fontSize,
    color: colors.neutral600,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.xl.fontSize,
    color: colors.neutral900,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.md.fontSize,
    color: colors.neutral900,
    marginBottom: spacing.s20,
  },
  list: {
    gap: 16,
  },
});
