import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MODEL_DISPLAY_NAME } from '../constants/model';
import { isModelOnDisk, modelDestinationFile } from '../services/ModelManager';

function formatMb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ModelsScreen() {
  const onDisk = isModelOnDisk();
  const sizeBytes =
    onDisk && typeof modelDestinationFile.size === 'number'
      ? modelDestinationFile.size
      : 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Models</Text>
      <View style={styles.card}>
        <Text style={styles.modelName}>{MODEL_DISPLAY_NAME}</Text>
        <Text style={styles.meta}>
          {onDisk ? `Installed · ${formatMb(sizeBytes)} on device` : 'Not installed'}
        </Text>
      </View>
      <Text style={styles.hint}>
        Download and updates are handled from the main flow when no model is present.
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e4e4e7',
    marginBottom: 16,
  },
  modelName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 8,
  },
  meta: {
    fontSize: 15,
    color: '#52525b',
  },
  hint: {
    fontSize: 14,
    color: '#71717a',
    lineHeight: 20,
  },
});
