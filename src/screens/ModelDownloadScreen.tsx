import { useMemo } from 'react';
import {
  ActivityIndicator,
  type DimensionValue,
  type ViewStyle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  MODEL_DISPLAY_NAME,
  MODEL_EXPECTED_BYTES_FALLBACK,
} from '../constants/model';

function formatMb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ModelDownloadScreen({
  onStartDownload,
  progress,
  isDownloading,
  error,
}: {
  onStartDownload: () => void;
  progress: { received: number; total: number } | null;
  isDownloading: boolean;
  error: string | null;
}) {
  const totalDisplay = Math.max(progress?.total ?? MODEL_EXPECTED_BYTES_FALLBACK, 1);
  const received = Math.max(progress?.received ?? 0, 0);
  const ratio = Math.min(received / totalDisplay, 1);

  const isIndeterminateProgress = Platform.OS === 'ios';

  const barFillStyle = useMemo(
    (): ViewStyle => ({
      height: '100%',
      backgroundColor: '#2563eb',
      borderRadius: 7,
      width: `${Math.round(ratio * 100)}%` as DimensionValue,
    }),
    [ratio],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Download model</Text>
      <Text style={styles.subtitle}>
        {MODEL_DISPLAY_NAME} ({formatMb(totalDisplay)} approx.)
      </Text>
      <Text style={styles.hint}>
        Runs fully offline after the first download. Use Wi‑Fi if possible.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.progressOuter}>
        {isDownloading && isIndeterminateProgress ? (
          <View style={styles.indeterminateWrap}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.indeterminateText}>Downloading…</Text>
          </View>
        ) : (
          <View style={styles.progressInner}>
            <View style={barFillStyle} />
          </View>
        )}
      </View>

      {!isIndeterminateProgress && isDownloading ? (
        <Text style={styles.counter}>
          {formatMb(received)} / {formatMb(totalDisplay)}
        </Text>
      ) : null}

      {!isDownloading ? (
        <Pressable style={styles.button} onPress={onStartDownload}>
          <Text style={styles.buttonText}>Download &amp; continue</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    color: '#09090b',
  },
  subtitle: {
    fontSize: 16,
    color: '#52525b',
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 24,
    lineHeight: 20,
  },
  error: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 16,
  },
  progressOuter: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e4e4e7',
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'center',
  },
  progressInner: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
  },
  indeterminateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  indeterminateText: {
    fontSize: 14,
    color: '#52525b',
    fontWeight: '500',
  },
  counter: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#18181b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
  },
});
