import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useListingStore } from '../../store/listingStore';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';
import { FoodCard } from '../../components/FoodCard';
import { useRouter } from 'expo-router';
import { Plus, QrCode, X } from 'phosphor-react-native';

export default function DonorListingsScreen() {
  const { user } = useAuthStore();
  const { listings } = useListingStore();
  const router = useRouter();

  const myListings = listings.filter((l) => l.status !== 'expired');

  // QR Modal States
  const [selectedListing, setSelectedListing] = useState<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>My Listings</Text>
            <Text style={styles.count}>
              {myListings.length} listing{myListings.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {myListings.length > 0 ? (
          <View style={styles.list}>
            {myListings.map((listing) => (
              <Pressable 
                key={listing.id} 
                onPress={() => setSelectedListing(listing)}
              >
                <FoodCard listing={listing} />
                {listing.status === 'claimed' && (
                  <View style={styles.claimedBadgeRow}>
                    <QrCode color={colors.blue500} size={16} />
                    <Text style={styles.claimedBadgeText}>Tap to generate collection QR</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No active listings.{'\n'}Tap + to add one.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB lives on the Listings screen, not Home */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(donor)/list-food')}
      >
        <Plus color={colors.white} size={24} weight="bold" />
      </Pressable>

      {/* QR Code Modal popup */}
      <Modal visible={selectedListing !== null} transparent animationType="slide">
        <View style={styles.modalScrim}>
          <View style={styles.qrCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verification QR Code</Text>
              <Pressable onPress={() => setSelectedListing(null)}>
                <X color={colors.neutral900} size={24} />
              </Pressable>
            </View>
            {selectedListing && (
              <View style={styles.qrContent}>
                <Text style={styles.qrFoodName}>{selectedListing.foodName}</Text>
                <Text style={styles.qrClaimInfo}>
                  Claimed by Hope NGO • {selectedListing.qty} kg
                </Text>

                {/* Mock QR graphic representation */}
                <View style={styles.qrSquare}>
                  {/* Outer Frame */}
                  <View style={styles.qrGrid}>
                    <View style={styles.qrMarker} />
                    <View style={{ flex: 1 }} />
                    <View style={styles.qrMarker} />
                  </View>
                  <View style={styles.qrDotsBlock} />
                  <View style={styles.qrGrid}>
                    <View style={styles.qrMarker} />
                    <View style={{ flex: 1 }} />
                    <View style={[styles.qrMarker, { backgroundColor: colors.blue400 }]} />
                  </View>
                </View>

                <Text style={styles.qrSub}>
                  Present this code to the NGO driver upon pickup to finalize verification.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100,
  },
  pageHeader: {
    marginBottom: spacing.s24,
  },
  pageTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.xl.fontSize,
    color: colors.neutral900,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  count: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral400,
  },
  list: {
    gap: 12,
  },
  claimedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 14,
  },
  claimedBadgeText: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.blue500,
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.base.fontSize,
    color: colors.neutral400,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 100,
    backgroundColor: colors.blue400,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.float,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(26,43,60,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 20,
    ...shadows.float,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.md.fontSize,
    color: colors.neutral900,
  },
  qrContent: {
    alignItems: 'center',
    gap: 8,
  },
  qrFoodName: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral900,
  },
  qrClaimInfo: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral600,
    marginBottom: 20,
  },
  qrSquare: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  qrGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qrMarker: {
    width: 40,
    height: 40,
    borderWidth: 6,
    borderColor: colors.neutral900,
    borderRadius: 6,
  },
  qrDotsBlock: {
    width: 32,
    height: 32,
    backgroundColor: colors.neutral900,
    alignSelf: 'center',
    borderRadius: 4,
  },
  qrSub: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: colors.neutral400,
    textAlign: 'center',
    lineHeight: 18,
  }
});
