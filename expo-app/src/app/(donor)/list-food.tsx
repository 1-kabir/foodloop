import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useListingStore } from '../../store/listingStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { apiService } from '../../lib/api';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { CaretLeft, Sparkle, Camera } from 'phosphor-react-native';

const CATEGORIES = ['Cooked Meals', 'Raw Produce', 'Packaged Goods', 'Beverages', 'Bakery'];
const EXPIRY = ['Now', 'Within 2h', 'Within 6h', 'Today'];

// Converts the donor's chosen expiry window into a real timestamp the rest
// of the system (urgency colors, Smart Match urgency bonus, expiry sweep)
// can reason about instead of a display-only string.
function expiryWindowToIso(window: string): string {
  const now = new Date();
  switch (window) {
    case 'Now':
      return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    case 'Within 2h':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    case 'Within 6h':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
    case 'Today': {
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 0, 0);
      return endOfDay.toISOString();
    }
    default:
      return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  }
}

// "14:00" -> today at 14:00 local time, as ISO. Rolls to tomorrow if the
// donor picks a start time that's already passed today.
function timeStringToIso(time: string): string {
  const [hours, minutes] = time.split(':').map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(hours || 0, minutes || 0, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [smartMatch, setSmartMatch] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach a listing photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoUri || !user) return null;
    try {
      const response = await fetch(photoUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
      if (error) {
        console.warn('Photo upload failed:', error.message);
        return null;
      }
      const { data } = supabase.storage.from('listing-photos').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.warn('Photo upload failed:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!foodName.trim()) return;
    setSubmitting(true);

    const photoUrl = await uploadPhoto();

    const result = await addListing({
      foodName: foodName.trim(),
      category,
      qtyKg: parseInt(qty, 10) || 0,
      expiryWindow: expiry,
      expiryAt: expiryWindowToIso(expiry),
      pickupWindowStart: timeStringToIso(pickupStart),
      pickupWindowEnd: timeStringToIso(pickupEnd),
      photoUrl,
    });

    if (result.error) {
      setSubmitting(false);
      Alert.alert('Could not publish listing', result.error);
      return;
    }

    if (smartMatch && result.id) {
      try {
        const matches = await apiService.getSmartMatches(result.id);
        setSubmitting(false);
        if (matches.length > 0) {
          Alert.alert(
            'Listing published',
            `Smart Match found ${matches.length} nearby NGO${matches.length === 1 ? '' : 's'} for this donation:\n\n${matches
              .map((m) => `• ${m.name} — ${m.distance}`)
              .join('\n')}`
          );
        } else {
          Alert.alert('Listing published', 'No verified NGOs matched yet — your listing is live and visible to all NGOs nearby.');
        }
      } catch {
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
    }

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
          style={[styles.photoBox, photoUri && styles.photoBoxActive, photoUri && { height: 160 }]}
          onPress={handlePickPhoto}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
          ) : (
            <View style={styles.photoInner}>
              <Camera color={colors.neutral400} size={24} weight="regular" />
              <Text style={styles.photoText}>Tap to attach a listing photo</Text>
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
          <Button
            label={submitting ? 'Publishing…' : 'Publish Listing'}
            onPress={handleSubmit}
            disabled={submitting || !foodName.trim()}
          />
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
    overflow: 'hidden',
    padding: 0,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: radius.card,
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
