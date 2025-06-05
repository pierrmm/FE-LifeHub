import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import tw from 'twrnc';

// Import components
import { FilterTabs } from '@/components/tasks/FilterTabs';

import { MoodSummary } from '@/components/tasks/MoodSummary';
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
    total: todos?.length || 0,
    completed: todos?.filter(todo => todo.completed)?.length || 0,
    pending: todos?.filter(todo => !todo.completed)?.length || 0
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

  // Handle delete confirmation
  const confirmDelete = (id: number) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteTodo(id),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };


  // Delete all tasks
  const deleteAllTasks = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        "Delete All Tasks",
        "Are you sure you want to delete all tasks? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete All",
            style: "destructive",
            onPress: async () => {
              try {
                // Gunakan endpoint yang benar - kemungkinan tidak ada endpoint khusus delete-all
                // Jadi kita akan menghapus satu per satu
                if (todos && todos.length > 0) {
                  // Tampilkan loading indicator
                  Alert.alert("Processing", "Deleting all tasks...");

                  // Hapus semua todo satu per satu
                  for (const todo of todos) {
                    await fetch(`https://25f1-66-96-228-86.ngrok-free.app/api/todos/${todo.id}`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                      },
                    });
                  }

                  console.log('All tasks deleted successfully');
                  // Refresh todos list
                  await fetchTodos();
                  // Show success message
                  Alert.alert("Success", "All tasks have been deleted successfully");
                } else {
                  Alert.alert("Info", "No tasks to delete");
                }
              } catch (error) {
                console.error('Error deleting all tasks:', error);
                Alert.alert("Error", "An error occurred while deleting tasks");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in deleteAllTasks:', error);
      Alert.alert("Error", "An unexpected error occurred");
    }
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

  // Function to render the delete all button
  const renderDeleteAllButton = () => {
    if (!todos || todos.length === 0) return null;

    return (
      <TouchableOpacity
        onPress={deleteAllTasks}  // Panggil deleteAllTasks langsung
        style={[
          tw`absolute bottom-6 left-6 h-14 px-4 rounded-full items-center justify-center z-10 flex-row`,
          {
            backgroundColor: isDark ? '#EF4444' : '#DC2626',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }
        ]}
        activeOpacity={0.8}
      >
        <Ionicons name="trash" size={20} color="#FFFFFF" style={tw`mr-2`} />
        <ThemedText style={tw`text-white font-semibold`}>Delete All</ThemedText>
      </TouchableOpacity>
    );
  };

  const filterNames = {
  'kerja': 'Work',
  'pribadi': 'Personal',
  'belajar': 'Study',
};

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
           {/* Mood Summary - New Component */}
        {!loading && todos.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(900)}
            style={tw`px-3`}
          >
          <MoodSummary todos={todos} isDark={isDark} />
          </Animated.View>
        )}


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
              style={[
                tw`items-center justify-center py-10 mx-2 rounded-3xl`,
                {
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  shadowColor: isDark ? '#000000' : '#6366F1',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 16,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                }
              ]}
            >
              {/* Animated Icon Container */}
              <Animated.View
                entering={FadeIn.delay(200).duration(600)}
                style={[
                  tw`w-24 h-24 rounded-full items-center justify-center mb-6`,
                  {
                    backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    borderWidth: 2,
                    borderColor: isDark ? '#4B5563' : '#E5E7EB',
                  }
                ]}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={48}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </Animated.View>

              {/* Title and Description */}
              <Animated.View
                entering={FadeIn.delay(400).duration(600)}
                style={tw`items-center mb-8`}
              >
                <ThemedText style={[
                  tw`text-xl font-bold mb-2 text-center`,
                  { color: isDark ? '#F9FAFB' : '#111827' }
                ]}>
                  {selectedFilter === 'all' ? 'No Tasks Yet' : 'No Tasks Found'}
                </ThemedText>

                <ThemedText style={[
                  tw`text-center px-8 leading-6`,
                  { color: isDark ? '#9CA3AF' : '#6B7280' }
                ]}>
                  {selectedFilter === 'all'
                    ? "Start organizing your day by creating your first task"
                    : `No tasks found in the "${filterNames[selectedFilter] || selectedFilter}" category`}
                </ThemedText>
              </Animated.View>

              {/* Action Button - Only show for 'all' filter */}
              {selectedFilter === 'all' && (
                <Animated.View entering={FadeIn.delay(600).duration(600)}>
                  <TouchableOpacity
                    style={[
                      tw`px-8 py-4 rounded-2xl flex-row items-center`,
                      {
                        backgroundColor: isDark ? '#6366F1' : '#4F46E5',
                        shadowColor: isDark ? '#6366F1' : '#4F46E5',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setShowForm(true)}
                  >
                    <Animated.View
                      style={[
                        tw`w-6 h-6 rounded-full bg-white bg-opacity-20 items-center justify-center mr-3`,
                      ]}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                    </Animated.View>

                    <ThemedText style={tw`text-white font-semibold text-base`}>
                      Create Your First Task
                    </ThemedText>
                  </TouchableOpacity>
                </Animated.View>
              )}




            </Animated.View>

          ) : (
            <View>
              {filteredTodos.map((todo, index) => (
                <TaskItem
                  key={todo.id}
                  todo={todo}
                  toggleComplete={toggleComplete}
                  deleteTodo={confirmDelete}
                  editTodo={editTodo}
                  onToggle={() => fetchTodos()}
                  onDelete={() => fetchTodos()}
                  onEdit={() => fetchTodos()}
                  isDark={isDark}
                  index={index}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ParallaxScrollView>

      {/* Floating Action Buttons */}
      {!showForm && renderAddTaskButton()}
      {!showForm && renderDeleteAllButton()}
    </View>
  );
}