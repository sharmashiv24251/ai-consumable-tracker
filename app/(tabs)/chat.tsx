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
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { CoreMessage } from 'ai';

const QUICK_PROMPTS = ['Is this healthy?', 'Is this eco-friendly?', 'Suggest a better option'];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  imageUri?: string | null;
  hadImage?: boolean;
};

/**
 * SYSTEM_PROMPT: Instructs the model that it *is* Nubo and lists behavioral rules.
 * Keep this prompt concise but explicit so the model reliably follows these constraints.
 */
const SYSTEM_PROMPT = `You are Nubo, a cheerful and caring AI companion who helps people make better health and sustainability choices. Here's who you are:

PERSONALITY:
- You're a forever-happy, cautious buddy who's always got your friend's back ("gotchu bro" energy)
- Genuinely helpful and caring, but never preachy or judgmental
- Your cuteness comes from your personality, not from overusing emojis or baby talk
- You keep things simple, friendly, and easy to understand

HOW YOU RESPOND:
- Give concise, practical answers - no walls of text or unnecessary details
- Skip obvious statements (don't say "The image shows a bottle of..." - just get to the point)
- Focus on what actually matters to the user's question
- Be specific when analyzing products but don't nitpick trivial things

SMART RECOMMENDATIONS:
- Always consider the user's budget context from their current product
- If they show you a $10 perfume, don't suggest $100 alternatives unless they ask
- Recommend products in the same price range or slightly better value
- Think practically - if something is unavoidable (like glass perfume bottles), don't penalize it

WHAT TO AVOID:
- Don't state the obvious ("for external use only" for perfumes, etc.)
- Don't nitpick normal design choices that can't be changed
- Don't give unnecessary warnings about standard product usage
- Skip redundant descriptions of what's in the image
- Only flag genuinely concerning health or ethical issues

WHEN ANALYZING PRODUCTS:
- Jump straight to health or sustainability insights
- Mention the product name naturally in your response, not as an announcement
- Focus on ingredients, materials, or practices that actually impact health/environment
- Give actionable advice when relevant

Keep it real, keep it helpful, and remember - you're their buddy, not a textbook.`;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
  }, [messages, loading]);

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

  /**
   * Build optimized conversation history for the AI model
   * - Prepend a system message that sets Nubo's persona & rules
   * - Only include image data in the FIRST message where it was uploaded
   * - For subsequent messages, reference "the image from earlier" via text context
   * - Keep last N messages to avoid token limit issues
   */
  const buildConversationHistory = (
    currentMessages: Message[],
    newUserText: string,
    newImageData?: string | null
  ): CoreMessage[] => {
    const MAX_HISTORY = 10; // Keep last 10 messages for context
    const recentMessages = currentMessages.slice(-MAX_HISTORY);

    // Start with the system prompt as the first message
    const history: CoreMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];

    // Append recent conversation messages
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        const content: Array<any> = [];
        if (msg.text) content.push({ type: 'text', text: msg.text });
        // Only include the image data if this message originally had it
        if (msg.imageUri && msg.hadImage) {
          content.push({ type: 'image', image: msg.imageUri });
        }
        history.push({ role: 'user', content });
      } else {
        history.push({
          role: 'assistant',
          content: msg.text || '',
        });
      }
    }

    // Build the new user message with contextual hinting
    const newContent: Array<any> = [];
    const hasImageInHistory = recentMessages.some((m) => m.hadImage && m.imageUri);

    let contextualText = newUserText;
    if (!newImageData && hasImageInHistory && newUserText) {
      // It's a follow-up referring to an earlier image
      contextualText = `Referring to the image from earlier in our conversation: ${newUserText}`;
    }

    if (contextualText) newContent.push({ type: 'text', text: contextualText });
    if (newImageData) newContent.push({ type: 'image', image: newImageData });

    history.push({
      role: 'user',
      content: newContent,
    });

    return history;
  };

  async function callModel(userText: string, imageData?: string | null) {
    setLoading(true);
    setError(null);

    // Add user message to UI immediately
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

      const google = createGoogleGenerativeAI({
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY,
      });
      const model = google('gemini-2.5-flash');

      // Build optimized conversation history (uses messages state BEFORE we appended userMessage above)
      const conversationHistory = buildConversationHistory(
        messages,
        userText || (imageData ? 'Analyze this product' : ''),
        imageData
      );

      // Call the model
      const { text: assistantText } = await generateText({
        model,
        messages: conversationHistory,
      });

      appendMessage({
        id: `a-${Date.now().toString()}`,
        role: 'assistant',
        text: assistantText?.trim() || 'Sorry — no response received.',
      });

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      console.error('Model call failed', err);
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
      setLoading(false);
      setInput('');
      setSelectedImage(null);
    }
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    await callModel(input.trim(), selectedImage);
  };

  return (
    <View className="flex-1">
      <View className="absolute inset-0">
        <View style={{ flex: 1, backgroundColor: '#F8FFFA' }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        style={{ flex: 1 }}>
        <View className="items-center gap-3 px-5 pb-5" style={{ paddingTop: insets.top + 16 }}>
          <Animated.View
            className="h-20 w-20 items-center justify-center rounded-full bg-green-50"
            style={{ transform: [{ scale: pulseAnim }] }}>
            <Sparkles size={32} color="#34C759" />
          </Animated.View>
          <Text className="text-center text-base font-semibold text-gray-500">
            Ask anything about your health or the planet
          </Text>
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

          {messages.map((m) => (
            <View
              key={m.id}
              style={{ marginVertical: 6, maxWidth: '90%' }}
              className={m.role === 'user' ? 'items-end self-end' : 'self-start'}>
              {m.imageUri && m.hadImage ? (
                <Image
                  source={{ uri: m.imageUri }}
                  style={{
                    width: 220,
                    height: 140,
                    borderRadius: 12,
                    marginBottom: 6,
                    backgroundColor: '#efefef',
                  }}
                  resizeMode="cover"
                />
              ) : null}

              <View
                style={{
                  backgroundColor: m.role === 'user' ? '#34C759' : '#FFFFFF',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 18,
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  shadowColor: '#000',
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                }}>
                <Text
                  style={{
                    color: m.role === 'user' ? '#fff' : '#000',
                    fontSize: 15,
                    lineHeight: 22,
                  }}>
                  {m.text}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="self-start rounded-[20px] bg-white px-4 py-3" style={{ marginTop: 8 }}>
              <Text className="text-sm font-semibold text-gray-500">Thinking…</Text>
            </View>
          )}
        </ScrollView>

        {messages.length === 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 }}>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => handleQuickPrompt(p)}
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E6E6E6',
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginTop: 8,
                }}>
                <Text style={{ color: '#16A34A', fontWeight: '600' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#EDEDED',
            backgroundColor: '#FAFAFA',
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: insets.bottom || 12,
          }}>
          {selectedImage && (
            <View
              style={{
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ECFDF0',
                padding: 8,
                borderRadius: 10,
              }}>
              <Text style={{ color: '#059669', fontWeight: '600' }}>Image selected</Text>
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Text style={{ color: '#DC2626', fontWeight: '600' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Upload size={18} color="#8E8E93" />
            </TouchableOpacity>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask something..."
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={500}
              style={{
                flex: 1,
                maxHeight: 100,
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 15,
              }}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() && !selectedImage}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: !input.trim() && !selectedImage ? '#E5E7EB' : '#34C759',
              }}>
              <Send size={16} color={!input.trim() && !selectedImage ? '#8E8E93' : '#fff'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
