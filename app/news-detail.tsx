import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Share, StatusBar, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import tw from 'twrnc';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define Article type
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

export default function NewsDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get article details from params or fetch from API if needed
  const fetchArticleDetails = useCallback(async () => {
    setLoading(true);

    try {
      // If we have all the article data in params, use it directly
      if (params.title && params.content) {
        setArticle({
          source: {
            id: (params.sourceId as string) || null,
            name: (params.sourceName as string) || 'Unknown Source',
          },
          author: (params.author as string) || null,
          title: params.title as string,
          description: (params.description as string) || '',
          url: (params.url as string) || '',
          urlToImage: (params.urlToImage as string) || null,
          publishedAt: (params.publishedAt as string) || new Date().toISOString(),
          content: params.content as string || '',
        });
      } else if (params.url) {
        // If we only have the URL, we might need to fetch the article details
        // Note: Most news APIs don't provide a direct endpoint to fetch a single article by URL
        // This is a placeholder for that functionality
        setError('Article details not available');
      } else {
        setError('Invalid article data');
      }
    } catch (err) {
      console.error('Error loading article details:', err);
      setError('Failed to load article details');
    } finally {
      setLoading(false);
    }
  }, [params.title, params.content, params.sourceId, params.sourceName, params.author,
  params.description, params.url, params.urlToImage, params.publishedAt]);

  // Only fetch article details once when component mounts or when params change
  useEffect(() => {
    fetchArticleDetails();
  }, [fetchArticleDetails]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Share article
  const shareArticle = async () => {
    if (!article) return;

    try {
      await Share.share({
        message: `Check out this article: ${article.title}\n${article.url}`,
        url: article.url,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  // Open original article in browser
  const openOriginalArticle = () => {
    if (!article?.url) return;

    Linking.openURL(article.url).catch(err => {
      console.error('Error opening URL:', err);
    });
  };

  // Clean content text (remove extra characters often found in API responses)
  const cleanContent = (content: string) => {
    // Remove "[+XXXX chars]" pattern often found in News API content
    return content.replace(/\[\+\d+ chars\]$/, '');
  };

  if (loading) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={isDark ? '#3B82F6' : '#2563EB'} />
        <ThemedText style={tw`mt-4`}>Loading article...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !article) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center p-6`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Ionicons name="alert-circle-outline" size={60} color={isDark ? '#EF4444' : '#DC2626'} />
        <ThemedText style={tw`text-lg font-bold mt-4 text-center`}>
          {error || 'Article not found'}
        </ThemedText>
        <TouchableOpacity
          style={tw`mt-6 bg-blue-500 px-6 py-3 rounded-full`}
          onPress={() => router.back()}
        >
          <ThemedText style={tw`text-white font-semibold`}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={tw`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      contentContainerStyle={tw`pb-12`}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Image */}
      <ThemedView style={tw`relative`}>
        {article.urlToImage ? (
          <Image
            source={{ uri: article.urlToImage }}
            style={tw`w-full h-72`}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={isDark ? ['#111827', '#1F2937'] : ['#DBEAFE', '#EFF6FF']}
            style={tw`w-full h-72 items-center justify-center`}
          >
            <Ionicons name="newspaper" size={80} color={isDark ? '#9CA3AF' : '#3B82F6'} />
          </LinearGradient>
        )}

        {/* Gradient overlay for better visibility of back button */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={tw`absolute top-0 left-0 right-0 h-24`}
        />

    
       
      </ThemedView>

      {/* Article Content with improved styling */}
      <ThemedView style={tw`px-5 -mt-8 rounded-t-3xl  shadow-lg`}>
        <Animated.View entering={FadeInDown.duration(600)} style={tw`pt-7`}>
          {/* Source and Date */}
          <ThemedView style={tw`flex-row   justify-between items-center mb-4`}>
            <ThemedView style={tw`${isDark ? 'bg-blue-900/50' : 'bg-blue-100'} px-4 py-1.5 rounded-full`}>
              <ThemedText style={tw`${isDark ? 'text-blue-200' : 'text-blue-800'} text-xs font-medium`}>
                {article.source.name}
              </ThemedText>
            </ThemedView>

            <ThemedView style={tw`flex-row items-center`}>
              <Ionicons
                name="time-outline"
                size={14}
                color={isDark ? '#9CA3AF' : '#6B7280'}
                style={tw`mr-1`}
              />
              <ThemedText style={tw`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                {formatDate(article.publishedAt)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Title with improved typography */}
          <ThemedText style={tw`text-2xl font-bold mb-4 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {article.title}
          </ThemedText>

          {/* Author with icon */}
          {article.author && (
            <ThemedView style={tw`flex-row items-center mb-5`}>
              <Ionicons
                name="person-outline"
                size={16}
                color={isDark ? '#9CA3AF' : '#6B7280'}
                style={tw`mr-2`}
              />
              <ThemedText style={tw`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                By {article.author}
              </ThemedText>
            </ThemedView>
          )}

          {/* Description with improved styling */}
          {article.description && (
            <ThemedView style={tw`mb-6 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-xl border-l-4 border-blue-500`}>
              <ThemedText style={tw`text-base font-medium leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {article.description}
              </ThemedText>
            </ThemedView>
          )}

          {/* Content with improved readability */}
          <Animated.View entering={FadeIn.delay(300)}>
            <ThemedText style={tw`text-base leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {article.content ? cleanContent(article.content) : 'No content available for this article.'}
            </ThemedText>

            {/* Read Original Article Button with improved styling */}
            <TouchableOpacity
              style={tw`bg-blue-600 py-4 px-6 rounded-xl items-center mb-6 shadow-md flex-row justify-center`}
              onPress={openOriginalArticle}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={18} color="#FFFFFF" style={tw`mr-2`} />
              <ThemedText style={tw`text-white font-semibold`}>
                Read Full Article
              </ThemedText>
            </TouchableOpacity>

            {/* Footer with additional info */}
            <ThemedView style={tw`mt-4 mb-3 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <ThemedText style={tw`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} text-center`}>
                Article provided via News API
              </ThemedText>
            </ThemedView>
          </Animated.View>
        </Animated.View>
      </ThemedView>
    </ScrollView>
  );
}