import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useListingStore } from '../../store/listingStore';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { CaretLeft, Sparkle, Camera, Check } from 'phosphor-react-native';

const CATEGORIES = ['Cooked Meals', 'Raw Produce', 'Packaged Goods', 'Beverages', 'Bakery'];
const EXPIRY = ['Now', 'Within 2h', 'Within 6h', 'Today'];

export default function ListFoodScreen() {
  const router = useRouter();
  const { addListing } = useListingStore();
  const { user } = useAuthStore();
  
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [qty, setQty] = useState('10');
  const [expiry, setExpiry] = useState('Within 2h');
  
  // Custom specifications from the spec
  const [pickupStart, setPickupStart] = useState('14:00');
  const [pickupEnd, setPickupEnd] = useState('18:00');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [smartMatch, setSmartMatch] = useState(true);

  const handleSubmit = () => {
    if (!foodName) return;
    addListing({
      donorName: user?.name || 'Unknown',
      foodName,
      category,
      qty: parseInt(qty) || 0,
      urgency: expiry === 'Now' || expiry === 'Within 2h' ? 'red' : expiry === 'Within 6h' ? 'amber' : 'green',
      status: 'available',
      distance: '0.0 km',
      timeRemaining: expiry
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <CaretLeft color={colors.neutral900} size={24} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>List Food</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>What are you donating?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2 trays of Chicken Biryani"
          placeholderTextColor={colors.neutral400}
          value={foodName}
          onChangeText={setFoodName}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipsContainer}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Quantity (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10"
          placeholderTextColor={colors.neutral400}
          keyboardType="numeric"
          value={qty}
          onChangeText={setQty}
        />

        <Text style={styles.label}>Expiry Window</Text>
        <View style={styles.chipsContainer}>
          {EXPIRY.map(exp => (
            <Pressable
              key={exp}
              style={[styles.chip, expiry === exp && styles.chipActive]}
              onPress={() => setExpiry(exp)}
            >
              <Text style={[styles.chipText, expiry === exp && styles.chipTextActive]}>{exp}</Text>
            </Pressable>
          ))}
        </View>

        {/* Time Windows */}
        <Text style={styles.label}>Pickup Window</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.subLabel}>Start Time</Text>
            <TextInput
              style={styles.timeInput}
              value={pickupStart}
              onChangeText={setPickupStart}
              placeholder="14:00"
            />
          </View>
          <View style={styles.timeCol}>
            <Text style={styles.subLabel}>End Time</Text>
            <TextInput
              style={styles.timeInput}
              value={pickupEnd}
              onChangeText={setPickupEnd}
              placeholder="18:00"
            />
          </View>
        </View>

        {/* Optional Photo Attachment */}
        <Text style={styles.label}>Add Photo</Text>
        <Pressable 
          style={[styles.photoBox, hasPhoto && styles.photoBoxActive]} 
          onPress={() => setHasPhoto(!hasPhoto)}
        >
          {hasPhoto ? (
            <View style={styles.photoInner}>
              <Check color={colors.blue500} size={24} weight="bold" />
              <Text style={styles.photoTextActive}>Photo added mock_image.jpg</Text>
            </View>
          ) : (
            <View style={styles.photoInner}>
              <Camera color={colors.neutral400} size={24} weight="regular" />
              <Text style={styles.photoText}>Tap to capture/attach listing photo</Text>
            </View>
          )}
        </Pressable>

        {/* Smart Match Toggle Card */}
        <Pressable 
          style={[styles.matchCard, smartMatch && styles.matchCardActive]} 
          onPress={() => setSmartMatch(!smartMatch)}
        >
          <View style={styles.matchLeft}>
            <View style={[styles.matchIconWrap, smartMatch && styles.matchIconWrapActive]}>
              <Sparkle color={smartMatch ? colors.blue500 : colors.neutral400} size={20} weight="fill" />
            </View>
            <View style={styles.matchTexts}>
              <Text style={styles.matchTitle}>AI Smart Match</Text>
              <Text style={styles.matchSub}>Auto-suggest nearby compatible NGOs</Text>
            </View>
          </View>
          <View style={[styles.toggleTrack, smartMatch && styles.toggleTrackActive]}>
            <View style={[styles.toggleThumb, smartMatch && styles.toggleThumbActive]} />
          </View>
        </Pressable>

        <View style={{ marginTop: spacing.s40 }}>
          <Button label="Publish Listing" onPress={handleSubmit} />
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
    paddingBottom: 48,
  },
  label: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.base.fontSize,
    color: colors.neutral900,
    marginTop: spacing.s24,
    marginBottom: spacing.s12,
  },
  subLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.xs.fontSize,
    color: colors.neutral600,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.input,
    height: 56,
    paddingHorizontal: 16,
    fontFamily: typography.fonts.regular,
    fontSize: 15,
    color: colors.neutral900,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  chipActive: {
    backgroundColor: colors.blue400,
    borderColor: colors.blue400,
  },
  chipText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral600,
  },
  chipTextActive: {
    color: colors.white,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCol: {
    flex: 1,
  },
  timeInput: {
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.input,
    height: 48,
    paddingHorizontal: 12,
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.neutral900,
  },
  photoBox: {
    height: 100,
    backgroundColor: colors.neutral50,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBoxActive: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue300,
    borderStyle: 'solid',
  },
  photoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral400,
  },
  photoTextActive: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.sm.fontSize,
    color: colors.blue600,
  },
  matchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral100,
    borderRadius: radius.card,
    padding: 16,
    marginTop: spacing.s24,
  },
  matchCardActive: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue200,
  },
  matchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  matchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchIconWrapActive: {
    backgroundColor: colors.blue100,
  },
  matchTexts: {
    flex: 1,
  },
  matchTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral900,
  },
  matchSub: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.size.xs.fontSize,
    color: colors.neutral400,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral200,
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: colors.blue400,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
});
