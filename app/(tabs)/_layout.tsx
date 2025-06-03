import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Theme storage key
const THEME_PREFERENCE_KEY = 'user-theme-preference';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation values
  const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Update animation when theme changes
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDark]);
  
  // Toggle between light and dark themes
  const toggleTheme = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    try {
      const newTheme = isDark ? 'light' : 'dark';
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newTheme);
      
      // Force reload the app to apply the theme change
      if (Platform.OS === 'web') {
        window.location.reload();
      } else {
        // For native platforms, we'll rely on the useEffect in the hook
        // to detect the AsyncStorage change
        console.log('Theme changed to:', newTheme);
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Interpolate rotation for the icon
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <>
      {/* Theme Toggle Button */}
      <View style={styles.themeToggleContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.themeToggleButton]}
            onPress={toggleTheme}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isDark 
                ? ['#1A1A2E', '#16213E'] 
                : ['#F9FAFB', '#E5E7EB']}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                {isDark ? (
                  <View style={styles.iconContainer}>
                    <Ionicons name="moon" size={20} color="#A5B4FC" style={styles.mainIcon} />
                    <Ionicons name="sunny" size={10} color="#FCD34D" style={styles.secondaryIcon} />
                  </View>
                ) : (
                  <View style={styles.iconContainer}>
                    <Ionicons name="sunny" size={20} color="#F59E0B" style={styles.mainIcon} />
                    <Ionicons name="moon" size={10} color="#6B7280" style={styles.secondaryIcon} />
                  </View>
                )}
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarInactiveTintColor: colorScheme === 'dark' ? '#888' : '#888',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: () => <TabBarBackground colorScheme={colorScheme} />,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
            borderTopColor: colorScheme === 'dark' ? '#333' : '#E0E0E0',
            ...(Platform.OS === 'ios' ? {
              position: 'absolute',
            } : {}),
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            tabBarIcon: ({ color }) => <Ionicons name="newspaper" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="ai"
          options={{
            title: 'Ai Assistant',
            tabBarIcon: ({ color }) => <MaterialIcons name="assistant" size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  themeToggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 50,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    position: 'absolute',
  },
  secondaryIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  }
});