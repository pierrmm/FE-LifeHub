import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import tw from 'twrnc';

// Define Todo type
interface Todo {
  id: number;
  title: string;
  category: string;
  due_date: string;
  completed: boolean;
}

interface TaskItemProps {
  todo: Todo;
  toggleComplete?: (id: number) => Promise<void>;
  deleteTodo?: (id: number) => Promise<void>;
  editTodo?: (todo: Todo) => void;
  onToggle?: (id: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (todo: Todo) => void;
  isDark: boolean;
  index?: number;
}

export const TaskItem = ({ 
  todo, 
  toggleComplete, 
  deleteTodo, 
  editTodo, 
  onToggle, 
  onDelete, 
  onEdit,
  isDark, 
  index = 0 
}: TaskItemProps) => {
  // Animation values
  const scale = useSharedValue(1);
  const checkboxScale = useSharedValue(1);
  
  // Get category color and icon
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'pribadi':
        return {
          color: 'bg-blue-500',
          lightColor: '#3B82F6',
          darkColor: '#2563EB',
          icon: 'person',
          label: 'Personal',
          gradientLight: ['#60A5FA10', '#3B82F605'],
          gradientDark: ['#3B82F615', '#1D4ED805']
        };
      case 'kerja':
        return {
          color: 'bg-red-500',
          lightColor: '#EF4444',
          darkColor: '#DC2626',
          icon: 'briefcase',
          label: 'Work',
          gradientLight: ['#F8717110', '#EF444405'],
          gradientDark: ['#EF444415', '#B91C1C05']
        };
      case 'belajar':
        return {
          color: 'bg-green-500',
          lightColor: '#10B981',
          darkColor: '#059669',
          icon: 'book',
          label: 'Study',
          gradientLight: ['#34D39910', '#10B98105'],
          gradientDark: ['#10B98115', '#04785705']
        };
      default:
        return {
          color: 'bg-gray-500',
          lightColor: '#6B7280',
          darkColor: '#4B5563',
          icon: 'list',
          label: 'Task',
          gradientLight: ['#9CA3AF10', '#6B728005'],
          gradientDark: ['#6B728015', '#37415105']
        };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if task is overdue
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return !todo.completed && dueDate < today;
  };

  const categoryInfo = getCategoryInfo(todo.category);
  const overdue = isOverdue();
  
