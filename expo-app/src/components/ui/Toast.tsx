import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useToastStore } from '../../store/toastStore';
import { colors, typography, radius, shadows } from '../../constants/theme';
import { CheckCircle, Warning, Info, X } from 'phosphor-react-native';

const { width } = Dimensions.get('window');

export const Toast: React.FC = () => {
  const { visible, message, type, hideToast } = useToastStore();
  
  // Slide up from bottom safe area (starts at 100 offscreen, settles at 20)
  const translateY = useSharedValue(150);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { stiffness: 300, damping: 24 });
    } else {
      translateY.value = withSpring(150, { stiffness: 300, damping: 24 });
    }
  }, [visible]);

  if (!visible && translateY.value === 150) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          textColor: colors.green,
          indicatorColor: colors.green,
          Icon: CheckCircle,
        };
      case 'error':
        return {
          textColor: colors.red,
          indicatorColor: colors.red,
          Icon: Warning,
        };
      default:
        return {
          textColor: colors.blue500,
          indicatorColor: colors.blue400,
          Icon: Info,
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.Icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Urgency-style left color indicator bar matching guidelines */}
      <View style={[styles.indicatorBar, { backgroundColor: config.indicatorColor }]} />
      
      <View style={styles.inner}>
        <Icon color={config.indicatorColor} size={20} weight="bold" />
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
        <Pressable onPress={hideToast} style={styles.closeBtn}>
          <X color={colors.neutral400} size={16} weight="bold" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: colors.neutral50, // Matches cards
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral100,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadows.float, // Floating shadow since it sits on top of content
  },
  indicatorBar: {
    width: 4,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
