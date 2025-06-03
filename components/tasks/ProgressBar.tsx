import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import tw from 'twrnc';

interface ProgressBarProps {
  percentage: number;
  isDark: boolean;
}

export const ProgressBar = ({ percentage, isDark }: ProgressBarProps) => {
  // Animated value for progress width
  const progressWidth = useSharedValue(0);
  
  // Update progress width with animation when percentage changes
  useEffect(() => {
    progressWidth.value = withSpring(percentage, {
      damping: 15,
      stiffness: 100,
    });
  }, [percentage]);
  
  // Animated style for the progress bar
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });
  
  // Determine color based on progress percentage
  const getProgressColor = () => {
    if (percentage < 30) {
      return isDark ? '#EF4444' : '#DC2626'; // Red for low progress
    } else if (percentage < 70) {
      return isDark ? '#F59E0B' : '#D97706'; // Amber for medium progress
    } else {
      return isDark ? '#10B981' : '#059669'; // Green for high progress
    }
  };
  
  // Get progress status text
  const getProgressStatus = () => {
    if (percentage < 30) {
      return "Just Started";
    } else if (percentage < 70) {
      return "In Progress";
    } else if (percentage < 100) {
      return "Almost Done";
    } else {
      return "Completed";
    }
  };

  return (
    <>
      <ThemedView style={tw`flex-row justify-between mb-2`}>
        <ThemedView style={tw`flex-row items-center`}>
          <ThemedText style={tw`font-medium text-base`}>Task Progress</ThemedText>
          <View 
            style={[
              tw`ml-2 px-2 py-0.5 rounded-full`,
              { backgroundColor: getProgressColor() + '20' } // Semi-transparent background
            ]}
          >
            <ThemedText 
              style={[
                tw`text-xs font-medium`,
                { color: getProgressColor() }
              ]}
            >
              {getProgressStatus()}
            </ThemedText>
          </View>
        </ThemedView>
        <ThemedText 
          style={[
            tw`font-bold text-base`,
            { color: getProgressColor() }
          ]}
        >
          {percentage}%
        </ThemedText>
      </ThemedView>
      
      {/* Progress bar background */}
      <ThemedView 
        style={[
          tw`h-3 w-full rounded-full overflow-hidden`,
          { 
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.2 : 0.1,
            shadowRadius: 2,
            elevation: 2
          }
        ]}
      >
        {/* Progress indicator with animation */}
        <Animated.View 
          style={[
            tw`h-3 rounded-full`,
            animatedStyle,
            { backgroundColor: getProgressColor() }
          ]}
        >
       
        </Animated.View>
      </ThemedView>
    </>
  );
};