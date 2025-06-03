import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import tw from 'twrnc';

interface TaskStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
  isDark: boolean;
}

export const TaskStats = ({ stats, isDark }: TaskStatsProps) => {
  // Define card styles directly
  const cardStyle = {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3
  };

  // Define icon container styles
  const iconContainerStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
    backgroundColor: isDark ? '#111827' : '#F3F4F6'
  };

  return (
    <>
      {/* Total Tasks */}
      <View 
        style={[
          tw`p-4 rounded-xl flex-1 mr-2`,
          cardStyle
        ]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View 
            style={[
              iconContainerStyle,
              { backgroundColor: isDark ? '#111827' : '#F3F4F6' }
            ]}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={isDark ? '#9CA3AF' : '#6B7280'} 
            />
          </View>
          <ThemedText style={tw`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{stats.total}</ThemedText>
        </View>
        <ThemedText style={tw`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Tasks</ThemedText>
      </View>
      
      {/* Completed Tasks */}
      <View 
        style={[
          tw`p-4 rounded-xl flex-1 mr-2`,
          cardStyle
        ]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View 
            style={[
              iconContainerStyle,
              { backgroundColor: isDark ? '#111827' : '#D1FAE5' }
            ]}
          >
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={isDark ? '#10B981' : '#059669'} 
            />
          </View>
          <ThemedText style={tw`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{stats.completed}</ThemedText>
        </View>
        <ThemedText style={tw`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed</ThemedText>
      </View>
      
      {/* Pending Tasks */}
      <View 
        style={[
          tw`p-4 rounded-xl flex-1`,
          cardStyle
        ]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View 
            style={[
              iconContainerStyle,
              { backgroundColor: isDark ? '#111827' : '#FEE2E2' }
            ]}
          >
            <Ionicons 
              name="time" 
              size={20} 
              color={isDark ? '#EF4444' : '#DC2626'} 
            />
          </View>
          <ThemedText style={tw`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{stats.pending}</ThemedText>
        </View>
        <ThemedText style={tw`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</ThemedText>
      </View>
    </>
  );
};