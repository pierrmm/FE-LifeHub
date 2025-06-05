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
import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, SlideInLeft } from 'react-native-reanimated';
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

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export default function NewsScreen() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [featuredNews, setFeaturedNews] = useState<Article | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  const API_URL = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=9536dead719b403589db467e78f903d5';
  
  // Enhanced categories with icons
  const categories = [
    { id: 'general', name: 'General', icon: 'newspaper', color: '#6366F1' },
    { id: 'business', name: 'Business', icon: 'trending-up', color: '#10B981' },
    { id: 'technology', name: 'Tech', icon: 'phone-portrait', color: '#3B82F6' },
    { id: 'sports', name: 'Sports', icon: 'football', color: '#F59E0B' },
    { id: 'entertainment', name: 'Fun', icon: 'musical-notes', color: '#EC4899' },
    { id: 'health', name: 'Health', icon: 'fitness', color: '#EF4444' },
    { id: 'science', name: 'Science', icon: 'flask', color: '#8B5CF6' }
  ];

  // Enhanced theme colors
  const cardThemes = [
    { 
      gradient: isDark ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF'], 
      accent: '#6366F1',
      shadow: '#6366F1'
    },
    { 
      gradient: isDark ? ['#064E3B', '#065F46'] : ['#ECFDF5', '#D1FAE5'], 
      accent: '#10B981',
      shadow: '#10B981'
    },
    { 
      gradient: isDark ? ['#7C2D12', '#9A3412'] : ['#FEF3C7', '#FDE68A'], 
      accent: '#F59E0B',
      shadow: '#F59E0B'
    },
    { 
      gradient: isDark ? ['#581C87', '#6B21A8'] : ['#FAE8FF', '#F3E8FF'], 
      accent: '#A855F7',
      shadow: '#A855F7'
    },
    { 
      gradient: isDark ? ['#9F1239', '#BE185D'] : ['#FDF2F8', '#FCE7F3'], 
      accent: '#EC4899',
      shadow: '#EC4899'
    },
  ];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

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
        const articles = response.data.articles.filter(article => 
          article.title && article.title !== '[Removed]'
        );
        setNews(articles);
        // Set featured news as the first article with image
        const featured = articles.find(article => article.urlToImage);
        setFeaturedNews(featured || articles[0]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const openArticle = (article: Article) => {
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

  const getCardTheme = (index: number) => {
    return cardThemes[index % cardThemes.length];
  };

  // Featured News Component
  const FeaturedNews = ({ article }: { article: Article }) => (
    <Animated.View
      entering={FadeInDown.duration(800).springify()}
      style={tw`mx-4 mb-8`}
    >
      <TouchableOpacity
        onPress={() => openArticle(article)}
        activeOpacity={0.95}
        style={[
          tw`rounded-3xl overflow-hidden`,
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.2,
            shadowRadius: 16,
            elevation: 12,
          }
        ]}
      >
        <View style={tw`relative h-64`}>
          {article.urlToImage ? (
            <Image 
              source={{ uri: article.urlToImage }}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={tw`w-full h-full items-center justify-center`}
            >
              <Ionicons name="newspaper" size={60} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          )}
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={tw`absolute inset-0`}
          />
          
          {/* Featured Badge */}
          <View style={tw`absolute top-4 left-4`}>
            <BlurView
              intensity={80}
              tint="dark"
              style={tw`px-4 py-2 rounded-full flex-row items-center`}
            >
              <Ionicons name="star" size={16} color="#F59E0B" style={tw`mr-2`} />
              <ThemedText style={tw`text-white font-bold text-sm`}>Featured</ThemedText>
            </BlurView>
          </View>
          
          {/* Content */}
          <View style={tw`absolute bottom-0 left-0 right-0 p-6`}>
            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`bg-white/20 px-3 py-1 rounded-full mr-3`}>
                <ThemedText style={tw`text-white text-xs font-medium`}>
                  {article.source.name}
                </ThemedText>
              </View>
              <ThemedText style={tw`text-white/80 text-xs`}>
                {formatDate(article.publishedAt)}
              </ThemedText>
            </View>
            
            <ThemedText style={tw`text-white font-bold text-xl leading-tight mb-2`} numberOfLines={2}>
              {article.title}
            </ThemedText>
            
            {article.description && (
              <ThemedText style={tw`text-white/90 text-sm`} numberOfLines={2}>
                {article.description}
              </ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Enhanced News Item
  const renderNewsItem = ({ item, index }: { item: Article; index: number }) => {
    const theme = getCardTheme(index);
    
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 100).springify()}
        style={tw`mx-4 mb-6`}
      >
        <TouchableOpacity 
          style={[
            tw`rounded-2xl overflow-hidden`,
            {
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.15,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}
          activeOpacity={0.9}
          onPress={() => openArticle(item)}
        >
          <LinearGradient
            colors={theme.gradient}
            style={tw`flex-row p-4`}
          >
            {/* Image Section */}
            <View style={tw`w-24 h-24 rounded-xl overflow-hidden mr-4`}>
              {item.urlToImage ? (
                <Image 
                  source={{ uri: item.urlToImage }}
                  style={tw`w-full h-full`}
                  resizeMode="cover"
                />
              ) : (
                <View style={[
                  tw`w-full h-full items-center justify-center`,
                  { backgroundColor: theme.accent + '20' }
                ]}>
                  <Ionicons name="image-outline" size={24} color={theme.accent} />
                </View>
              )}
            </View>
            
            {/* Content Section */}
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center justify-between mb-2`}>
                <View style={[
                  tw`px-2 py-1 rounded-full`,
                  { backgroundColor: theme.accent + '20' }
                ]}>
                  <ThemedText style={[
                    tw`text-xs font-medium`,
                    { color: theme.accent }
                  ]}>
                    {item.source.name}
                  </ThemedText>
                </View>
                <ThemedText style={tw`text-xs text-gray-500 dark:text-gray-400`}>
                  {formatDate(item.publishedAt)}
                </ThemedText>
              </View>
              
              <ThemedText 
                style={tw`font-bold text-base mb-2 leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`} 
                numberOfLines={2}
              >
                {item.title}
              </ThemedText>
              
              {item.description && (
                <ThemedText 
                  style={tw`text-gray-600 dark:text-gray-300 text-sm`} 
                  numberOfLines={2}
                >
                  {item.description}
                </ThemedText>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Enhanced Category Item
  const renderCategoryItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <Animated.View entering={SlideInLeft.delay(index * 100)}>
        <TouchableOpacity
          style={[
            tw`mr-3 px-5 py-3 rounded-2xl flex-row items-center`,
            {
              backgroundColor: isSelected 
                ? item.color 
                : isDark ? '#374151' : '#F3F4F6',
              shadowColor: isSelected ? item.color : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isSelected ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: isSelected ? 4 : 2,
            }
          ]}
          activeOpacity={0.8}
          onPress={() => {
            setSelectedCategory(item.id);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
        >
          <Ionicons 
            name={item.icon as any} 
            size={18} 
            color={isSelected ? 'white' : (isDark ? '#D1D5DB' : '#6B7280')} 
            style={tw`mr-2`}
          />
          <ThemedText style={[
            tw`font-semibold`,
            { color: isSelected ? 'white' : (isDark ? '#D1D5DB' : '#6B7280') }
          ]}>
            {item.name}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#667EEA', dark: '#1E1B4B' }}
      headerImage={
        <LinearGradient
                   colors={isDark ? ['#1E1B4B', '#312E81', '#4338CA'] : ['#3f5eeb', '#5470eb', '#667EEA']}
          style={tw`absolute inset-0`}
        >
          <Animated.View
            entering={FadeIn.duration(1000)}
            style={tw`h-full w-full px-6 justify-center items-center relative`}
          >
      
            {/* Header Content */}
            <View style={tw`items-center`}>
              <Animated.View 
                entering={FadeIn.delay(300)}
                style={[
                  tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
                  { backgroundColor: 'rgba(255,255,255,0.2)' }
                ]}
              >
                <Ionicons name="newspaper" size={40} color="white" />
              </Animated.View>
              
              <Animated.Text 
                entering={FadeIn.delay(500)}
                style={tw`text-white text-3xl font-bold mb-2`}
              >
                News Hub
              </Animated.Text>
              
              <Animated.Text 
                entering={FadeIn.delay(700)}
                style={tw`text-white/80 text-lg text-center`}
              >
                Stay informed with latest updates
              </Animated.Text>
              
              {/* Live indicator */}
              <Animated.View 
                entering={FadeIn.delay(900)}
                style={tw`flex-row items-center mt-4 bg-white/20 px-4 py-2 rounded-full`}
              >
                <View style={tw`w-2 h-2 rounded-full bg-red-500 mr-2`} />
                <ThemedText style={tw`text-white text-sm font-medium`}>
                  Live Updates
                </ThemedText>
              </Animated.View>
            </View>
          </Animated.View>
        </LinearGradient>
      }
      minimizeHeaderOnScroll={true}
    >
      {/* Header Section */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={tw`mb-8 px-6`}
      >
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View>
            <ThemedText style={tw`text-3xl font-bold mb-1`}>
              Latest News
            </ThemedText>
            <ThemedText style={tw`text-gray-500 dark:text-gray-400 text-base`}>
              {news.length} articles • Updated {formatDate(new Date().toISOString())}
            </ThemedText>
          </View>
          
          <TouchableOpacity
            onPress={onRefresh}
            style={[
              tw`w-12 h-12 rounded-full items-center justify-center`,
              {
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }
            ]}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={isDark ? '#D1D5DB' : '#6B7280'} 
              style={refreshing ? tw`opacity-50` : tw``}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View 
        entering={FadeInRight.duration(800)}
        style={tw`mb-8`}
      >
        <ThemedText style={tw`px-6 mb-4 font-semibold text-lg text-gray-700 dark:text-gray-300`}>
          Categories
        </ThemedText>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={tw`py-2 px-6`}
        />
      </Animated.View>

      {/* Featured News */}
      {featuredNews && !loading && (
        <View style={tw`mb-8`}>
          <ThemedText style={tw`px-6 mb-4 font-semibold text-lg text-gray-700 dark:text-gray-300`}>
            Featured Story
          </ThemedText>
          <FeaturedNews article={featuredNews} />
        </View>
      )}

      {/* News Content */}
      <ThemedView style={tw`flex-1`}>
        {loading && !refreshing ? (
          <ThemedView style={tw`items-center justify-center py-16`}>
            <View style={[
              tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
              { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
            ]}>
              <ActivityIndicator size="large" color="#667EEA" />
            </View>
            <ThemedText style={tw`text-gray-500 dark:text-gray-400 text-lg font-medium`}>
              Loading latest news...
            </ThemedText>
            <ThemedText style={tw`text-gray-400 dark:text-gray-500 text-sm mt-2`}>
              Please wait a moment
            </ThemedText>
          </ThemedView>
        ) : error ? (
          <Animated.View 
            entering={FadeIn.duration(500)}
            style={tw`items-center justify-center py-16 mx-6`}
          >
            <LinearGradient
              colors={isDark ? ['#7F1D1D', '#991B1B'] : ['#FEF2F2', '#FECACA']}
              style={tw`w-full rounded-3xl p-8 items-center`}
            >
              <View style={[
                tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
                { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
              ]}>
                <Ionicons name="alert-circle" size={32} color="#EF4444" />
              </View>
              <ThemedText style={tw`text-red-600 dark:text-red-300 text-lg font-bold mb-2 text-center`}>
                Oops! Something went wrong
              </ThemedText>
              <ThemedText style={tw`text-red-500 dark:text-red-400 text-center mb-6`}>
                {error}
              </ThemedText>
              <TouchableOpacity 
                style={[
                  tw`px-8 py-4 rounded-2xl flex-row items-center`,
                  {
                    backgroundColor: '#EF4444',
                    shadowColor: "#EF4444",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6
                  }
                ]}
                activeOpacity={0.8}
                onPress={fetchNews}
              >
                <Ionicons name="refresh" size={20} color="#fff" style={tw`mr-2`} />
                <ThemedText style={tw`text-white font-bold text-base`}>Try Again</ThemedText>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        ) : news.length === 0 ? (
          <Animated.View 
            entering={FadeIn.duration(500)}
            style={tw`items-center justify-center py-16 mx-6`}
          >
            <LinearGradient
              colors={isDark ? ['#374151', '#4B5563'] : ['#F9FAFB', '#F3F4F6']}
              style={tw`w-full rounded-3xl p-8 items-center`}
            >
              <View style={[
                tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
                { backgroundColor: isDark ? '#4B5563' : '#E5E7EB' }
              ]}>
                <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
              </View>
              <ThemedText style={tw`text-gray-600 dark:text-gray-300 text-lg font-bold mb-2`}>
                No Articles Found
              </ThemedText>
              <ThemedText style={tw`text-gray-500 dark:text-gray-400 text-center`}>
                No articles available for this category at the moment
              </ThemedText>
            </LinearGradient>
          </Animated.View>
        ) : (
          <View style={tw`pb-8`}>
            <ThemedText style={tw`px-6 mb-4 font-semibold text-lg text-gray-700 dark:text-gray-300`}>
              All Stories
            </ThemedText>
            <FlatList
              ref={flatListRef}
              data={news.filter(article => article !== featuredNews)}
              keyExtractor={(item, index) => `${item.title}-${index}`}
              renderItem={renderNewsItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`pb-12`}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#667EEA']}
                  tintColor={isDark ? '#fff' : '#667EEA'}
                  progressBackgroundColor={isDark ? '#374151' : '#fff'}
                />
              }
              ItemSeparatorComponent={() => <View style={tw`h-2`} />}
            />
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

