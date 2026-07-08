import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../constants/theme';
import { Status } from '../../store/listingStore';

export const StatusPill: React.FC<{ status: Status }> = ({ status }) => {
  let color = colors.neutral400;
  if (status === 'available') color = colors.green;
  if (status === 'claimed') color = colors.amber;
  if (status === 'collected') color = colors.blue500;

  return (
    <View style={[styles.pill, { backgroundColor: `${color}1E` }]}>
      <Text style={[styles.text, { color }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
  }
});
