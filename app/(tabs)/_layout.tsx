import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Theme storage key
const THEME_PREFERENCE_KEY = 'user-theme-preference';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Toggle between light and dark themes
  const toggleTheme = async () => {
    try {
      const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
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

  return (
    <>
      {/* Theme Toggle Button */}
      <View style={styles.themeToggleContainer}>
        <TouchableOpacity
          style={[
            styles.themeToggleButton,
            { 
              backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
              borderWidth: 1,
              borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
            }
          ]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={colorScheme === 'dark' ? 'sunny' : 'moon'} 
            size={22} 
            color={colorScheme === 'dark' ? '#fff' : '#333'} 
          />
        </TouchableOpacity>
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
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  }
});