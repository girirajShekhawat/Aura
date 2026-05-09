import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function PrivacyScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Privacy</Text>
      <Text style={styles.lead}>
        Aura is built so your conversations stay on this device.
      </Text>
      <View style={styles.block}>
        <Text style={styles.bullet}>• Inference runs locally — no messages are sent to our servers.</Text>
        <Text style={styles.bullet}>
          • The model file is stored only in this app&apos;s private storage.
        </Text>
        <Text style={styles.bullet}>• Network access is used only when you download or update the model.</Text>
      </View>
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
  lead: {
    fontSize: 16,
    color: '#3f3f46',
    lineHeight: 24,
    marginBottom: 24,
  },
  block: {
    gap: 14,
  },
  bullet: {
    fontSize: 15,
    color: '#52525b',
    lineHeight: 22,
  },
});
