import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

// Theme storage key
const THEME_PREFERENCE_KEY = 'user-theme-preference';

export function useColorScheme(): NonNullable<ColorSchemeName> {
  const systemColorScheme = _useColorScheme() as NonNullable<ColorSchemeName>;
  const [userColorScheme, setUserColorScheme] = useState<ColorSchemeName>(null);

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setUserColorScheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();

    // Set up a listener to check for theme changes every second
    // This is a workaround since AsyncStorage doesn't have a built-in change listener
    const interval = setInterval(loadThemePreference, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Return user preference if set, otherwise system preference
  return (userColorScheme || systemColorScheme) as NonNullable<ColorSchemeName>;
}