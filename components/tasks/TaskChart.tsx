import { ThemedText } from '@/components/ThemedText';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import tw from 'twrnc';

interface TaskChartProps {
  completed: number;
  pending: number;
  total: number;
  isDark: boolean;
}

interface DailyTaskData {
  day: string;
  completed: number;
  pending: number;
}

export const TaskChart = ({ completed, pending, total, isDark }: TaskChartProps) => {
  const [chartData, setChartData] = useState<DailyTaskData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get day of week for chart labels
  const getDayLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    // Return last 5 days including today
    return Array(5).fill(0).map((_, i) => {
      const dayIndex = (today - 4 + i + 7) % 7;
      return days[dayIndex];
    });
  };
  
  // Mock data for the chart - use this when API fails
  const generateMockData = () => {
    const days = getDayLabels();
    return days.map((day, index) => {
      // Only use the actual data for today (the last day)
      if (index === days.length - 1) {
        return { day, completed, pending };
      }
      // Generate some random data for other days
      return { 
        day, 
        completed: Math.floor(Math.random() * 5), 
        pending: Math.floor(Math.random() * 3) 
      };
    });
  };
  
  // Fetch task data for the last 5 days
  useEffect(() => {
    const fetchTaskHistory = async () => {
      setLoading(true);
      try {
        // Use mock data for now since the API is returning 404 errors
        const mockData = generateMockData();
        setChartData(mockData);
      } catch (error) {
        console.error('Error generating chart data:', error);
        // If there's an error, create default data using today's stats
        const days = getDayLabels();
        const defaultData = days.map((day, index) => {
          // Only use the actual data for today (the last day)
          if (index === 4) {
            return { day, completed, pending };
          }
          return { day, completed: 0, pending: 0 };
        });
        setChartData(defaultData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskHistory();
  }, [completed, pending]); // Re-fetch when today's data changes
  
  const dayLabels = getDayLabels();
  
  // Use actual chart data or fallback to empty data while loading
  const displayData = chartData.length > 0 ? chartData : dayLabels.map(day => ({ 
    day, 
    completed: 0, 
    pending: 0 
  }));
  
  // Find the maximum total tasks to normalize bar heights
  const maxTotal = Math.max(
    ...displayData.map(data => data.completed + data.pending),
    1 // Ensure we don't divide by zero
  );
  
  return (
    <Animated.View 
      entering={FadeIn.duration(800).delay(300)}
      style={tw`mt-4 mb-2`}
    >
      <View style={tw`flex-row items-end justify-between h-24`}>
        {displayData.map((data, index) => {
          const isToday = index === displayData.length - 1;
          const totalTasks = data.completed + data.pending;
          
          // Calculate heights as a percentage of the maximum total
          const totalBarHeight = Math.max((totalTasks / maxTotal) * 80, 10); // 80 is max height in pixels
          const completedHeight = totalTasks > 0 
            ? (data.completed / totalTasks) * totalBarHeight 
            : 0;
          const pendingHeight = totalBarHeight - completedHeight;
          
          return (
            <View key={index} style={tw`items-center`}>
              <View style={tw`relative w-8 mb-2`}>
                {/* Container for the stacked bar */}
                <View style={tw`relative h-20 w-full justify-end`}>
                  {/* Pending tasks (top part of the bar) */}
                  {pendingHeight > 0 && (
                    <View 
                      style={[
                        tw`w-full rounded-t-md`,
                        {
                          height: pendingHeight,
                          backgroundColor: isToday 
                            ? (isDark ? '#EF4444' : '#F87171') 
                            : (isDark ? '#6B7280' : '#D1D5DB'),
                          opacity: isToday ? 1 : 0.7
                        }
                      ]}
                    />
                  )}
                  
                  {/* Completed tasks (bottom part of the bar) */}
                  {completedHeight > 0 && (
                    <View 
                      style={[
                        tw`w-full ${pendingHeight > 0 ? '' : 'rounded-t-md'}`,
                        {
                          height: completedHeight,
                          backgroundColor: isToday 
                            ? (isDark ? '#10B981' : '#34D399') 
                            : (isDark ? '#6366F1' : '#818CF8'),
                          opacity: isToday ? 1 : 0.7
                        }
                      ]}
                    />
                  )}
                  
                  {/* Empty state - show a thin line if no tasks */}
                  {totalTasks === 0 && (
                    <View 
                      style={[
                        tw`w-full h-1 rounded-md`,
                        {
                          backgroundColor: isDark ? '#4B5563' : '#9CA3AF',
                          opacity: 0.5
                        }
                      ]}
                    />
                  )}
                </View>
              </View>
              
              {/* Day label */}
              <ThemedText 
                style={tw`text-xs ${isToday ? 'font-bold text-white' : 'text-white/70'}`}
              >
                {data.day}
              </ThemedText>
            </View>
          );
        })}
      </View>
      
      {/* Legend */}
      <View style={tw`flex-row justify-center mt-2`}>
        <View style={tw`flex-row items-center mr-4`}>
          <View 
            style={[
              tw`w-3 h-3 rounded-sm mr-1`,
              { backgroundColor: isDark ? '#10B981' : '#34D399' }
            ]}
          />
          <ThemedText style={tw`text-xs text-white/80`}>Completed</ThemedText>
        </View>
        
        <View style={tw`flex-row items-center`}>
          <View 
            style={[
              tw`w-3 h-3 rounded-sm mr-1`,
              { backgroundColor: isDark ? '#EF4444' : '#F87171' }
            ]}
          />
          <ThemedText style={tw`text-xs text-white/80`}>Pending</ThemedText>
        </View>
      </View>
    </Animated.View>
  );
};