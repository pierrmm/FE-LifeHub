import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import tw from 'twrnc';

// Define Todo type
interface Todo {
  id: number;
  title: string;
  category: string;
  due_date: string;
  completed: boolean;
}

export default function TabOneScreen() {
  // State for todos
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // State for form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pribadi');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Theme
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // API base URL
  const API_URL = 'https://90a9-103-47-133-74.ngrok-free.app/api';

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Filter todos when filter or todos change
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredTodos(todos);
    } else {
      setFilteredTodos(todos.filter(todo => todo.category === selectedFilter));
    }
  }, [selectedFilter, todos]);

  // Fetch todos from API
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!title.trim()) return;

    const formattedDate = dueDate.toISOString().split('T')[0];
    
    try {
      if (editMode && editId) {
        // Update existing todo
        await axios.put(`${API_URL}/todos/${editId}`, {
          title,
          category,
          due_date: formattedDate,
          completed: false
        });
      } else {
        // Create new todo
        await axios.post(`${API_URL}/todos`, {
          title,
          category,
          due_date: formattedDate,
          completed: false
        });
      }
      
      // Reset form and fetch updated todos
      setTitle('');
      setCategory('pribadi');
      setDueDate(new Date());
      setEditMode(false);
      setEditId(null);
      setShowForm(false);
      fetchTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  // Toggle todo completion status
  const toggleComplete = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/todos/${id}/toggle-complete`);
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo completion:', error);
    }
  };

  // Delete a todo
  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Edit a todo
  const editTodo = (todo: Todo) => {
    setTitle(todo.title);
    setCategory(todo.category);
    setDueDate(new Date(todo.due_date));
    setEditMode(true);
    setEditId(todo.id);
    setShowForm(true);
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
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

  // Get category color and icon
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'pribadi':
        return {
          color: 'bg-blue-500',
          lightColor: '#3B82F6',
          darkColor: '#2563EB',
          icon: 'person',
          label: 'Personal'
        };
      case 'kerja':
        return {
          color: 'bg-red-500',
          lightColor: '#EF4444',
          darkColor: '#DC2626',
          icon: 'briefcase',
          label: 'Work'
        };
      case 'belajar':
        return {
          color: 'bg-green-500',
          lightColor: '#10B981',
          darkColor: '#059669',
          icon: 'book',
          label: 'Study'
        };
      default:
        return {
          color: 'bg-gray-500',
          lightColor: '#6B7280',
          darkColor: '#4B5563',
          icon: 'list',
          label: 'Task'
        };
    }
  };

  // Calculate task statistics
  const taskStats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length
  };

  // Get progress percentage
  const progressPercentage = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#4F46E5', dark: '#312E81' }}
      headerImage={
        <LinearGradient
          colors={isDark ? ['#312E81', '#4338CA'] : ['#4F46E5', '#6366F1']}
          style={tw`absolute inset-0`}
        >
          <Animated.View
            entering={FadeIn.duration(1000)}
            style={tw`h-full w-full items-center justify-center`}
          />
        </LinearGradient>
      }>
      
      {/* Header Section */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={tw`mb-6 px-3`}
      >
        <ThemedText style={tw`text-3xl font-bold mb-1`}>Task Manager</ThemedText>
        <ThemedText style={tw`text-gray-500 dark:text-gray-400`}>
          Organize your day efficiently
        </ThemedText>
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View 
        entering={FadeInRight.duration(800)}
        style={tw`flex-row justify-between px-3 mb-6`}
      >
        {/* Total Tasks Card */}
        <ThemedView style={[
          tw`w-[32%] p-4 rounded-2xl`,
          {
            backgroundColor: isDark ? '#374151' : '#F3F4F6',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3
          }
        ]}>
          <ThemedView style={tw`bg-indigo-100 dark:bg-indigo-900 w-10 h-10 rounded-full items-center justify-center mb-2`}>
            <Ionicons name="list" size={20} color={isDark ? '#A5B4FC' : '#6366F1'} />
          </ThemedView>
          <ThemedText style={tw`text-2xl font-bold`}>{taskStats.total}</ThemedText>
          <ThemedText style={tw`text-xs text-gray-500 dark:text-gray-400`}>Total Tasks</ThemedText>
        </ThemedView>
        
        {/* Completed Tasks Card */}
        <ThemedView style={[
          tw`w-[32%] p-4 rounded-2xl`,
          {
            backgroundColor: isDark ? '#374151' : '#F3F4F6',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3
          }
        ]}>
          <ThemedView style={tw`bg-green-100 dark:bg-green-900 w-10 h-10 rounded-full items-center justify-center mb-2`}>
            <Ionicons name="checkmark-circle" size={20} color={isDark ? '#6EE7B7' : '#10B981'} />
          </ThemedView>
          <ThemedText style={tw`text-2xl font-bold`}>{taskStats.completed}</ThemedText>
          <ThemedText style={tw`text-xs text-gray-500 dark:text-gray-400`}>Completed</ThemedText>
        </ThemedView>
        
        {/* Pending Tasks Card */}
        <ThemedView style={[
          tw`w-[32%] p-4 rounded-2xl`,
          {
            backgroundColor: isDark ? '#374151' : '#F3F4F6',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3
          }
        ]}>
          <ThemedView style={tw`bg-amber-100 dark:bg-amber-900 w-10 h-10 rounded-full items-center justify-center mb-2`}>
            <Ionicons name="time" size={20} color={isDark ? '#FCD34D' : '#F59E0B'} />
          </ThemedView>
          <ThemedText style={tw`text-2xl font-bold`}>{taskStats.pending}</ThemedText>
                    <ThemedText style={tw`text-xs text-gray-500 dark:text-gray-400`}>Pending</ThemedText>
        </ThemedView>
      </Animated.View>

      {/* Progress Bar */}
      <Animated.View 
        entering={FadeInDown.duration(1000)}
        style={tw`px-3 mb-6`}
      >
        <ThemedView style={tw`flex-row justify-between mb-2`}>
          <ThemedText style={tw`font-medium`}>Task Progress</ThemedText>
          <ThemedText style={tw`font-medium`}>{progressPercentage}%</ThemedText>
        </ThemedView>
        <ThemedView style={[
          tw`h-2 w-full rounded-full`,
          { backgroundColor: isDark ? '#374151' : '#E5E7EB' }
        ]}>
          <ThemedView 
            style={[
              tw`h-2 rounded-full`,
              { 
                width: `${progressPercentage}%`,
                backgroundColor: isDark ? '#2563EB' : '#3B82F6'
              }
            ]}
          />
        </ThemedView>
      </Animated.View>

      {/* Filter Tabs */}
      <ThemedView style={tw`flex-row mb-4 px-3`}>
        <TouchableOpacity
          onPress={() => setSelectedFilter('all')}
          style={[
            tw`py-2 px-4 mr-2 rounded-full`,
            selectedFilter === 'all' 
              ? { backgroundColor: isDark ? '#2563EB' : '#3B82F6' }
              : { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
          ]}
        >
          <ThemedText 
            style={[
              selectedFilter === 'all' 
                ? tw`text-white`
                : tw`text-gray-600 dark:text-gray-300`
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setSelectedFilter('pribadi')}
          style={[
            tw`py-2 px-4 mr-2 rounded-full`,
            selectedFilter === 'pribadi' 
              ? { backgroundColor: isDark ? '#2563EB' : '#3B82F6' }
              : { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
          ]}
        >
          <ThemedText 
            style={[
              selectedFilter === 'pribadi' 
                ? tw`text-white`
                : tw`text-gray-600 dark:text-gray-300`
            ]}
          >
            Personal
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setSelectedFilter('kerja')}
          style={[
            tw`py-2 px-4 mr-2 rounded-full`,
            selectedFilter === 'kerja' 
              ? { backgroundColor: isDark ? '#2563EB' : '#3B82F6' }
              : { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
          ]}
        >
          <ThemedText 
            style={[
              selectedFilter === 'kerja' 
                ? tw`text-white`
                : tw`text-gray-600 dark:text-gray-300`
            ]}
          >
            Work
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setSelectedFilter('belajar')}
          style={[
            tw`py-2 px-4 rounded-full`,
            selectedFilter === 'belajar' 
              ? { backgroundColor: isDark ? '#2563EB' : '#3B82F6' }
              : { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
          ]}
        >
          <ThemedText 
            style={[
              selectedFilter === 'belajar' 
                ? tw`text-white`
                : tw`text-gray-600 dark:text-gray-300`
            ]}
          >
            Study
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Task Form or Task List */}
      <Animated.View style={tw`px-3 mb-20`}>
        {showForm ? (
          <ThemedView style={[
            tw`p-4 rounded-2xl mb-4`,
            {
              backgroundColor: isDark ? '#374151' : '#FFFFFF',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 3
            }
          ]}>
            <ThemedText style={tw`text-lg font-bold mb-4`}>
              {editMode ? 'Edit Task' : 'Add New Task'}
            </ThemedText>
            
            {/* Task Title Input */}
            <ThemedText style={tw`mb-1 font-medium`}>Task Title</ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={[
                tw`p-3 rounded-lg mb-4`,
                {
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                  color: isDark ? '#E5E7EB' : '#1F2937'
                }
              ]}
            />
            
            {/* Category Picker */}
            <ThemedText style={tw`mb-1 font-medium`}>Category</ThemedText>
            <View style={[
              tw`mb-4 rounded-lg overflow-hidden`,
              {
                backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
              }
            ]}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={{
                  color: isDark ? '#E5E7EB' : '#1F2937',
                }}
                dropdownIconColor={isDark ? '#E5E7EB' : '#1F2937'}
              >
                <Picker.Item label="Personal" value="pribadi" />
                <Picker.Item label="Work" value="kerja" />
                <Picker.Item label="Study" value="belajar" />
              </Picker>
            </View>
            
            {/* Due Date Picker */}
            <ThemedText style={tw`mb-1 font-medium`}>Due Date</ThemedText>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                tw`p-3 rounded-lg mb-4 flex-row justify-between items-center`,
                {
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                }
              ]}
            >
              <ThemedText>{formatDate(dueDate.toISOString())}</ThemedText>
              <Ionicons name="calendar" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            
            {/* Form Buttons */}
            <ThemedView style={tw`flex-row justify-end mt-2`}>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                style={tw`py-2 px-4 mr-2 rounded-lg bg-gray-300 dark:bg-gray-600`}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSubmit}
                style={tw`py-2 px-4 rounded-lg bg-blue-500`}
              >
                <ThemedText style={tw`text-white`}>
                  {editMode ? 'Update' : 'Add Task'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ) : (
          <Animated.View entering={FadeIn.duration(500)}>
            {loading ? (
              <ThemedView style={tw`items-center justify-center py-10`}>
                <ActivityIndicator size="large" color={isDark ? '#2563EB' : '#3B82F6'} />
                <ThemedText style={tw`mt-4`}>Loading tasks...</ThemedText>
              </ThemedView>
            ) : filteredTodos.length === 0 ? (
              <ThemedView style={tw`items-center justify-center py-10`}>
                <Ionicons name="document-text-outline" size={60} color={isDark ? '#4B5563' : '#9CA3AF'} />
                <ThemedText style={tw`mt-4 text-lg font-medium text-gray-500 dark:text-gray-400`}>
                  No tasks found
                </ThemedText>
                <ThemedText style={tw`text-center text-gray-500 dark:text-gray-400 mt-2`}>
                  {selectedFilter === 'all' 
                    ? 'Add a new task to get started' 
                    : 'Try selecting a different category'}
                </ThemedText>
              </ThemedView>
            ) : (
              filteredTodos.map((todo) => {
                const categoryInfo = getCategoryInfo(todo.category);
                
                return (
                  <Animated.View 
                    key={todo.id}
                    entering={FadeInDown.duration(400).delay(todo.id * 100 % 500)}
                    style={[
                      tw`mb-4 rounded-2xl overflow-hidden`,
                      {
                        backgroundColor: isDark ? '#374151' : '#FFFFFF',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0.3 : 0.1,
                        shadowRadius: 4,
                        elevation: 3
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[isDark ? categoryInfo.darkColor : categoryInfo.lightColor, 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0.05, y: 0 }}
                      style={tw`flex-row items-center p-4`}
                    >
                      {/* Task Checkbox */}
                      <TouchableOpacity
                        onPress={() => toggleComplete(todo.id)}
                        style={[
                          tw`w-6 h-6 rounded-full mr-3 items-center justify-center border-2`,
                          todo.completed 
                            ? { backgroundColor: isDark ? categoryInfo.darkColor : categoryInfo.lightColor, borderColor: 'transparent' }
                            : { borderColor: isDark ? categoryInfo.darkColor : categoryInfo.lightColor }
                        ]}
                      >
                        {todo.completed && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                      
                      {/* Task Content */}
                      <ThemedView style={tw`flex-1`}>
                        <ThemedText 
                          style={[
                            tw`font-medium text-base`,
                            todo.completed && tw`line-through text-gray-400 dark:text-gray-500`
                          ]}
                          numberOfLines={1}
                        >
                                                    {todo.title}
                        </ThemedText>
                        <ThemedView style={tw`flex-row items-center mt-1`}>
                          <ThemedView 
                            style={[
                              tw`px-2 py-1 rounded-full mr-3 flex-row items-center`,
                              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                            ]}
                          >
                            <Ionicons 
                              name={categoryInfo.icon} 
                              size={12} 
                              color={isDark ? categoryInfo.darkColor : categoryInfo.lightColor} 
                              style={tw`mr-1`}
                            />
                            <ThemedText style={tw`text-xs text-gray-500 dark:text-gray-400`}>
                              {categoryInfo.label}
                            </ThemedText>
                          </ThemedView>
                          
                          <ThemedView style={tw`flex-row items-center`}>
                            <Ionicons 
                              name="calendar-outline" 
                              size={12} 
                              color={isDark ? '#9CA3AF' : '#6B7280'} 
                              style={tw`mr-1`}
                            />
                            <ThemedText style={tw`text-xs text-gray-500 dark:text-gray-400`}>
                              {formatDate(todo.due_date)}
                            </ThemedText>
                          </ThemedView>
                        </ThemedView>
                      </ThemedView>
                      
                      {/* Task Actions */}
                      <ThemedView style={tw`flex-row`}>
                        <TouchableOpacity
                          onPress={() => editTodo(todo)}
                          style={tw`p-2 mr-1`}
                        >
                          <Ionicons name="pencil" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => deleteTodo(todo.id)}
                          style={tw`p-2`}
                        >
                          <Ionicons name="trash-bin" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                      </ThemedView>
                    </LinearGradient>
                  </Animated.View>
                );
              })
            )}
            
            {/* Add Task Button */}
            <TouchableOpacity
              onPress={() => {
                setTitle('');
                setCategory('pribadi');
                setDueDate(new Date());
                setEditMode(false);
                setEditId(null);
                setShowForm(true);
              }}
              style={[
                tw`h-14 w-14 rounded-full items-center justify-center absolute bottom-0 right-0`,
                { backgroundColor: isDark ? '#2563EB' : '#3B82F6' },
                {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5
                }
              ]}
            >
              <Ionicons name="add" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </ParallaxScrollView>
  );
}