import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput } from 'react-native';
import { useListingStore } from '../../store/listingStore';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { FoodCard } from '../../components/FoodCard';
import { useRouter } from 'expo-router';
import { MagnifyingGlass, Funnel } from 'phosphor-react-native';

const CATEGORIES = ['All', 'Cooked Meals', 'Raw Produce', 'Packaged Goods', 'Beverages', 'Bakery'];

export default function NGOBrowseScreen() {
  const router = useRouter();
  const { listings } = useListingStore();
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Custom Filter Parameters (Spec Point 2)
  const [searchQuery, setSearchQuery] = useState('');
  const [minQty, setMinQty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10); // Simulated km

  const availableFood = listings.filter(l => l.status === 'available');

  const filteredFood = availableFood.filter(l => {
    // Search query match
    if (searchQuery && !l.foodName.toLowerCase().includes(searchQuery.toLowerCase()) && !l.donorName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Category match
    if (activeCategory !== 'All' && l.category !== activeCategory && (activeCategory === 'Raw Produce' ? l.category !== 'Raw' : true)) {
      return false;
    }
    // Min Quantity match
    if (minQty && l.qty < parseInt(minQty)) {
      return false;
    }
    // Distance matching (simulated distance comparison)
    const distanceVal = parseFloat(l.distance);
    if (!isNaN(distanceVal) && distanceVal > maxDistance) {
      return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Browse Food</Text>
      </View>

      {/* Search & Filter Trigger */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBox}>
          <MagnifyingGlass color={colors.neutral400} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food or donors..."
            placeholderTextColor={colors.neutral400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable 
          style={[styles.filterTrigger, showFilters && styles.filterTriggerActive]} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Funnel color={showFilters ? colors.blue500 : colors.neutral600} size={20} />
        </Pressable>
      </View>

      {/* Expanded filters panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Minimum Quantity ({minQty || '0'} kg)</Text>
            <TextInput
              style={styles.filterInput}
              keyboardType="numeric"
              placeholder="e.g. 5"
              placeholderTextColor={colors.neutral400}
              value={minQty}
              onChangeText={setMinQty}
            />
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Max Proximity Radius: {maxDistance} km</Text>
            <View style={styles.rangeRow}>
              {[5, 10, 15, 25].map(dist => (
                <Pressable
                  key={dist}
                  style={[styles.rangePill, maxDistance === dist && styles.rangePillActive]}
                  onPress={() => setMaxDistance(dist)}
                >
                  <Text style={[styles.rangeText, maxDistance === dist && styles.rangeTextActive]}>{dist}km</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Horizontal Category chips selector */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c}
              style={[styles.catChip, activeCategory === c && styles.catChipActive]}
              onPress={() => setActiveCategory(c)}
            >
              <Text style={[styles.catText, activeCategory === c && styles.catTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredFood.length > 0 ? (
          <View style={styles.list}>
            {filteredFood.map(listing => (
              <Pressable key={listing.id} onPress={() => router.push(`/(ngo)/claim-sheet?id=${listing.id}` as any)}>
                <FoodCard listing={listing} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No food matches your filters.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral0,
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 24,
    paddingBottom: 12,
  },
  pageTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.xl.fontSize,
    color: colors.neutral900,
    letterSpacing: -0.5,
  },
  searchBarRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral100,
    borderRadius: radius.input,
    height: 48,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.neutral900,
  },
  filterTrigger: {
    width: 48,
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTriggerActive: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue200,
  },
  filtersPanel: {
    marginHorizontal: spacing.screenHorizontal,
    padding: 16,
    backgroundColor: colors.neutral50,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral100,
    marginBottom: 16,
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.xs.fontSize,
    color: colors.neutral600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.input,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.neutral900,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rangePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  rangePillActive: {
    backgroundColor: colors.blue400,
    borderColor: colors.blue400,
  },
  rangeText: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.neutral600,
  },
  rangeTextActive: {
    color: colors.white,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral100,
  },
  catChipActive: {
    backgroundColor: colors.blue400,
    borderColor: colors.blue400,
  },
  catText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral600,
  },
  catTextActive: {
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 40,
  },
  list: {
    gap: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.base.fontSize,
    color: colors.neutral400,
  }
});
