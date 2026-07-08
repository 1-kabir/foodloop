import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useListingStore } from '../../store/listingStore';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { CaretLeft } from 'phosphor-react-native';

export default function ClaimSheetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { listings, claimListing } = useListingStore();
  
  const listing = listings.find(l => l.id === id);
  const [claimQty, setClaimQty] = useState(listing ? listing.qty : 0);
  const [pickupTime, setPickupTime] = useState('16:30');

  if (!listing) return null;

  const handleClaim = () => {
    claimListing(listing.id);
    router.back();
  };

  const incrementQty = () => {
    if (claimQty < listing.qty) setClaimQty(claimQty + 1);
  };

  const decrementQty = () => {
    if (claimQty > 1) setClaimQty(claimQty - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <CaretLeft color={colors.neutral900} size={24} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>Claim Food</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.foodName}>{listing.foodName}</Text>
          <Text style={styles.donorName}>from {listing.donorName}</Text>
          <Text style={styles.qtyAvailable}>{listing.qty} kg available</Text>
        </View>

        {/* Quantity selector with increments */}
        <Text style={styles.label}>How much do you need? (kg)</Text>
        <View style={styles.counterRow}>
          <Pressable style={styles.counterBtn} onPress={decrementQty}>
            <Text style={styles.counterBtnText}>-</Text>
          </Pressable>
          <Text style={styles.counterVal}>{claimQty}</Text>
          <Pressable style={styles.counterBtn} onPress={incrementQty}>
            <Text style={styles.counterBtnText}>+</Text>
          </Pressable>
        </View>

        {/* Pickup Time Segment picker */}
        <Text style={styles.label}>Estimated Pickup Time</Text>
        <View style={styles.timeSegments}>
          {['15:00', '16:00', '17:00', '18:00'].map(t => (
            <Pressable
              key={t}
              style={[styles.timeChip, pickupTime === t && styles.timeChipActive]}
              onPress={() => setPickupTime(t)}
            >
              <Text style={[styles.timeText, pickupTime === t && styles.timeTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.timeNote}>Donor window: 14:00 - 18:00</Text>

        <View style={styles.spacer} />

        <Button label={`Confirm Claim (${claimQty} kg)`} onPress={handleClaim} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.md.fontSize,
    color: colors.neutral900,
  },
  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: colors.blue50,
    borderRadius: radius.card,
    padding: 20,
    marginBottom: spacing.s32,
    borderWidth: 1,
    borderColor: colors.blue100,
  },
  foodName: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral900,
    marginBottom: 4,
  },
  donorName: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.base.fontSize,
    color: colors.neutral600,
    marginBottom: 12,
  },
  qtyAvailable: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.md.fontSize,
    color: colors.blue500,
  },
  label: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.base.fontSize,
    color: colors.neutral900,
    marginBottom: spacing.s12,
    marginTop: spacing.s20,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: spacing.s24,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 20,
    fontFamily: typography.fonts.bold,
    color: colors.neutral900,
  },
  counterVal: {
    fontFamily: typography.fonts.bold,
    fontSize: 20,
    color: colors.neutral900,
    minWidth: 40,
    textAlign: 'center',
  },
  timeSegments: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  timeChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.input,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: colors.blue400,
    borderColor: colors.blue400,
  },
  timeText: {
    fontFamily: typography.fonts.medium,
    fontSize: 14,
    color: colors.neutral600,
  },
  timeTextActive: {
    color: colors.white,
  },
  timeNote: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.size.xs.fontSize,
    color: colors.neutral400,
  },
  spacer: {
    height: 40,
  }
});
