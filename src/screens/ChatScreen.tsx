import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MessageBubble } from '../components/MessageBubble';
import { chat, type ChatMessage } from '../services/LlamaService';

type ListItem = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

function makeId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatScreen({ systemPrompt }: { systemPrompt: string }) {
  const [input, setInput] = useState('');
  /** Chronological — oldest first */
  const [items, setItems] = useState<ListItem[]>([]);
  const [generating, setGenerating] = useState(false);

  const tokenBufferRef = useRef('');
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const flushTokenBufferToLastAssistant = useCallback(() => {
    const pending = tokenBufferRef.current;
    if (!pending) return;
    tokenBufferRef.current = '';
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next[next.length - 1];
      if (!last || last.role !== 'assistant') return prev;
      next[next.length - 1] = {
        ...last,
        content: last.content + pending,
      };
      return next;
    });
  }, []);

  const startFlushPump = useCallback(() => {
    if (flushTimerRef.current) return;
    flushTimerRef.current = setInterval(() => {
      flushTokenBufferToLastAssistant();
    }, 50);
  }, [flushTokenBufferToLastAssistant]);

  useEffect(
    () => () => {
      tokenBufferRef.current = '';
      clearFlushTimer();
    },
    [clearFlushTimer],
  );

  const buildMessagesForModel = useCallback(
    (historyBeforeSend: ListItem[], userTurn: string): ChatMessage[] => {
      const base: ChatMessage[] = [{ role: 'system', content: systemPrompt }];
      for (const m of historyBeforeSend) {
        base.push({ role: m.role, content: m.content });
      }
      base.push({ role: 'user', content: userTurn });
      return base;
    },
    [systemPrompt],
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || generating) return;

    const userMsg: ListItem = { id: makeId(), role: 'user', content: trimmed };
    const asstPlaceholder: ListItem = { id: makeId(), role: 'assistant', content: '' };

    setInput('');
    setGenerating(true);

    tokenBufferRef.current = '';
    startFlushPump();

    setItems([...items, userMsg, asstPlaceholder]);

    try {
      const messages = buildMessagesForModel(items, trimmed);
      await chat(messages, (token) => {
        tokenBufferRef.current += token;
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Generation failed';
      setItems((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'assistant' && last.content === '') {
          next[next.length - 1] = {
            ...last,
            content: `Error: ${message}`,
          };
        } else {
          next.push({
            id: makeId(),
            role: 'assistant',
            content: `Error: ${message}`,
          });
        }
        return next;
      });
    } finally {
      clearFlushTimer();
      flushTokenBufferToLastAssistant();
      setGenerating(false);
    }
  }, [
    input,
    generating,
    items,
    buildMessagesForModel,
    startFlushPump,
    clearFlushTimer,
    flushTokenBufferToLastAssistant,
  ]);

  const listData = [...items].reverse();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <FlatList
        inverted
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MessageBubble role={item.role} content={item.content} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Ask anything — responses run on-device with no network.
          </Text>
        }
      />

      {generating ? (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.typingText}>Generating…</Text>
        </View>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor="#a1a1aa"
          value={input}
          onChangeText={setInput}
          editable={!generating}
          multiline
          maxLength={4000}
        />
        <Pressable
          style={[styles.send, (!input.trim() || generating) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || generating}>
          <Text style={styles.sendLabel}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  listContent: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  empty: {
    textAlign: 'center',
    color: '#71717a',
    marginTop: 48,
    paddingHorizontal: 24,
    fontSize: 15,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 13,
    color: '#52525b',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e4e4e7',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#18181b',
    backgroundColor: '#fafafa',
  },
  send: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  sendDisabled: {
    opacity: 0.45,
  },
  sendLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
