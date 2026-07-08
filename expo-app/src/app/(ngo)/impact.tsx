import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, typography, spacing, radius } from '../../constants/theme';

export default function NGOImpactScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Community Impact</Text>
        
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Food Distributed</Text>
          <Text style={styles.heroNumber}>845<Text style={styles.heroUnit}> kg</Text></Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>People Fed</Text>
            <Text style={styles.gridValue}>~2.5k</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>CO₂ Offset</Text>
            <Text style={styles.gridValue}>2.1k kg</Text>
          </View>
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
    padding: spacing.screenHorizontal,
    paddingTop: 40,
  },
  pageTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.xl.fontSize,
    color: colors.neutral900,
    marginBottom: spacing.s32,
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.s40,
  },
  heroLabel: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.size.md.fontSize,
    color: colors.neutral600,
    marginBottom: 8,
  },
  heroNumber: {
    fontFamily: typography.fonts.extraBold,
    fontSize: typography.size.xxxl.fontSize,
    color: colors.green,
    letterSpacing: -1,
    lineHeight: typography.size.xxxl.lineHeight,
  },
  heroUnit: {
    fontSize: typography.size.xxl.fontSize,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.neutral50,
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral100,
  },
  gridLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.size.sm.fontSize,
    color: colors.neutral600,
    marginBottom: 8,
  },
  gridValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.size.lg.fontSize,
    color: colors.neutral900,
  }
});
