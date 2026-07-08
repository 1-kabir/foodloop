import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useToastStore } from '../../store/toastStore';
import { colors, typography, radius } from '../../constants/theme';
import { CheckCircle, Warning, Info, X } from 'phosphor-react-native';

export const Toast: React.FC = () => {
  const { visible, message, type, hideToast } = useToastStore();
  
  // Slide down from top safe area (-100 to 16)
  const translateY = useSharedValue(-120);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(16, { stiffness: 280, damping: 26 });
    } else {
      translateY.value = withSpring(-120, { stiffness: 280, damping: 26 });
    }
  }, [visible]);

  if (!visible && translateY.value === -120) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.green + '12',
          borderColor: colors.green + '30',
          iconColor: colors.green,
          Icon: CheckCircle,
        };
      case 'error':
        return {
          backgroundColor: colors.red + '12',
          borderColor: colors.red + '30',
          iconColor: colors.red,
          Icon: Warning,
        };
      default:
        return {
          backgroundColor: colors.blue50,
          borderColor: colors.blue200,
          iconColor: colors.blue500,
          Icon: Info,
        };
    }
  };

  const toastStyle = getToastStyles();
  const Icon = toastStyle.Icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, toastStyle, animatedStyle]}>
      <View style={styles.content}>
        <Icon color={toastStyle.iconColor} size={20} weight="fill" />
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
        <Pressable onPress={hideToast} style={styles.closeBtn}>
          <X color={colors.neutral600} size={16} weight="bold" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40, // Positioned near top safe areas
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: radius.card,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
    color: colors.neutral900,
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
    marginRight: -4,
  },
});
