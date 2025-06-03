import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, ScrollView, Share, StatusBar, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, SlideInUp } from 'react-native-reanimated';
import tw from 'twrnc';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

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
  const [scrollY, setScrollY] = useState(0);

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

  useEffect(() => {
    fetchArticleDetails();
  }, [fetchArticleDetails]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
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

  // Clean content text
  const cleanContent = (content: string) => {
    return content.replace(/\[\+\d+ chars\]$/, '');
  };

  // Get reading time estimate
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Animated.View entering={FadeIn} style={tw`items-center`}>
          <View style={[
            tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
            { backgroundColor: isDark ? '#4F46E5' : '#6366F1' }
          ]}>
            <ActivityIndicator size="large" color="white" />
          </View>
          <ThemedText style={tw`text-lg font-medium`}>Loading article...</ThemedText>
          <ThemedText style={tw`${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Please wait</ThemedText>
        </Animated.View>
      </ThemedView>
    );
  }

  if (error || !article) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center p-6 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Animated.View entering={FadeInUp} style={tw`items-center`}>
          <View style={[
            tw`w-20 h-20 rounded-full items-center justify-center mb-6`,
            { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }
          ]}>
            <Ionicons name="alert-circle" size={40} color={isDark ? '#EF4444' : '#DC2626'} />
          </View>
          <ThemedText style={tw`text-xl font-bold mb-2 text-center`}>
            {error || 'Article not found'}
          </ThemedText>
          <ThemedText style={tw`${isDark ? 'text-gray-500' : 'text-gray-400'} text-center mb-8`}>
            We couldn't load this article. Please try again.
          </ThemedText>
          <TouchableOpacity
            style={[
              tw`px-8 py-4 rounded-2xl flex-row items-center`,
              { backgroundColor: isDark ? '#4F46E5' : '#6366F1' }
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="white" style={tw`mr-2`} />
            <ThemedText style={tw`text-white font-semibold text-lg`}>Go Back</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <View style={tw`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`pb-8`}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* Hero Image Section - No buttons needed */}
        <View style={tw`relative`}>
          {article.urlToImage ? (
            <Image
              source={{ uri: article.urlToImage }}
              style={[tw`w-full`, { height: height * 0.4 }]}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={isDark ? ['#0F0F23', '#1E1B4B', '#312E81'] : ['#667EEA', '#764BA2']}
              style={[tw`w-full items-center justify-center`, { height: height * 0.4 }]}
            >
              <Ionicons name="newspaper" size={80} color="rgba(255,255,255,0.4)" />
            </LinearGradient>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'transparent', isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)']}
            style={tw`absolute inset-0`}
          />

          {/* Article Meta Info Overlay */}
          <Animated.View 
            entering={FadeInUp.delay(300)}
            style={tw`absolute bottom-6 left-6 right-6`}
          >
            <View style={tw`flex-row items-center mb-4`}>
              <View style={[
                tw`px-4 py-2 rounded-full mr-3 flex-row items-center`,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)' }
              ]}>
                <View style={tw`w-2 h-2 rounded-full bg-green-400 mr-2`} />
                <ThemedText style={tw`text-white font-medium text-sm`}>
                  {article.source.name}
                </ThemedText>
              </View>

              <View style={[
                tw`px-4 py-2 rounded-full flex-row items-center`,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)' }
              ]}>
                <Ionicons name="time-outline" size={14} color="white" style={tw`mr-2`} />
                <ThemedText style={tw`text-white text-sm`}>
                  {formatDate(article.publishedAt)}
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Content Section - Much Darker */}
        <Animated.View 
          entering={SlideInUp.delay(400)}
          style={[
            tw`mx-6 -mt-8 rounded-t-3xl p-6`,
            {
              backgroundColor: isDark ? '#0F0F0F' : '#FFFFFF', // Much darker background
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.5 : 0.1,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}
        >
          {/* Title */}
          <ThemedText style={tw`text-2xl font-bold leading-tight mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {article.title}
          </ThemedText>

          {/* Author and Reading Time */}
          <View style={tw`flex-row items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <View style={tw`flex-row items-center flex-1`}>
              {article.author && (
                <>
                  <View style={[
                    tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                    { backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6' } // Much darker
                  ]}>
                    <Ionicons name="person" size={18} color={isDark ? '#6B7280' : '#6B7280'} />
                  </View>
                  <View style={tw`flex-1`}>
                    <ThemedText style={tw`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {article.author}
                    </ThemedText>
                    <ThemedText style={tw`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Author
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
            
            <View style={[
              tw`px-3 py-2 rounded-full flex-row items-center`,
              { backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6' } // Much darker
            ]}>
              <Ionicons name="book-outline" size={14} color={isDark ? '#6B7280' : '#6B7280'} style={tw`mr-1`} />
              <ThemedText style={tw`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {getReadingTime(article.content || article.description || '')}
              </ThemedText>
            </View>
          </View>

          {/* Description */}
          {article.description && (
            <Animated.View 
              entering={FadeIn.delay(500)}
              style={[
                tw`mb-6 p-5 rounded-2xl border-l-4`,
                {
                  backgroundColor: isDark ? '#1A1A1A' : '#F8FAFC', // Much darker
                  borderLeftColor: '#6366F1'
                }
              ]}
            >
              <ThemedText style={tw`text-base leading-relaxed font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {article.description}
              </ThemedText>
            </Animated.View>
          )}

          {/* Content */}
          <Animated.View entering={FadeIn.delay(600)}>
            <ThemedText style={tw`text-base leading-relaxed mb-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              {article.content ? cleanContent(article.content) : 'No detailed content available for this article. Click the button below to read the full article on the original website.'}
            </ThemedText>

            {/* Action Buttons */}
            <View style={tw`gap-4 mb-6`}>
              {/* Read Full Article Button */}
              <TouchableOpacity
                style={[
                  tw`py-4 px-6 rounded-2xl flex-row items-center justify-center`,
                  {
                                       backgroundColor: '#6366F1',
                    shadowColor: "#6366F1",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6
                  }
                ]}
                onPress={openOriginalArticle}
                activeOpacity={0.9}
              >
                <View style={[
                  tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
                  { backgroundColor: 'rgba(255,255,255,0.2)' }
                ]}>
                  <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
                </View>
                <ThemedText style={tw`text-white font-bold text-lg`}>
                  Read Full Article
                </ThemedText>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={tw`ml-2`} />
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                style={[
                  tw`py-4 px-6 rounded-2xl flex-row items-center justify-center border-2`,
                  {
                    backgroundColor: isDark ? '#1A1A1A' : '#F8FAFC', // Much darker
                    borderColor: isDark ? '#2D2D2D' : '#E2E8F0' // Much darker border
                  }
                ]}
                onPress={shareArticle}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="share-social-outline" 
                  size={18} 
                  color={isDark ? '#9CA3AF' : '#6B7280'} 
                  style={tw`mr-3`} 
                />
                <ThemedText style={tw`font-semibold text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Share Article
                </ThemedText>
              </TouchableOpacity>
            </View>

         

            {/* Source Information */}
            <View style={[
              tw`p-5 rounded-2xl border`,
              {
                backgroundColor: isDark ? '#111111' : '#FFFFFF', // Much darker
                borderColor: isDark ? '#2D2D2D' : '#E5E7EB' // Much darker border
              }
            ]}>
              <View style={tw`flex-row items-center mb-3`}>
                <View style={[
                  tw`w-12 h-12 rounded-full items-center justify-center mr-4`,
                  { backgroundColor: isDark ? '#4F46E5' : '#6366F1' }
                ]}>
                  <Ionicons name="newspaper-outline" size={20} color="white" />
                </View>
                <View style={tw`flex-1`}>
                  <ThemedText style={tw`font-bold text-lg ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {article.source.name}
                  </ThemedText>
                  <ThemedText style={tw`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Original Publisher
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={tw`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                This article was originally published by {article.source.name}. 
                Click "Read Full Article" above to view the complete story on their website.
              </ThemedText>
            </View>

            {/* Footer */}
            <View style={tw`mt-8 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <View style={tw`flex-row items-center justify-center mb-4`}>
                <View style={tw`flex-row items-center`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons 
                      key={star}
                      name="star" 
                      size={16} 
                      color="#F59E0B" 
                      style={tw`mx-1`}
                    />
                  ))}
                </View>
                <ThemedText style={tw`ml-3 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Powered by NewsAPI
                </ThemedText>
              </View>
              
              <ThemedText style={tw`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Article content provided via News API • {formatDate(article.publishedAt)}
              </ThemedText>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View 
        entering={SlideInUp.delay(800)}
        style={tw`absolute bottom-6 right-6`}
      >
        <TouchableOpacity
          onPress={openOriginalArticle}
          style={[
            tw`w-14 h-14 rounded-full items-center justify-center`,
            {
              backgroundColor: '#6366F1',
              shadowColor: "#6366F1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8
            }
          ]}
          activeOpacity={0.9}
        >
          <Ionicons name="open-outline" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