  // Calculate days remaining or overdue
  const getDaysStatus = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (todo.completed) return null;
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    }
    return null;
  };
  
  const daysStatus = getDaysStatus();
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkboxScale.value }]
    };
  });

  // Handle press in
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10, stiffness: 300 });
  };

  // Handle press out
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };
  
  // Handle checkbox animation
  const handleCheckboxPress = async () => {
    checkboxScale.value = withTiming(1.2, { duration: 100 }, () => {
      checkboxScale.value = withTiming(1, { duration: 100 });
    });
    
    // Use either toggleComplete or onToggle, whichever is provided
    if (toggleComplete) {
      await toggleComplete(todo.id);
    } else if (onToggle) {
      await onToggle(todo.id);
    }
  };

  // Handle edit task
  const handleEditTask = () => {
    if (editTodo) {
      editTodo(todo);
    } else if (onEdit) {
      onEdit(todo);
    }
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    if (deleteTodo) {
      await deleteTodo(todo.id);
    } else if (onDelete) {
      await onDelete(todo.id);
    }
  };
  
  return (
    // Outer wrapper for entrance animation
    <Animated.View 
      entering={FadeInDown.duration(400).delay(index * 100 % 500)}
      style={tw`mb-4`}
    >
      {/* Inner wrapper for scale animation */}
      <Animated.View
        style={[
          animatedStyle,
          tw`rounded-2xl overflow-hidden`,
          {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 5
          }
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
        >
          <View style={tw`p-4`}>
            {/* Category indicator strip */}
            <View 
              style={[
                tw`absolute left-0 top-0 bottom-0 w-1.5`,
                { backgroundColor: isDark ? categoryInfo.darkColor : categoryInfo.lightColor }
              ]} 
            />
            
            <View style={tw`flex-row items-center`}>
              {/* Task Checkbox with improved animation */}
              <Animated.View style={checkboxAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleCheckboxPress}
                  style={[
                    tw`w-7 h-7 rounded-full mr-4 items-center justify-center border-2`,
                    todo.completed 
                      ? { 
                          backgroundColor: isDark ? categoryInfo.darkColor : categoryInfo.lightColor, 
                          borderColor: 'transparent',
                        }
                      : { 
                          borderColor: isDark ? categoryInfo.darkColor : categoryInfo.lightColor,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                        }
                  ]}
                  activeOpacity={0.7}
                >
                  {todo.completed && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>
              
              {/* Task Content with improved layout */}
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center`}>
                  <ThemedText 
                    style={[
                      tw`font-medium text-base flex-1`,
                      todo.completed && tw`line-through text-gray-400 dark:text-gray-500`,
                      overdue && !todo.completed && tw`text-red-500 dark:text-red-400`
                    ]}
                    numberOfLines={1}
                  >
                    {todo.title}
                  </ThemedText>
                  
                  {/* Category badge with improved design */}
                  <View 
                    style={[
                      tw`px-2 py-1 rounded-full ml-2 flex-row items-center`,
                      { backgroundColor: isDark ? `${categoryInfo.darkColor}30` : `${categoryInfo.lightColor}15` }
                    ]}
                  >
                    <Ionicons 
                      name={categoryInfo.icon as any} 
                      size={12} 
                      color={isDark ? categoryInfo.darkColor : categoryInfo.lightColor} 
                      style={tw`mr-1`}
                    />
                    <ThemedText 
                      style={[
                        tw`text-xs font-medium`,
                        { color: isDark ? categoryInfo.darkColor : categoryInfo.lightColor }
                      ]}
                    >
                      {categoryInfo.label}
                    </ThemedText>
                  </View>
                </View>
                
                {/* Date and status indicators */}
                <View style={tw`flex-row items-center mt-2`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons 
                      name="calendar-outline" 
                      size={14} 
                      color={overdue ? (isDark ? '#F87171' : '#EF4444') : (isDark ? '#9CA3AF' : '#6B7280')} 
                      style={tw`mr-1`}
                    />
                                       <ThemedText 
                      style={[
                        tw`text-xs`,
                        overdue && !todo.completed && tw`text-red-500 dark:text-red-400`
                      ]}
                    >
                      {formatDate(todo.due_date)}
                    </ThemedText>
                  </View>
                  
                  {/* Days status indicator */}
                  {daysStatus && (
                    <View 
                      style={[
                        tw`ml-3 px-2 py-0.5 rounded-full flex-row items-center`,
                        overdue 
                          ? tw`bg-red-100 dark:bg-red-900/30` 
                          : daysStatus === "Due today" 
                            ? tw`bg-yellow-100 dark:bg-yellow-900/30`
                            : tw`bg-blue-100 dark:bg-blue-900/30`
                      ]}
                    >
                      <ThemedText 
                        style={[
                          tw`text-xs font-medium`,
                          overdue 
                            ? tw`text-red-600 dark:text-red-400` 
                            : daysStatus === "Due today" 
                              ? tw`text-yellow-600 dark:text-yellow-400`
                              : tw`text-blue-600 dark:text-blue-400`
                        ]}
                      >
                        {daysStatus}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </View>
            
            {/* Action buttons */}
            <View style={tw`flex-row justify-end mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <TouchableOpacity
                style={tw`flex-row items-center mr-6`}
                onPress={handleEditTask}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="pencil" 
                  size={16} 
                  color={isDark ? '#60A5FA' : '#3B82F6'} 
                  style={tw`mr-1`}
                />
                <ThemedText style={tw`text-xs font-medium text-blue-500 dark:text-blue-400`}>
                  Edit
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={tw`flex-row items-center`}
                onPress={handleDeleteTask}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="trash-outline" 
                  size={16} 
                  color={isDark ? '#F87171' : '#EF4444'} 
                  style={tw`mr-1`}
                />
                <ThemedText style={tw`text-xs font-medium text-red-500 dark:text-red-400`}>
                  Delete
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};