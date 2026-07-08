import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useListingStore } from '../../store/listingStore';
import { colors, typography, radius, shadows, spacing } from '../../constants/theme';
import { ForkKnife } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Map center around a mock coordinate
const MOCK_REGION = {
  latitude: 22.5726,
  longitude: 88.3639, // Kolkata coords based on user's location
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function NGOMapScreen() {
  const router = useRouter();
  const { listings } = useListingStore();
  const availableFood = listings.filter(l => l.status === 'available');

  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={MOCK_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {availableFood.map((listing, index) => {
          // generate slight offsets for mock markers
          const lat = MOCK_REGION.latitude + (index * 0.01) - 0.015;
          const lng = MOCK_REGION.longitude + (index * 0.01) - 0.005;

          const urgencyColor = listing.urgency === 'red' ? colors.red : listing.urgency === 'amber' ? colors.amber : colors.green;

          return (
            <Marker
              key={listing.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => setSelectedId(listing.id)}
            >
              <View style={[styles.pin, { backgroundColor: urgencyColor }]}>
                <ForkKnife color={colors.white} size={16} weight="bold" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.controlsStrip}>
        <View style={styles.pillControl}>
          <Text style={styles.pillText}>{availableFood.length} donations nearby</Text>
        </View>
      </View>

      {selectedId && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          {availableFood.filter(l => l.id === selectedId).map(listing => (
            <View key={listing.id}>
              <Text style={styles.sheetTitle}>{listing.foodName}</Text>
              <Text style={styles.sheetSubtitle}>{listing.qty} kg • {listing.distance}</Text>
              <Pressable 
                style={styles.claimBtn}
                onPress={() => router.push(`/(ngo)/claim-sheet?id=${listing.id}` as any)}
              >
                <Text style={styles.claimBtnText}>View Details</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral0,
  },
  map: {
    width,
    height,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.map,
  },
  controlsStrip: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pillControl: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.mapControl,
    borderWidth: 1,
    borderColor: colors.neutral200,
    ...shadows.map,
  },
  pillText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral900,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.sheetTop,
    borderTopRightRadius: radius.sheetTop,
    padding: spacing.screenHorizontal,
    paddingTop: 12,
    ...shadows.float,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral900,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.base.fontSize,
    color: colors.neutral600,
    marginBottom: 24,
  },
  claimBtn: {
    backgroundColor: colors.blue400,
    height: 56,
    borderRadius: radius.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  claimBtnText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  }
});
