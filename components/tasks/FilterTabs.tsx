import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { FadeIn, useSharedValue, withSpring } from 'react-native-reanimated';
import tw from 'twrnc';

interface FilterTabsProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  isDark: boolean;
}

export const FilterTabs = ({ selectedFilter, setSelectedFilter, isDark }: FilterTabsProps) => {
  // Get color for each category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pribadi':
        return isDark ? '#60A5FA' : '#2563EB'; 
      case 'kerja':
        return isDark ? '#EF4444' : '#DC2626'; 
      case 'belajar':
        return isDark ? '#34D399' : '#059669'; 
      default:
        return isDark ? '#818CF8' : '#4F46E5'; 
    }
  };

  // Get icon for each category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pribadi':
        return 'person';
      case 'kerja':
        return 'briefcase';
      case 'belajar':
        return 'book';
      default:
        return 'apps';
    }
  };

  // Animation for the selected tab indicator
  const animatedPosition = useSharedValue(0);
  
  useEffect(() => {
    // Update position based on selected filter
    switch (selectedFilter) {
      case 'all':
        animatedPosition.value = withSpring(0);
        break;
      case 'pribadi':
        animatedPosition.value = withSpring(1);
        break;
      case 'kerja':
        animatedPosition.value = withSpring(2);
        break;
      case 'belajar':
        animatedPosition.value = withSpring(3);
        break;
    }
  }, [selectedFilter]);

  // Render a single tab
  const renderTab = (id: string, label: string, index: number) => {
    const isSelected = selectedFilter === id;
    const color = getCategoryColor(id);
    const icon = getCategoryIcon(id);
    
    return (
      <TouchableOpacity
        key={id}
        onPress={() => setSelectedFilter(id)}
        style={[
          tw`py-2.5 px-5 mr-3 rounded-full flex-row items-center`,
          isSelected 
            ? { 
                backgroundColor: color, 
                shadowColor: color, 
                shadowOffset: { width: 0, height: 2 }, 
                shadowOpacity: 0.3, 
                shadowRadius: 3, 
                elevation: 3 
              }
            : { 
                backgroundColor: isDark ? '#1F2937' : '#F3F4F6', 
                borderWidth: 1, 
                borderColor: isDark ? '#374151' : '#E5E7EB' 
              }
        ]}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={isSelected ? '#FFFFFF' : isDark ? '#D1D5DB' : '#6B7280'} 
          style={tw`mr-2`}
        />
        <ThemedText 
          style={[
            tw`font-medium`,
            isSelected 
              ? tw`text-white`
              : isDark ? tw`text-gray-200` : tw`text-gray-700`
          ]}
        >
          {label}
        </ThemedText>
        
        {isSelected && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={[
              tw`h-1.5 w-1.5 rounded-full bg-white ml-2`
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={tw`py-2 px-3`}
      style={tw`mb-4`}
    >
      {renderTab('all', 'All', 0)}
      {renderTab('pribadi', 'Personal', 1)}
      {renderTab('kerja', 'Work', 2)}
      {renderTab('belajar', 'Study', 3)}
    </Animated.ScrollView>
  );
};