import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Modal, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useClaimStore, Claim } from '../../store/claimStore';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';
import { Camera, Check, X } from 'phosphor-react-native';

function getCurrentWeekDays(): { label: string; day: string; date: Date }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, day: String(d.getDate()).padStart(2, '0'), date: d };
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <View style={claimCardStyles.card}>
      <Text style={claimCardStyles.food}>{claim.foodName}</Text>
      <Text style={claimCardStyles.meta}>from {claim.donorName} • {claim.qtyClaimedKg} kg</Text>
    </View>
  );
}

const claimCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral50,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral100,
    padding: 16,
  },
  food: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.md.fontSize,
    color: colors.neutral900,
    marginBottom: 4,
  },
  meta: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral600,
  },
});

export default function NGOScheduleScreen() {
  const { claims, fetchMyClaims, subscribeRealtime, unsubscribeRealtime, verifyPickup } = useClaimStore();
  const [permission, requestPermission] = useCameraPermissions();
  const weekDays = getCurrentWeekDays();

  const [scanVisible, setScanVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchMyClaims();
    subscribeRealtime('ngo');
    return () => unsubscribeRealtime();
  }, []);

  const claimedFood = claims
    .filter((c) => c.status === 'confirmed' && isSameDay(new Date(c.pickupTime), selectedDate))
    .sort((a, b) => new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime());

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setScanning(true);
    setScanVisible(true);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scanning) return;
    setScanning(false);
    const result = await verifyPickup(data);

    if (result.error) {
      Alert.alert('Could not verify pickup', result.error, [{ text: 'Try again', onPress: () => setScanning(true) }]);
      return;
    }

    setScanVisible(false);
    setSuccessVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Schedule</Text>
      </View>

      {/* Weekly segment calendar view */}
      <View style={styles.calendarStrip}>
        {weekDays.map((d) => {
          const active = isSameDay(d.date, selectedDate);
          return (
            <Pressable
              key={d.date.toISOString()}
              style={[styles.calDay, active && styles.calDayActive]}
              onPress={() => setSelectedDate(d.date)}
            >
              <Text style={[styles.calLabel, active && styles.calLabelActive]}>{d.label}</Text>
              <Text style={[styles.calNum, active && styles.calNumActive]}>{d.day}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {claimedFood.length > 0 ? (
          <View style={styles.list}>
            {claimedFood.map(claim => (
              <View key={claim.id} style={styles.scheduleItem}>
                <View style={styles.timeline}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.cardContainer}>
                  <Text style={styles.timeLabel}>
                    {new Date(claim.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <ClaimCard claim={claim} />
                  <Pressable style={styles.scanBtn} onPress={openScanner}>
                    <Camera color={colors.white} size={18} weight="bold" />
                    <Text style={styles.scanBtnText}>Verify Collection</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No pickups scheduled for this day.</Text>
          </View>
        )}
      </ScrollView>

      {/* Real camera-based QR scanner */}
      <Modal visible={scanVisible} transparent animationType="slide">
        <View style={styles.modalScrim}>
          <View style={styles.scannerWindow}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan Donor QR Code</Text>
              <Pressable onPress={() => setScanVisible(false)}>
                <X color={colors.neutral900} size={24} />
              </Pressable>
            </View>
            <View style={styles.cameraBox}>
              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
                />
              ) : null}
              <View style={styles.focusFrame} pointerEvents="none" />
              <Text style={styles.cameraSub}>Align QR code inside frame</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Verification Success Feedback modal */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalScrim}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Check color={colors.white} size={32} weight="bold" />
            </View>
            <Text style={styles.successTitle}>Pickup Verified</Text>
            <Text style={styles.successSub}>Collection completed successfully. Impact metrics updated!</Text>
            <Pressable style={styles.closeBtn} onPress={() => setSuccessVisible(false)}>
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
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
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 24,
    paddingBottom: 16,
  },
  pageTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.xl.fontSize,
    color: colors.neutral900,
    letterSpacing: -0.5,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: 20,
  },
  calDay: {
    alignItems: 'center',
    paddingVertical: 10,
    width: 42,
    borderRadius: radius.card,
  },
  calDayActive: {
    backgroundColor: colors.blue400,
  },
  calLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: 12,
    color: colors.neutral400,
    marginBottom: 4,
  },
  calLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  calNum: {
    fontFamily: typography.fonts.bold,
    fontSize: 14,
    color: colors.neutral900,
  },
  calNumActive: {
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 40,
  },
  list: {
    gap: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.blue400,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral200,
    marginTop: 4,
    marginBottom: -4,
  },
  cardContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  timeLabel: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral600,
    marginBottom: 8,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.blue400,
    height: 48,
    borderRadius: radius.button,
    marginTop: 10,
  },
  scanBtnText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
    color: colors.white,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.base.fontSize,
    color: colors.neutral400,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(26,43,60,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scannerWindow: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 20,
    gap: 16,
    ...shadows.float,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.md.fontSize,
    color: colors.neutral900,
  },
  cameraBox: {
    height: 240,
    backgroundColor: colors.neutral900,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  focusFrame: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: colors.blue400,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cameraSub: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
  mockSuccessBtn: {
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.neutral200,
    height: 48,
    borderRadius: radius.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockSuccessText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
    color: colors.blue500,
  },
  successCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    ...shadows.float,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral900,
  },
  successSub: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral600,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeBtn: {
    width: '100%',
    height: 48,
    borderRadius: radius.button,
    backgroundColor: colors.neutral900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
    color: colors.white,
  }
});
