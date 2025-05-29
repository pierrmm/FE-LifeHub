import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import tw from 'twrnc';

// Define News types
interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

const { width } = Dimensions.get('window');
// Calculate card width to fit exactly within the screen width with proper padding
const HORIZONTAL_PADDING = 16; // 8px on each side
const CARD_WIDTH = width - (HORIZONTAL_PADDING * 2);

export default function NewsScreen() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  // API base URL - using a proxy or direct call to News API
  const API_URL = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=9536dead719b403589db467e78f903d5';
  
  // Categories for news
  const categories = [
    { id: 'general', name: 'General' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'health', name: 'Health' },
    { id: 'science', name: 'Science' }
  ];

  // Theme colors for cards
  const cardColors = [
    { gradient: isDark ? ['#1E3A8A', '#1E40AF'] : ['#DBEAFE', '#EFF6FF'], accent: '#3B82F6' },
    { gradient: isDark ? ['#065F46', '#047857'] : ['#D1FAE5', '#ECFDF5'], accent: '#10B981' },
    { gradient: isDark ? ['#7C2D12', '#9A3412'] : ['#FFEDD5', '#FEF3C7'], accent: '#F59E0B' },
    { gradient: isDark ? ['#4C1D95', '#5B21B6'] : ['#EDE9FE', '#F5F3FF'], accent: '#8B5CF6' },
    { gradient: isDark ? ['#831843', '#9D174D'] : ['#FCE7F3', '#FDF2F8'], accent: '#EC4899' },
  ];

  // Fetch news on component mount and when category changes
  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  // Fetch news from API
  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(API_URL, {
        params: {
          country: 'us',
          category: selectedCategory,
          pageSize: 20
        }
      });
      
      if (response.data && response.data.articles) {
        setNews(response.data.articles);
      } else {
        setError('Failed to fetch news');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('An error occurred while fetching news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
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

  // Open article in browser
 const openArticle = (article: Article) => {
  // Navigate to the detail screen with article data as params
  router.push({
    pathname: '/news-detail',
    params: {
      title: article.title,
      description: article.description || '',
      content: article.content || '',
      urlToImage: article.urlToImage || '',
      publishedAt: article.publishedAt,
      url: article.url,
      sourceName: article.source.name,
      sourceId: article.source.id || '',
      author: article.author || '',
    }
  });
};


  // Get card color based on index
  const getCardColor = (index: number) => {
    return cardColors[index % cardColors.length];
  };

  // Render news item with improved UI/UX
  const renderNewsItem = ({ item, index }: { item: Article; index: number }) => {
    const cardColor = getCardColor(index);
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={tw`mb-4`}
      >
        <TouchableOpacity 
          style={[
            tw`mx-4 rounded-2xl overflow-hidden`,
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.25 : 0.1,
              shadowRadius: 8,
              elevation: 5,
            }
          ]}
          activeOpacity={0.9}
          onPress={() => openArticle(item)}>
          
          {/* Card with improved layout */}
          <ThemedView style={tw`rounded-2xl overflow-hidden bg-white dark:bg-gray-800`}>
            {/* Image section with proper aspect ratio */}
            <ThemedView style={tw`relative`}>
              {item.urlToImage ? (
                <Image 
                  source={{ uri: item.urlToImage }}
                  style={tw`w-full h-48 rounded-t-2xl`}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={cardColor.gradient}
                  style={tw`w-full h-48 rounded-t-2xl items-center justify-center`}
                >
                  <Ionicons name="newspaper" size={48} color={`${cardColor.accent}40`} />
                </LinearGradient>
              )}
              
              {/* Subtle gradient overlay for better text contrast */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={tw`absolute bottom-0 left-0 right-0 h-24`}
              />
              
              {/* Source badge - repositioned for better visibility */}
              <BlurView
                intensity={80}
                tint={isDark ? "dark" : "light"}
                style={tw`absolute top-3 left-3 rounded-full px-3 py-1 flex-row items-center border border-white/20`}
              >
                <ThemedText style={tw`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {item.source.name}
                </ThemedText>
              </BlurView>
            </ThemedView>
            
            {/* Content section with better spacing */}
            <ThemedView style={tw`p-4`}>
              <ThemedText style={tw`font-bold text-lg mb-2 leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`} numberOfLines={2}>
                {item.title}
              </ThemedText>
              
              {item.description && (
                <ThemedText style={tw`text-gray-600 dark:text-gray-300 mb-3 text-sm`} numberOfLines={2}>
                  {item.description}
                </ThemedText>
              )}
              
              <ThemedView style={tw`flex-row items-center justify-between mt-2`}>
                <ThemedView style={tw`flex-row items-center`}>
                  <Ionicons name="time-outline" size={14} color={isDark ? "#d1d5db" : "#6b7280"} />
                  <ThemedText style={tw`text-xs text-gray-500 dark:text-gray-400 ml-1`}>
                    {formatDate(item.publishedAt)}
                  </ThemedText>
                </ThemedView>
                
                <ThemedView style={tw`flex-row items-center`}>
                  <ThemedText style={tw`text-xs text-blue-500 font-medium mr-1`}>Read more</ThemedText>
                  <Ionicons name="arrow-forward" size={12} color="#3B82F6" />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={tw`mr-3 px-6 py-3 rounded-full ${
          isSelected 
            ? 'bg-blue-500' 
            : isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedCategory(item.id);
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }}>
        <ThemedText style={tw`${
          isSelected ? 'text-white font-bold' : 'font-medium'
             }`}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1E88E5', dark: '#0D47A1' }}
      headerImage={
        <LinearGradient
          colors={isDark ? ['#1A237E', '#0D47A1'] : ['#42A5F5', '#1E88E5']}
          style={tw`absolute inset-0`}
        >
          <Animated.View
            entering={FadeIn.duration(1000)}
            style={tw`h-full w-full items-center justify-center`}
          >
            <Ionicons name="newspaper" size={80} color="rgba(255,255,255,0.2)" />
          </Animated.View>
        </LinearGradient>
      }>
      <Animated.View 
              entering={FadeInDown.duration(600)}
        style={tw`mb-6 px-2`}
      >
        <ThemedText type="title" style={tw`text-3xl font-bold`}>News Hub</ThemedText>
        <ThemedText style={tw`text-gray-500 dark:text-gray-400 mt-1 text-base`}>
          Stay updated with the latest headlines
        </ThemedText>
      </Animated.View>

      {/* Categories */}
      <Animated.View 
        entering={FadeInRight.duration(800)}
        style={tw`mb-8`}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={tw`py-2 px-5`}
        />
      </Animated.View>

      {/* News Content */}
      <ThemedView style={tw`flex-1`}>
        {loading && !refreshing ? (
          <ThemedView style={tw`items-center justify-center py-12`}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <ThemedText style={tw`mt-4 text-gray-500`}>Fetching latest news...</ThemedText>
          </ThemedView>
        ) : error ? (
          <Animated.View 
            entering={FadeIn.duration(500)}
            style={tw`items-center justify-center py-12 mx-6 bg-red-50 dark:bg-red-900/30 rounded-3xl`}
          >
            <Ionicons name="alert-circle" size={60} color="#EF4444" />
            <ThemedText style={tw`mt-4 text-red-600 dark:text-red-300 text-center px-6`}>{error}</ThemedText>
            <TouchableOpacity 
              style={tw`mt-6 bg-blue-500 px-6 py-3 rounded-full flex-row items-center`}
              activeOpacity={0.8}
              onPress={fetchNews}>
              <Ionicons name="refresh" size={18} color="#fff" style={tw`mr-2`} />
              <ThemedText style={tw`text-white font-semibold`}>Try Again</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ) : news.length === 0 ? (
          <Animated.View 
            entering={FadeIn.duration(500)}
            style={tw`items-center justify-center py-12 mx-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl`}
          >
            <Ionicons name="document-text-outline" size={60} color="#9CA3AF" />
            <ThemedText style={tw`mt-4 text-gray-500 dark:text-gray-400 text-center`}>
              No articles found for this category
            </ThemedText>
          </Animated.View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={news}
            keyExtractor={(item, index) => `${item.title}-${index}`}
            renderItem={renderNewsItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-12 pt-2`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor={isDark ? '#fff' : '#3B82F6'}
              />
            }
          />
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}