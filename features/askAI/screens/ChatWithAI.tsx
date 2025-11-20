import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Upload, Send, Sparkles } from 'lucide-react-native';
import { useAIQuery } from '../hooks/useAIQuery';

const QUICK_PROMPTS = ['Is this healthy?', 'Is this eco-friendly?', 'Suggest a better option'];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  imageUri?: string | null;
  hadImage?: boolean;
  createdAt?: string;
};

export default function ChatWithAI() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // React Query mutation hook
  const aiMutation = useAIQuery();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, aiMutation.isPending]);

  const appendMessage = (msg: Message) => setMessages((m) => [...m, msg]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64Image = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setSelectedImage(base64Image);
      }
    } catch (err) {
      console.error('pickImage error', err);
      setError('Failed to pick image');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  async function handleSendMessage(userText: string, imageData?: string | null) {
    setError(null);

    const userId = Date.now().toString();
    const userMessage: Message = {
      id: `u-${userId}`,
      role: 'user',
      text: userText || (imageData ? 'Analyze this product' : ''),
      imageUri: imageData ?? null,
      hadImage: !!imageData,
    };
    appendMessage(userMessage);

    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Call mock AI API via React Query mutation
      const response = await aiMutation.mutateAsync({
        message: userText || (imageData ? 'Analyze this product' : ''),
        imageUri: imageData,
        conversationHistory: messages,
      });

      appendMessage({
        id: response.reply.id,
        role: 'assistant',
        text: response.reply.text,
      });

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      console.error('AI query failed', err);
      setError(err?.message || 'Failed to get response from AI');
      appendMessage({
        id: `a-${Date.now().toString()}`,
        role: 'assistant',
        text: 'Sorry, something went wrong while analyzing that. Try again.',
      });
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setInput('');
      setSelectedImage(null);
    }
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    await handleSendMessage(input.trim(), selectedImage);
  };

  const renderMessageRow = (m: Message) => {
    const isUser = m.role === 'user';
    return (
      <View
        key={m.id}
        className={`my-2 flex-row ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-full items-end`}>
        {/* Avatar */}
        <View className="h-9 w-9 items-center justify-center overflow-hidden rounded-full">
          {isUser ? (
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#34C759]">
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
          ) : (
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F5E9]">
              <Text style={{ fontSize: 20 }}>🤖</Text>
            </View>
          )}
        </View>

        <View className="ml-2 mr-2 flex-shrink">
          {m.imageUri && m.hadImage ? (
            // image preview
            <Image
              source={{ uri: m.imageUri }}
              className="mb-1 h-[140px] w-[220px] rounded-[12px] bg-[#efefef]"
              resizeMode="cover"
            />
          ) : null}

          <View
            className={`rounded-[18px] px-4 py-2.5 shadow-md ${isUser ? 'bg-[#34C759]' : 'bg-white'}`}
            style={{ alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
            <Text className={`text-[15px] leading-[22px] ${isUser ? 'text-white' : 'text-black'}`}>
              {m.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="absolute inset-0">
        <View className="flex-1 bg-[#F8FFFA]" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        className="flex-1"
        style={{}}>
        <View className="bg-[#F8FFFA]" style={{ paddingTop: insets.top + 16 }}>
          <View className="mb-6 px-6">
            <Text className="text-4xl font-extrabold text-black">Ask AI</Text>
          </View>

          <View className="items-center gap-3 px-5 pb-5">
            <Animated.View
              className="h-20 w-20 items-center justify-center rounded-full bg-green-50"
              style={{ transform: [{ scale: pulseAnim }] }}>
              <Sparkles size={32} color="#34C759" />
            </Animated.View>

            <Text className="text-center text-base font-semibold text-gray-500">
              Ask anything about your health or the planet
            </Text>
          </View>

          {error && (
            <View className="mt-3 w-full rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-center text-sm font-semibold text-red-500">{error}</Text>
            </View>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}>
          {messages.length === 0 && (
            <View className="items-center gap-3 px-5 py-10">
              <Text className="text-xl font-bold text-black">Start a Conversation</Text>
              <Text className="text-center text-[15px] font-medium leading-[22px] text-gray-500">
                Ask questions about products, get health tips, or find eco-friendly alternatives
              </Text>
            </View>
          )}

          {messages.map((m) => renderMessageRow(m))}

          {aiMutation.isPending && (
            <View className="mt-2 self-start rounded-[20px] bg-white px-4 py-3">
              <Text className="text-sm font-semibold text-gray-500">Thinking…</Text>
            </View>
          )}
        </ScrollView>

        {messages.length === 0 && (
          <View className="flex-row flex-wrap px-4">
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => handleQuickPrompt(p)}
                className="mr-2 mt-2 rounded-full border border-gray-200 bg-white px-4 py-2">
                <Text className="font-semibold text-green-600">{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View
          className="border-t border-gray-200 bg-gray-50 px-3 pt-2"
          style={{ paddingBottom: insets.bottom || 12 }}>
          {selectedImage && (
            <View className="mb-2 flex-row items-center justify-between rounded-lg bg-green-50 p-2">
              <Text className="font-semibold text-green-600">Image selected</Text>
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Text className="font-semibold text-red-600">Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-end space-x-2">
            <TouchableOpacity
              onPress={pickImage}
              className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Upload size={18} color="#8E8E93" />
            </TouchableOpacity>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask something..."
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={500}
              className="max-h-[100px] flex-1 rounded-full bg-white px-3 py-2 text-[15px]"
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() && !selectedImage}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                !input.trim() && !selectedImage ? 'bg-gray-200' : 'bg-[#34C759]'
              }`}>
              <Send size={16} color={!input.trim() && !selectedImage ? '#8E8E93' : '#fff'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
