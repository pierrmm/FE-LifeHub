import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import tw from 'twrnc';

interface MoodSummaryProps {
  todos: {
    id: number;
    title: string;
    category: string;
    due_date: string;
    completed: boolean;
    mood?: string;
  }[];
  isDark: boolean;
}

export const MoodSummary = ({ todos, isDark }: MoodSummaryProps) => {
  // Count occurrences of each mood (only for incomplete tasks)
  const moodCounts: Record<string, number> = {};
  let totalMoods = 0;

  // Filter out completed tasks before counting moods
  todos.forEach(todo => {
    // Only count moods for incomplete tasks
    if (todo.mood && !todo.completed) {
      moodCounts[todo.mood] = (moodCounts[todo.mood] || 0) + 1;
      totalMoods++;
    }
  });

  // Find the most frequent mood
  let mostFrequentMood: string | null = null;
  let highestCount = 0;

  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > highestCount) {
      mostFrequentMood = mood;
      highestCount = count;
    }
  });

  // If no moods found in incomplete tasks
  if (!mostFrequentMood || totalMoods === 0) {
    return null;
  }

  // Calculate percentage
  const percentage = Math.round((highestCount / totalMoods) * 100);

  // Get mood information
  const getMoodInfo = (mood: string) => {
    switch (mood) {
      case 'senang':
        return {
          label: 'Happy',
          icon: 'happy',
          color: '#F59E0B',
          gradient: isDark ? ['#92400E', '#B45309'] : ['#FEF3C7', '#FDE68A'],
          textColor: isDark ? '#FBBF24' : '#92400E'
        };
      case 'sedih':
        return {
          label: 'Sad',
          icon: 'sad',
          color: '#3B82F6',
          gradient: isDark ? ['#1E3A8A', '#2563EB'] : ['#EFF6FF', '#DBEAFE'],
          textColor: isDark ? '#60A5FA' : '#1E40AF'
        };
      case 'stress':
        return {
          label: 'Stressed',
          icon: 'flame',
          color: '#EF4444',
          gradient: isDark ? ['#7F1D1D', '#B91C1C'] : ['#FEF2F2', '#FEE2E2'],
          textColor: isDark ? '#F87171' : '#B91C1C'
        };
      default:
        return {
          label: 'Unknown',
          icon: 'help-circle',
          color: '#6B7280',
          gradient: isDark ? ['#374151', '#4B5563'] : ['#F9FAFB', '#F3F4F6'],
          textColor: isDark ? '#9CA3AF' : '#4B5563'
        };
    }
  };

  const moodInfo = getMoodInfo(mostFrequentMood);

  return (
    <Animated.View 
      entering={FadeIn.duration(800)}
      style={tw`mb-6`}
    >
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <ThemedText style={tw`font-medium text-base`}>Your Mood Summary</ThemedText>
        
        {/* Task count moved outside the card */}
        <View style={tw`flex-row items-center`}>
          <Ionicons 
            name="clipboard-outline" 
            size={16} 
            color={isDark ? '#9CA3AF' : '#6B7280'} 
            style={tw`mr-1`}
          />
          <ThemedText style={tw`text-sm text-gray-500 dark:text-gray-400`}>
            {highestCount} pending tasks
          </ThemedText>
        </View>
      </View>
      
      <LinearGradient
        colors={moodInfo.gradient}
        style={[
          tw`rounded-2xl p-4`,
          {
            shadowColor: moodInfo.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.15,
            shadowRadius: 8,
            elevation: 5
          }
        ]}
      >
        <View style={tw`flex-row items-center`}>
          <View 
            style={[
              tw`w-12 h-12 rounded-full items-center justify-center mr-4`,
              { backgroundColor: `${moodInfo.color}30` }
            ]}
          >
            <Ionicons 
              name={moodInfo.icon as any} 
              size={28} 
              color={moodInfo.color} 
            />
          </View>
          
          <View style={tw`flex-1`}>
            <ThemedText 
              style={[
                tw`text-lg font-bold mb-1`,
                { color: moodInfo.textColor }
              ]}
            >
              Mostly {moodInfo.label}
            </ThemedText>
            
            <ThemedText 
              style={[
                tw`text-sm`,
                { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }
              ]}
            >
              {percentage}% of your pending tasks have this mood
            </ThemedText>
          </View>
        </View>
        
        <View style={tw`mt-4 bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden`}>
          <View 
            style={[
              tw`h-full rounded-full`,
              { 
                width: `${percentage}%`,
                backgroundColor: moodInfo.color
              }
            ]}
          />
        </View>
        
        <View style={tw`flex-row justify-between mt-2`}>
          <ThemedText style={tw`text-xs opacity-70`}>0%</ThemedText>
          <ThemedText style={tw`text-xs opacity-70`}>100%</ThemedText>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};