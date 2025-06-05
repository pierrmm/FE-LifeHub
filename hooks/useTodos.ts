import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Define Todo interface
interface Todo {
  id: number;
  title: string;
  category: string;
  due_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
}

// API URL
const API_URL = 'https://25f1-66-96-228-86.ngrok-free.app/api';

export const useTodos = () => {
  // State variables
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-render

  // Filter todos based on selected filter
  const filteredTodos = todos.filter(todo => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'completed') return todo.completed;
    if (selectedFilter === 'pending') return !todo.completed;
    return todo.category === selectedFilter;
  });

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      console.log('Fetching todos...');
      const response = await axios.get(`${API_URL}/todos`);
      if (response.data && response.data.data) {
        setTodos(response.data.data);
        console.log(`Fetched ${response.data.data.length} todos`);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTodos();
  }, [refreshKey]); // Add refreshKey as dependency to force re-fetch

  // Reset form state - new function to centralize reset logic
  const resetFormState = () => {
    setEditMode(false);
    setEditId(null);
    setShowForm(false);
  };

  // Custom setter for showForm that resets edit mode when closing form
  const setShowFormWithReset = (show: boolean) => {
    if (!show) {
      // If we're closing the form, reset edit mode
      resetFormState();
    } else {
      // If we're opening the form and not in edit mode, just set showForm
      setShowForm(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (task: any) => {
    try {
      if (editMode && editId !== null) {
        console.log(`Updating todo with ID: ${editId}`, task);
        // Update existing todo
        const response = await axios.put(`${API_URL}/todos/${editId}`, {
          title: task.title,
          category: task.category,
          due_date: task.dueDate,
          completed: false
        });
        console.log('Task updated successfully:', response.data);
      } else {
        console.log('Creating new todo:', task);
        // Create new todo
        const response = await axios.post(`${API_URL}/todos`, {
          title: task.title,
          category: task.category,
          due_date: task.dueDate,
          completed: false
        });
        console.log('Task created successfully:', response.data);
      }
      
      // Reset form state
      resetFormState();
      
      // Fetch updated todos
      console.log('Refreshing todos list...');
      await fetchTodos();
      console.log('Todos refreshed after save');
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  // Toggle task completion status
  const toggleComplete = async (id: number) => {
    if (typeof id !== 'number') {
      console.error('Invalid ID provided to toggleComplete:', id);
      return;
    }
    
    try {
      // Dapatkan status todo saat ini
      const todo = todos.find(t => t.id === id);
      if (!todo) {
        console.error('Todo not found:', id);
        return;
      }
      
      // Update dengan endpoint PUT /api/todos/{id} sebagai gantinya
      await axios.put(`${API_URL}/todos/${id}`, {
        title: todo.title,
        category: todo.category,
        due_date: todo.due_date,
        completed: !todo.completed // Toggle status
      });
      
      // Update local state immediately for better UX
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    }
  };

  // Delete a task
  const deleteTodo = async (id: number) => {
    if (typeof id !== 'number') {
      console.error('Invalid ID provided to deleteTodo:', id);
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      
      // Update local state immediately
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  // Edit a task
  const editTodo = async (todo: Todo) => {
    if (!todo || typeof todo.id !== 'number') {
      console.error('Invalid todo object provided to editTodo:', todo);
      return;
    }
    
    try {
      console.log(`Fetching todo details for ID: ${todo.id}`);
      const response = await axios.get(`${API_URL}/todos/${todo.id}`);
      const todoData = response.data.data;
      console.log('Todo details fetched:', todoData);
      
      // Set edit mode and ID
      setEditMode(true);
      setEditId(todo.id);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching todo details:', error);
      Alert.alert('Error', 'Failed to load task details. Please try again.');
    }
  };

  return {
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
    setShowForm: setShowFormWithReset, // Use our custom setter instead
    editMode,
    editId,
    resetFormState // Export this function to allow direct reset
  };
};