import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import tw from 'twrnc';

// API URL
const API_URL = 'https://25f1-66-96-228-86.ngrok-free.app/api';

interface TaskFormProps {
  onSubmit: (task: any) => void;
  onCancel: () => void;
  editMode: boolean;
  editId: number | null;
  fetchTodos: () => void;
  isDark: boolean;
  setShowForm: (show: boolean) => void;
}

export const TaskForm = ({ 
  onSubmit, 
  onCancel, 
  editMode, 
  editId, 
  fetchTodos, 
  isDark,
  setShowForm 
}: TaskFormProps) => {
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pribadi');
  const [mood, setMood] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditOperation, setIsEditOperation] = useState(false);

  // Fetch task details if in edit mode
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (editMode && editId) {
        try {
          const response = await axios.get(`${API_URL}/todos/${editId}`);
          const task = response.data.data;
          
          setTitle(task.title);
          setCategory(task.category);
          setMood(task.mood || null);
          
          // Parse date string to Date object
          const date = new Date(task.due_date);
          setDueDate(date);
          
          // Set edit operation flag
          setIsEditOperation(true);
        } catch (error) {
          console.error('Error fetching task details:', error);
        }
      } else {
        // Reset form for new task
        setTitle('');
        setCategory('pribadi');
        setMood(null);
        setDueDate(new Date());
        setIsEditOperation(false);
      }
    };
    
    fetchTaskDetails();
  }, [editMode, editId]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  // Get category data for UI
  const getCategoryData = (cat: string) => {
    switch (cat) {
      case 'pribadi':
        return {
          color: '#3B82F6',
          icon: 'person',
          label: 'Personal'
        };
      case 'kerja':
        return {
          color: '#EF4444',
          icon: 'briefcase',
          label: 'Work'
        };
      case 'belajar':
        return {
          color: '#10B981',
          icon: 'book',
          label: 'Study'
        };
      default:
        return {
          color: '#6B7280',
          icon: 'list',
          label: 'Task'
        };
    }
  };

  // Get mood data for UI
  const getMoodData = (moodType: string) => {
    switch (moodType) {
      case 'senang':
        return {
          color: '#F59E0B',
          icon: 'happy',
          label: 'Happy'
        };
      case 'sedih':
        return {
          color: '#3B82F6',
          icon: 'sad',
          label: 'Sad'
        };
      case 'stress':
        return {
          color: '#EF4444',
          icon: 'flame',
          label: 'Stressed'
        };
      default:
        return {
          color: '#6B7280',
          icon: 'help-circle',
          label: 'Unknown'
        };
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
      // Show alert for title length
      Alert.alert(
        "Invalid Title",
        "Task title must be at least 3 characters long.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare task data
      const taskData = {
        title: title.trim(),
        category,
        mood,
        dueDate: dueDate.toISOString().split('T')[0],
      };
      
      // Only include ID if we're editing
      if (isEditOperation && editId) {
        onSubmit({ ...taskData, id: editId });
      } else {
        onSubmit(taskData);
      }
      
      // Reset form
      setTitle('');
      setCategory('pribadi');
      setMood(null);
      setDueDate(new Date());
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setTitle('');
    setCategory('pribadi');
    setMood(null);
    setDueDate(new Date());
    setErrors({});
    onCancel();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        tw`p-5 rounded-2xl mb-4`,
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
      <View style={tw`mb-2`}>
        <ThemedText style={tw`text-xl font-bold mb-4`}>
          {isEditOperation ? 'Edit Task' : 'Add New Task'}
        </ThemedText>
        
        {/* Task Title Input */}
        <Animated.View entering={FadeIn.delay(100)}>
          <View style={tw`mb-4 w-full`}>
            <ThemedText style={[
              tw`mb-2 font-semibold`,
              { color: isDark ? '#E5E7EB' : '#374151' }
            ]}>
              Task Title*
            </ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={[
                tw`px-4 py-3 rounded-xl border text-base`,
                {
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  borderColor: errors.title ? '#EF4444' : isDark ? '#4B5563' : '#E5E7EB',
                  color: isDark ? '#E5E7EB' : '#1F2937'
                }
              ]}
              maxLength={100}
            />
            {errors.title ? (
              <ThemedText style={tw`text-red-500 text-xs mt-1`}>
                {errors.title}
              </ThemedText>
            ) : null}
          </View>
        </Animated.View>
        
        {/* Category Selection */}
        <Animated.View entering={FadeIn.delay(200)}>
          <View style={tw`mb-4 w-full`}>
            <ThemedText style={[
              tw`mb-2 font-semibold`,
              { color: isDark ? '#E5E7EB' : '#374151' }
            ]}>
              Category*
            </ThemedText>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {['pribadi', 'kerja', 'belajar'].map((cat) => {
                const catData = getCategoryData(cat);
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      tw`flex-row items-center px-3 py-2 rounded-xl border`,
                      {
                        backgroundColor: isSelected 
                          ? `${catData.color}20` 
                          : isDark ? '#374151' : '#F9FAFB',
                        borderColor: isSelected 
                          ? catData.color 
                          : isDark ? '#4B5563' : '#E5E7EB',
                      }
                    ]}
                  >
                    <Ionicons 
                      name={catData.icon as any} 
                      size={16} 
                      color={catData.color} 
                      style={tw`mr-2`}
                    />
                    <ThemedText 
                      style={[
                        tw`font-medium`,
                        isSelected 
                          ? { color: catData.color } 
                          : { color: isDark ? '#E5E7EB' : '#374151' }
                      ]}
                    >
                      {catData.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.category ? (
              <ThemedText style={tw`text-red-500 text-xs mt-1`}>
                {errors.category}
              </ThemedText>
            ) : null}
          </View>
        </Animated.View>
        
        {/* Mood Selection */}
        <Animated.View entering={FadeIn.delay(300)}>
          <View style={tw`mb-4 w-full`}>
            <ThemedText style={[
              tw`mb-2 font-semibold`,
              { color: isDark ? '#E5E7EB' : '#374151' }
            ]}>
              Mood (Optional)
            </ThemedText>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {['senang', 'sedih', 'stress'].map((moodType) => {
                const moodData = getMoodData(moodType);
                const isSelected = mood === moodType;
                return (
                  <TouchableOpacity
                    key={moodType}
                    onPress={() => setMood(isSelected ? null : moodType)}
                    style={[
                      tw`flex-row items-center px-3 py-2 rounded-xl border`,
                      {
                        backgroundColor: isSelected 
                          ? `${moodData.color}20` 
                          : isDark ? '#374151' : '#F9FAFB',
                        borderColor: isSelected 
                          ? moodData.color 
                          : isDark ? '#4B5563' : '#E5E7EB',
                      }
                    ]}
                  >
                    <Ionicons 
                      name={moodData.icon as any} 
                      size={16} 
                      color={moodData.color} 
                      style={tw`mr-2`}
                    />
                                        <ThemedText 
                      style={[
                        tw`font-medium`,
                        isSelected 
                          ? { color: moodData.color } 
                          : { color: isDark ? '#E5E7EB' : '#374151' }
                      ]}
                    >
                      {moodData.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
        
        {/* Due Date Selection */}
        <Animated.View entering={FadeIn.delay(400)}>
          <View style={tw`mb-4 w-full`}>
            <ThemedText style={[
              tw`mb-2 font-semibold`,
              { color: isDark ? '#E5E7EB' : '#374151' }
            ]}>
              Due Date*
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                tw`px-4 py-3 rounded-xl border flex-row items-center justify-between`,
                {
                  backgroundColor: isDark ? '#374151' : '#F9FAFB',
                  borderColor: isDark ? '#4B5563' : '#E5E7EB',
                }
              ]}
            >
              <ThemedText style={{ color: isDark ? '#E5E7EB' : '#1F2937' }}>
                {formatDate(dueDate)}
              </ThemedText>
              <Ionicons 
                name="calendar" 
                size={18} 
                color={isDark ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </Animated.View>
        
        {/* Action Buttons */}
        <Animated.View 
          entering={FadeIn.delay(500)}
          style={tw`flex-row justify-end mt-4`}
        >
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              tw`px-5 py-3 rounded-xl mr-3`,
              {
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
              }
            ]}
            disabled={isSubmitting}
          >
            <ThemedText style={{ color: isDark ? '#E5E7EB' : '#4B5563' }}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              tw`px-5 py-3 rounded-xl flex-row items-center`,
              {
                backgroundColor: isDark ? '#6366F1' : '#4F46E5',
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={tw`mr-2`} />
            ) : (
              <Ionicons 
                name={isEditOperation ? "save" : "add-circle"} 
                size={18} 
                color="#FFFFFF" 
                style={tw`mr-2`}
              />
            )}
            <ThemedText style={tw`text-white font-medium`}>
              {isEditOperation ? 'Save Changes' : 'Add Task'}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};