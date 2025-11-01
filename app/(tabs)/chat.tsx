import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Send, Sparkles, Upload } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

/**
 * TODO: replace this with process.env usage later.
 * Paste your Vercel AI Gateway API key here for now.
 */
const API_KEY = 'AIzaSyCYo2oYyrUpeaDuD0qAN0WT7c8zX7MEWHM';
const MODEL_ID = 'google/gemini-2.5-flash';

const QUICK_PROMPTS = ['Is this healthy?', 'Is this eco-friendly?', 'Suggest a better option'];

type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'tool'; toolName: string; state: string; output?: any; errorText?: string };

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
  createdAt: number;
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  async function sendMessage(messageBody: { text?: string; imageDataUri?: string }) {
    // Add user message locally
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      createdAt: Date.now(),
      parts: [
        {
          type: 'text',
          text: messageBody.imageDataUri
            ? `${messageBody.text || 'Analyze this product'}\n\n[IMAGE ATTACHED]`
            : messageBody.text || '',
        },
      ],
    };
    setMessages((m) => [...m, userMsg]);

    // Create assistant placeholder
    const assistantId = Math.random().toString();
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      createdAt: Date.now(),
      parts: [{ type: 'tool', toolName: 'vercel_ai', state: 'input-streaming' }],
    };
    setMessages((m) => [...m, assistantPlaceholder]);
    setIsProcessing(true);

    try {
      const messagesForApi = buildMessagesForApi([...messages, userMsg]);

      // If there is an image, append it as plain text (data URI).
      if (messageBody.imageDataUri) {
        messagesForApi.push({
          role: 'user',
          content: [
            { type: 'text', text: messageBody.text || 'Please analyze this product image.' },
            {
              type: 'text',
              text: `IMAGE_DATA_URI:\n${messageBody.imageDataUri.substring(0, 300)}...[truncated]`,
            },
          ],
        });
      }

      // Prepare request body for Vercel AI Gateway (OpenAI-compatible chat completions)
      const reqBody = {
        model: MODEL_ID,
        messages: messagesForApi.map((m) => {
          // Flatten content array to string for compatibility
          const contents = Array.isArray(m.content)
            ? m.content.map((c: any) => (c.type === 'text' ? c.text : '')).join('\n')
            : (m.content?.text ?? '');
          return {
            role: m.role,
            content: contents,
          };
        }),
        stream: false, // non-streaming for simplicity. Can change to true + SSE handling later.
      };

      const res = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Vercel AI error: ${res.status} ${text}`);
      }

      const json = await res.json();

      // The OpenAI-compatible response shape: choices[0].message.content
      const assistantText =
        json?.choices?.[0]?.message?.content ??
        json?.choices?.[0]?.message ??
        json?.choices?.[0]?.text ??
        JSON.stringify(json);

      // Replace assistant placeholder with actual response
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== assistantId) return msg;
          // Try to parse JSON embedded inside assistant text (to support structured suggestions)
          const parsedTool = tryExtractJSON(assistantText);
          if (parsedTool && parsedTool.productName) {
            return {
              ...msg,
              parts: [
                {
                  type: 'tool',
                  toolName: 'suggestProduct',
                  state: 'output-available',
                  output: parsedTool,
                } as MessagePart,
              ],
            };
          }

          // fallback: plain assistant text
          return {
            ...msg,
            parts: [{ type: 'text', text: String(assistantText) }],
          };
        })
      );
    } catch (err: any) {
      console.error('AI call failed:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                parts: [
                  {
                    type: 'tool',
                    toolName: 'vercel_ai',
                    state: 'output-error',
                    errorText: err?.message ?? 'Unknown error',
                  } as MessagePart,
                ],
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const textToSend = input.trim() || undefined;
    const imageToSend = selectedImage || undefined;

    setInput('');
    setSelectedImage(null);

    await sendMessage({ text: textToSend, imageDataUri: imageToSend });
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const isProcessingLocal =
    isProcessing ||
    messages.some((m) =>
      m.parts.some((p) => p.type === 'tool' && (p as any).state === 'input-streaming')
    );

  return (
    <View className="flex-1 bg-transparent">
      <LinearGradient colors={['#F0FDF4', '#FAFAFA']} className="absolute inset-0" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        style={{ flex: 1 }}>
        <View className="items-center gap-y-3 px-5 pb-5" style={{ paddingTop: insets.top + 16 }}>
          <Animated.View
            className="h-20 w-20 items-center justify-center rounded-full bg-[#E8F5E9]"
            style={{ transform: [{ scale: pulseAnim }] }}>
            <Sparkles size={32} color="#34C759" />
          </Animated.View>
          <Text className="text-center text-base font-semibold text-[#8E8E93]">
            Ask me anything about your health or the planet
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}>
          {messages.length === 0 && (
            <View className="items-center gap-y-3 px-5 py-10">
              <Text className="text-xl font-extrabold text-black">Start a Conversation</Text>
              <Text className="text-center text-sm font-medium leading-6 text-[#8E8E93]">
                Ask questions about products, get health tips, or find eco-friendly alternatives
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View key={message.id} className="mb-3">
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  const bubbleBase = 'max-w-[80%] px-4 py-3 rounded-2xl';
                  const bubbleRole =
                    message.role === 'user' ? 'bg-[#34C759] self-end' : 'bg-white self-start';
                  const textRole = message.role === 'user' ? 'text-white' : 'text-black';

                  return (
                    <View key={`${message.id}-${index}`} className={`${bubbleBase} ${bubbleRole}`}>
                      <Text className={`text-[15px] font-medium leading-6 ${textRole}`}>
                        {part.text}
                      </Text>
                    </View>
                  );
                }

                if (part.type === 'tool') {
                  // tool style rendering (suggestProduct / processing / errors)
                  if (part.state === 'input-streaming' || part.state === 'input-available') {
                    return (
                      <View
                        key={`${message.id}-${index}`}
                        className="self-start rounded-2xl bg-[#F2F2F7] px-4 py-3">
                        <Text className="text-sm font-semibold text-[#8E8E93]">
                          Analyzing with Vercel AI...
                        </Text>
                      </View>
                    );
                  }

                  if (part.state === 'output-available') {
                    const output = (part as any).output;
                    if ((part as any).toolName === 'suggestProduct' && output) {
                      return (
                        <View
                          key={`${message.id}-${index}`}
                          className="max-w-[90%] self-start rounded-xl bg-white p-5">
                          <Text className="text-lg font-bold text-black">{output.productName}</Text>
                          <Text className="mt-2 text-sm font-medium leading-6 text-[#8E8E93]">
                            {output.reason}
                          </Text>

                          <View className="mt-3 flex-row space-x-4">
                            <View className="flex-row items-center space-x-2">
                              <Text className="text-sm font-semibold text-[#8E8E93]">Health</Text>
                              <Text
                                className="text-[18px] font-extrabold"
                                style={{ color: getScoreColor(output.healthScore) }}>
                                {output.healthScore}
                              </Text>
                            </View>

                            <View className="flex-row items-center space-x-2">
                              <Text className="text-sm font-semibold text-[#8E8E93]">Planet</Text>
                              <Text
                                className="text-[18px] font-extrabold"
                                style={{ color: getScoreColor(output.planetScore) }}>
                                {output.planetScore}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    }

                    // generic tool output fallback
                    return (
                      <View
                        key={`${message.id}-${index}`}
                        className="self-start rounded-2xl bg-[#F2F2F7] px-4 py-3">
                        <Text className="text-sm font-semibold text-[#8E8E93]">
                          {JSON.stringify((part as any).output)}
                        </Text>
                      </View>
                    );
                  }

                  if (part.state === 'output-error') {
                    return (
                      <View
                        key={`${message.id}-${index}`}
                        className="self-start rounded-2xl bg-[#FFEBEE] px-4 py-3">
                        <Text className="text-sm font-medium text-[#FF453A]">{part.errorText}</Text>
                      </View>
                    );
                  }
                }

                return null;
              })}
            </View>
          ))}

          {isProcessingLocal && (
            <View className="flex-row space-x-2 self-start rounded-2xl bg-white px-4 py-3">
              <View className="h-2 w-2 rounded-full bg-[#8E8E93]" />
              <View className="h-2 w-2 rounded-full bg-[#8E8E93]" />
              <View className="h-2 w-2 rounded-full bg-[#8E8E93]" />
            </View>
          )}
        </ScrollView>

        {messages.length === 0 && (
          <View className="flex-row flex-wrap space-x-2 px-5 py-3">
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                className="rounded-2xl border border-[#F2F2F7] bg-white px-4 py-2"
                onPress={() => handleQuickPrompt(prompt)}>
                <Text className="text-sm font-semibold text-[#34C759]">{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View
          className="border-t border-[#F2F2F7] bg-[#FAFAFA] px-5 pt-3"
          style={{ paddingBottom: insets.bottom }}>
          {selectedImage && (
            <View className="mb-2 flex-row items-center justify-between rounded-md bg-[#E8F5E9] px-3 py-2">
              <Text className="text-sm font-semibold text-[#34C759]">Image selected</Text>
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Text className="text-sm font-semibold text-[#FF453A]">Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-end space-x-2 pb-3">
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
              onPress={pickImage}>
              <Upload size={20} color="#8E8E93" />
            </TouchableOpacity>

            <TextInput
              className="max-h-[100px] flex-1 rounded-2xl bg-white px-4 py-2 text-[15px] font-medium text-black"
              placeholder="Ask something..."
              placeholderTextColor="#8E8E93"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              className={`h-10 w-10 items-center justify-center rounded-full ${!input.trim() && !selectedImage ? 'bg-[#F2F2F7]' : 'bg-[#34C759]'}`}
              onPress={handleSend}
              disabled={!input.trim() && !selectedImage}>
              <Send size={20} color={!input.trim() && !selectedImage ? '#8E8E93' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/** helpers **/

function getScoreColor(score: number): string {
  if (score >= 75) return '#34C759';
  if (score >= 50) return '#FFB800';
  return '#FF453A';
}

// Build messages for API by taking last N messages and mapping to provider format.
// We store simple text parts only — feel free to expand for multimodal content later.
function buildMessagesForApi(history: ChatMessage[]) {
  // map to OpenAI-compatible role/content structures
  return history.map((m) => {
    const textParts = m.parts
      .map((p) => (p.type === 'text' ? p.text : ''))
      .filter(Boolean)
      .join('\n');
    return {
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: [{ type: 'text', text: textParts }],
    };
  });
}

// Try to extract JSON object from assistant text. E.g. model returns:
// "Here's my suggestion:\n```json\n{ "productName": "...", "reason": "...", "healthScore": 80, "planetScore": 70 }\n```"
function tryExtractJSON(text: string) {
  if (!text || typeof text !== 'string') return null;
  // Look for a JSON block between triple backticks or braces.
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = codeFenceMatch ? codeFenceMatch[1] : text;
  // try to find first {...} block
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const jsonText = raw.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonText);
      // validate minimal shape
      const schema = z.object({
        productName: z.string().optional(),
        reason: z.string().optional(),
        healthScore: z.number().optional(),
        planetScore: z.number().optional(),
      });
      return schema.parse(parsed);
    } catch (e) {
      // not JSON
      return null;
    }
  }
  return null;
}
