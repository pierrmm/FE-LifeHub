import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import tw from 'twrnc';

// Import components
import { FilterTabs } from '@/components/tasks/FilterTabs';
import { ProgressBar } from '@/components/tasks/ProgressBar';
import { TaskChart } from '@/components/tasks/TaskChart';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskItem } from '@/components/tasks/TaskItem';
import { TaskStats } from '@/components/tasks/TaskStats';
import { useTodos } from '@/hooks/useTodos';

export default function TabOneScreen() {
  // Use custom hook for todo management
  const {
    todos,
    filteredTodos,
    loading,
    selectedFilter,
    setSelectedFilter,
    fetchTodos,
    handleSubmit,
    toggleComplete,
    deleteTodo,
    editTodo,
    showForm,
    setShowForm,
    editMode,
    editId
  } = useTodos();

  // Theme
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  // Handle form submission from TaskForm
  const onSubmitTask = (task) => {
    handleSubmit(task);
    setShowForm(false);
  };

  // Handle cancel from TaskForm
  const onCancelTask = () => {
    setShowForm(false);
  };

  // Function to render the add task button
  const renderAddTaskButton = () => (
    <TouchableOpacity
      onPress={() => setShowForm(true)}
      style={[
        tw`absolute bottom-6 right-6 h-14 w-14 rounded-full items-center justify-center z-10`,
        {
          backgroundColor: isDark ? '#6366F1' : '#4F46E5',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }
      ]}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );

  // Get current date information
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = today.toLocaleDateString('en-US', { month: 'long' });
  const dayNumber = today.getDate();

  return (
    <View style={tw`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
       <ParallaxScrollView
        headerBackgroundColor={{ light: '#4F46E5', dark: '#312E81' }}
        headerImage={
          <LinearGradient
            colors={isDark ? ['#312E81', '#4338CA'] : ['#4F46E5', '#6366F1']}
            style={tw`absolute inset-0`}
          >
            <Animated.View
              entering={FadeIn.duration(1000)}
              style={tw`h-full w-full px-5 justify-center`}
            >
              {/* Time and date display */}
              <View style={tw`mb-4 mt-6`}>
                <ThemedText style={tw`text-white text-2xl font-bold`}>
                  {today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
                <ThemedText style={tw`text-white text-sm opacity-80`}>
                  {dayName}, {monthName} {dayNumber}
                </ThemedText>
              </View>
              
              {/* Weekly task chart */}
              <TaskChart 
                completed={taskStats.completed}
                pending={taskStats.pending}
                total={taskStats.total}
                isDark={isDark}
              />
            </Animated.View>
          </LinearGradient>
        }
        minimizeHeaderOnScroll={true}
      >
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
          <TaskStats stats={taskStats} isDark={isDark} />
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          entering={FadeInDown.duration(1000)}
          style={tw`px-3 mb-6`}
        >
          <ProgressBar percentage={progressPercentage} isDark={isDark} />
        </Animated.View>

        {/* Filter Tabs */}
        <FilterTabs
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          isDark={isDark}
        />

        {/* Task Form or Task List */}
        {/* Task Form or Task List */}
        <Animated.View style={tw`px-3 mb-20`}>
          {showForm ? (
            <TaskForm
              onSubmit={onSubmitTask}
              onCancel={onCancelTask}
              editMode={editMode}
              editId={editId}
              fetchTodos={fetchTodos}
              isDark={isDark}
              setShowForm={setShowForm}
            />
          ) : loading ? (
            <ThemedView style={tw`items-center justify-center py-12`}>
              <ActivityIndicator size="large" color={isDark ? '#6366F1' : '#4F46E5'} />
              <ThemedText style={tw`mt-4 text-gray-500 dark:text-gray-400`}>
                Loading tasks...
              </ThemedText>
            </ThemedView>
          ) : filteredTodos.length === 0 ? (
            <Animated.View
              entering={FadeIn.duration(500)}
              style={tw`items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm`}
            >
              <Ionicons
                name="clipboard-outline"
                size={60}
                color={isDark ? '#6B7280' : '#9CA3AF'}
              />
              <ThemedText style={tw`mt-4 text-gray-500 dark:text-gray-400 text-center px-6`}>
                {selectedFilter === 'all'
                  ? "You don't have any tasks yet"
                  : "No tasks found in this category"}
              </ThemedText>
              {selectedFilter === 'all' && (
                <TouchableOpacity
                  style={tw`mt-6 bg-indigo-500 px-6 py-3 rounded-full flex-row items-center`}
                  activeOpacity={0.8}
                  onPress={() => setShowForm(true)}>
                  <Ionicons name="add" size={18} color="#fff" style={tw`mr-2`} />
                  <ThemedText style={tw`text-white font-semibold`}>Add Task</ThemedText>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            [...filteredTodos]
              .sort((a, b) => {
                // Urutkan berdasarkan ID secara descending (ID lebih besar = lebih baru)
                return b.id - a.id;
              })
              .map((todo, index) => (
                <TaskItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleComplete(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onEdit={() => {
                    editTodo(todo);
                    setShowForm(true);
                  }}
                  index={index}
                  isDark={isDark}
                />
              ))
          )}
        </Animated.View>
      </ParallaxScrollView>

      {/* Floating Action Button */}
      {!showForm && renderAddTaskButton()}
    </View>
  );
}