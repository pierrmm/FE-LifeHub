import React from 'react';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// This is a shim for web and Android where the tab bar is generally opaque.
// Export a hook to get the bottom tab overflow
export function useBottomTabOverflow() {
  const insets = useSafeAreaInsets();
  return insets.bottom;
}

type TabBarBackgroundProps = {
  colorScheme?: 'light' | 'dark';
};

// Make sure to export this component as default
export default function TabBarBackground({ colorScheme = 'light' }: TabBarBackgroundProps) {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint={colorScheme}
        intensity={80}
        style={[
          StyleSheet.absoluteFill,
          { height: 49 + insets.bottom },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          height: 49 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#333' : '#E0E0E0',
        },
      ]}
    />
  );
}