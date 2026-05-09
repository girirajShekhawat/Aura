import { StyleSheet, Text, View } from 'react-native';

export type BubbleRole = 'user' | 'assistant' | 'system';

export function MessageBubble({
  role,
  content,
}: {
  role: BubbleRole;
  content: string;
}) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
      ]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          role === 'system' && styles.systemBubble,
        ]}>
        {(isAssistant || role === 'system') && (
          <Text style={styles.label}>
            {role === 'system' ? 'System' : 'Assistant'}
          </Text>
        )}
        {isUser && <Text style={styles.label}>You</Text>}
        <Text
          selectable
          style={[
            styles.body,
            isUser ? styles.userText : styles.assistantText,
          ]}>
          {content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    paddingHorizontal: 12,
    width: '100%',
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#2563eb',
  },
  assistantBubble: {
    backgroundColor: '#f4f4f5',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e4e4e7',
  },
  systemBubble: {
    backgroundColor: '#fef9c3',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fde047',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    color: '#71717a',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#18181b',
  },
});
