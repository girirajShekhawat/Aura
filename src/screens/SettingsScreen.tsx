import { ScrollView, StyleSheet, Text } from 'react-native';

export function SettingsScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.muted}>
        App preferences and advanced options will appear here in a future update.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 12,
  },
  muted: {
    fontSize: 15,
    color: '#71717a',
    lineHeight: 22,
  },
});
