import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { CaretLeft, Bell } from 'phosphor-react-native';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Food Available',
    message: 'Local Cafe listed 15kg of Chicken Biryani nearby.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Verification Complete',
    message: 'Your organisation profile has been approved! Start browse and claiming surplus food.',
    time: '1 day ago',
    unread: false,
  },
  {
    id: '3',
    title: 'Welcome to FoodLoop',
    message: 'Thanks for joining! Let\'s coordinate and reduce hunger together.',
    time: '2 days ago',
    unread: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <CaretLeft color={colors.neutral900} size={22} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map(n => (
          <View key={n.id} style={[styles.notifCard, n.unread && styles.notifCardUnread]}>
            <View style={styles.iconCol}>
              <Bell color={n.unread ? colors.blue500 : colors.neutral400} size={20} weight={n.unread ? 'fill' : 'regular'} />
            </View>
            <View style={styles.textCol}>
              <View style={styles.titleRow}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
              <Text style={styles.notifMessage}>{n.message}</Text>
            </View>
          </View>
        ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.md.fontSize,
    color: colors.neutral900,
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.neutral50,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral100,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue200,
  },
  iconCol: {
    paddingTop: 2,
  },
  textCol: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
    color: colors.neutral900,
  },
  notifTime: {
    fontFamily: typography.fonts.regular,
    fontSize: 11,
    color: colors.neutral400,
  },
  notifMessage: {
    fontFamily: typography.fonts.regular,
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
});
