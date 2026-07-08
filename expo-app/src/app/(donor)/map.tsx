import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useListingStore } from '../../store/listingStore';
import { colors, typography, radius, shadows, spacing } from '../../constants/theme';
import { Users } from 'phosphor-react-native';

const { width, height } = Dimensions.get('window');

const MOCK_REGION = {
  latitude: 22.5726,
  longitude: 88.3639,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MOCK_NGOS = [
  { id: '1', name: 'Hope Foundation', capacity: '50kg', distance: '1.2km', lat: 22.58, lng: 88.36 },
  { id: '2', name: 'Feed The Need', capacity: '120kg', distance: '3.4km', lat: 22.56, lng: 88.38 },
];

export default function DonorMapScreen() {
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
        {MOCK_NGOS.map((ngo) => (
          <Marker
            key={ngo.id}
            coordinate={{ latitude: ngo.lat, longitude: ngo.lng }}
            onPress={() => setSelectedId(ngo.id)}
          >
            <View style={[styles.pin, { backgroundColor: colors.blue400 }]}>
              <Users color={colors.white} size={16} weight="bold" />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.controlsStrip}>
        <View style={styles.pillControl}>
          <Text style={styles.pillText}>Verified NGOs Nearby</Text>
        </View>
      </View>

      {selectedId && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          {MOCK_NGOS.filter(n => n.id === selectedId).map(ngo => (
            <View key={ngo.id}>
              <View style={styles.row}>
                <Text style={styles.sheetTitle}>{ngo.name}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.sheetSubtitle}>Capacity: {ngo.capacity} • {ngo.distance}</Text>
              
              <Pressable style={styles.claimBtn}>
                <Text style={styles.claimBtnText}>Message NGO</Text>
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
    top: 24,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral900,
  },
  verifiedBadge: {
    backgroundColor: colors.verified + '1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  verifiedText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 11,
    color: colors.verified,
    letterSpacing: 0.4,
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
