import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import tw from 'twrnc';

import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define Chat types
interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

export default function ChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [isInitializing, setIsInitializing] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Updated color scheme - black/blue for dark mode, white/blue for light mode
    const themeColors = {
        primary: isDark ? '#0A84FF' : '#0A84FF',
        background: isDark ? '#121212' : '#FFFFFF',
        cardBackground: isDark ? '#1E1E1E' : '#F9F9F9',
        inputBackground: isDark ? '#2C2C2E' : '#F2F2F7',
        text: isDark ? '#E5E5E5' : '#1C1C1E',
        secondaryText: isDark ? '#8E8E93' : '#8E8E93',
        bubbleUser: isDark ? '#0A84FF' : '#0A84FF',
        bubbleAssistant: isDark ? '#2C2C2E' : '#F2F2F7',
    };

    // API key for Gemini
    const API_KEY = 'AIzaSyCK92uRwQ_cxsqPOliS3pjcwrsQfeH6rGU';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    useEffect(() => {
        // Add welcome messages when component mounts
        const initialMessages: ChatMessage[] = [
            {
                id: '1',
                content: "Hey there! 👋",
                role: 'assistant',
                timestamp: new Date()
            },
            {
                id: '2',
                content: "I'm Navigator, your personal AI assistant.",
                role: 'assistant',
                timestamp: new Date()
            },
            {
                id: '3',
                content: "What should I call you?",
                role: 'assistant',
                timestamp: new Date()
            }
        ];

        setMessages(initialMessages);

        // Simulate loading
        setTimeout(() => {
            setIsInitializing(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 500);
        }, 1500);
    }, []);

    // Function to handle initial user name input
    const handleNameSubmit = () => {
        if (inputText.trim() === '') return;

        setUserName(inputText);

        // Add user's name message
        const userNameMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputText,
            role: 'user',
            timestamp: new Date()
        };

        // Add greeting with name
        const greetingMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `Nice to meet you, ${inputText}! How can I help you today?`,
            role: 'assistant',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userNameMessage, greetingMessage]);
        setInputText('');
    };

    // Function to send message to Gemini API
const sendMessageToGemini = async (userMessage: string) => {
    setIsLoading(true);

    try {
        // Add user message to chat
        const newUserMessage: ChatMessage = {
            id: Date.now().toString(),
            content: userMessage,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, newUserMessage]);

        // Format messages for Gemini API
        const formattedMessages = messages
            .slice(-10) // Only use last 10 messages for context
            .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

        // Add the new user message
        formattedMessages.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Call Gemini API with safety settings set to BLOCK_NONE
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `My name is ${userName}. ${userMessage}` }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_ONLY_HIGH"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_ONLY_HIGH"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_ONLY_HIGH"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_ONLY_HIGH"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API error response:', errorData);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the assistant's response
        const assistantResponse = data.candidates[0].content.parts[0].text;

        // Add assistant response to chat
        const newAssistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: assistantResponse,
            role: 'assistant',
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, newAssistantMessage]);

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Add error message
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: "Sorry, I encountered an error processing your request. Please try again.",
            role: 'assistant',
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setIsLoading(false);
    }
};

    // Handle sending a message
    const handleSendMessage = () => {
        if (inputText.trim() === '') return;

        if (!userName) {
            handleNameSubmit();
        } else {
            sendMessageToGemini(inputText.trim());
            setInputText('');
        }
    };

    // Render a chat message
    const renderChatMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
        const isUser = item.role === 'user';
        const isLastMessage = index === messages.length - 1;
        const isFirstMessage = index === 0;

        return (
            <Animated.View
                entering={isLastMessage ? FadeInDown.duration(300).springify() : undefined}
                style={tw`mb-3 ${isUser ? 'items-end pr-4' : 'items-start pl-4'}`}
            >
                {!isUser && isFirstMessage && (
                    <Animated.View
                        entering={FadeIn.duration(800)}
                        style={tw`mb-4 items-center justify-center`}
                    >
                        <LinearGradient
                            colors={[themeColors.primary, '#0062CC']}
                            style={tw`h-16 w-16 rounded-full items-center justify-center mb-2`}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="chatbubble-ellipses" size={32} color="white" />
                        </LinearGradient>
                    </Animated.View>
                )}

                <View
                    style={[
                        tw`max-w-[80%] rounded-3xl py-3 px-4`,
                        isUser 
                            ? tw`rounded-tr-none`
                            : tw`rounded-tl-none`,
                        isUser 
                            ? { backgroundColor: themeColors.bubbleUser }
                            : { 
                                backgroundColor: themeColors.bubbleAssistant, 
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: isDark ? 0.3 : 0.1,
                                shadowRadius: 2,
                                elevation: 2 
                              }
                    ]}
                >
                    <ThemedText 
                        style={[
                            tw`text-base`,
                            { color: isUser ? '#FFFFFF' : themeColors.text }
                        ]}
                    >
                        {item.content}
                    </ThemedText>
                </View>
            </Animated.View>
        );
    };

    if (isInitializing) {
        return (
            <View style={[
                tw`flex-1 items-center justify-center`,
                { backgroundColor: themeColors.background }
            ]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={themeColors.background} />
                <Animated.View
                    entering={FadeIn.duration(800)}
                    style={tw`items-center`}
                >
                    <LinearGradient
                        colors={[themeColors.primary, '#0062CC']}
                        style={tw`h-20 w-20 rounded-full items-center justify-center mb-6`}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="chatbubble-ellipses" size={40} color="white" />
                    </LinearGradient>
                    <ThemedText style={tw`text-2xl font-bold mb-2`} darkColor="#E5E5E5" lightColor="#1C1C1E">Navigator</ThemedText>
                    <ThemedText style={tw`text-base text-center mb-8`} darkColor="#A8A8A8" lightColor="#6E6E73">Your personal AI assistant</ThemedText>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                </Animated.View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[tw`flex-1`, { backgroundColor: themeColors.background }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={themeColors.background} />
            
            {/* Chat messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={tw`pt-6 pb-4`}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                onContentSizeChange={() => {
                    if (messages.length > 0) {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }
                }}
            />

            {/* Input area with blur effect */}
            <BlurView 
                intensity={isDark ? 40 : 60} 
                tint={isDark ? "dark" : "light"}
                style={tw`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
            >
                <Animated.View 
                    entering={FadeInUp.duration(300)}
                    style={tw`flex-row items-center px-4 py-2`}
                >
                    <View style={[
                        tw`flex-1 flex-row items-center rounded-full py-2 px-4 mr-2`,
                        { backgroundColor: themeColors.inputBackground }
                    ]}>
                        <TextInput
                            ref={inputRef}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={!userName ? "Enter your name..." : "Type a message..."}
                            placeholderTextColor={themeColors.secondaryText}
                            style={[
                                tw`flex-1 text-base py-1 px-2`,
                                { color: themeColors.text }
                            ]}
                            multiline
                            maxLength={500}
                            onSubmitEditing={handleSendMessage}
                            returnKeyType="send"
                            blurOnSubmit={false}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={inputText.trim() === '' || isLoading}
                        style={[
                            tw`h-12 w-12 rounded-full items-center justify-center`,
                            { 
                                backgroundColor: inputText.trim() === '' || isLoading 
                                    ? themeColors.secondaryText 
                                    : themeColors.primary,
                                opacity: inputText.trim() === '' || isLoading ? 0.7 : 1
                            }
                        ]}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </BlurView>
        </KeyboardAvoidingView>
    );
}