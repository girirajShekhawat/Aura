import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { DEFAULT_SYSTEM_PROMPT } from './src/constants/model';
import { ChatScreen } from './src/screens/ChatScreen';
import { ModelDownloadScreen } from './src/screens/ModelDownloadScreen';
import {
  deleteModel as deleteModelFromDisk,
  downloadModelIfNeeded,
  isModelOnDisk,
} from './src/services/ModelManager';
import {
  initLlamaService,
  isLlamaReady,
  releaseLlama,
} from './src/services/LlamaService';

type Phase =
  | 'checking'
  | 'needsDownload'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'error';

const RELEASE_AFTER_MS = 60_000;

export default function App() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    received: number;
    total: number;
  } | null>(null);

  const phaseRef = useRef<Phase>(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const bootstrapIfModelPresent = useCallback(async () => {
    if (!isModelOnDisk()) {
      setPhase('needsDownload');
      return;
    }
    setPhase('loading');
    setErrorMessage(null);
    try {
      await initLlamaService();
      setPhase('ready');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load the model.';
      setErrorMessage(msg);
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhase('checking');
      setErrorMessage(null);
      try {
        if (!isModelOnDisk()) {
          if (!cancelled) setPhase('needsDownload');
          return;
        }
        if (!cancelled) setPhase('loading');
        await initLlamaService();
        if (!cancelled) setPhase('ready');
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error ? e.message : 'Could not load the model.';
        setErrorMessage(msg);
        setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let releaseTimer: ReturnType<typeof setTimeout> | null = null;

    const maybeReinitLlama = async () => {
      if (phaseRef.current !== 'ready') return;
      if (isLlamaReady()) return;
      if (!isModelOnDisk()) return;
      setPhase('loading');
      setErrorMessage(null);
      try {
        await initLlamaService();
        setPhase('ready');
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Could not reload the model.';
        setErrorMessage(msg);
        setPhase('error');
      }
    };

    const scheduleRelease = () => {
      if (releaseTimer != null) return;
      releaseTimer = setTimeout(() => {
        releaseTimer = null;
        void releaseLlama();
      }, RELEASE_AFTER_MS);
    };

    const clearRelease = () => {
      if (releaseTimer != null) {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }
    };

    const handleAppStateChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        scheduleRelease();
      }
      if (next === 'active') {
        clearRelease();
        void maybeReinitLlama();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearRelease();
      sub.remove();
    };
  }, []);

  const handleStartDownload = async () => {
    setPhase('downloading');
    setErrorMessage(null);
    setProgress(null);
    try {
      await downloadModelIfNeeded((received, total) =>
        setProgress({ received, total }),
      );
      setPhase('loading');
      await initLlamaService();
      setPhase('ready');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Download failed.';
      setErrorMessage(msg);
      setPhase('error');
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    if (!isModelOnDisk()) {
      setPhase('needsDownload');
      return;
    }
    void bootstrapIfModelPresent();
  };

  let body: ReactNode = null;

  if (phase === 'checking') {
    body = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.muted}>Preparing…</Text>
      </View>
    );
  } else if (phase === 'needsDownload') {
    body = (
      <ModelDownloadScreen
        onStartDownload={() => void handleStartDownload()}
        progress={progress}
        isDownloading={false}
        error={null}
      />
    );
  } else if (phase === 'downloading') {
    body = (
      <ModelDownloadScreen
        onStartDownload={() => void handleStartDownload()}
        progress={progress}
        isDownloading
        error={errorMessage}
      />
    );
  } else if (phase === 'loading') {
    body = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.muted}>Loading model into memory…</Text>
      </View>
    );
  } else if (phase === 'ready') {
    body = <ChatScreen systemPrompt={DEFAULT_SYSTEM_PROMPT} />;
  } else if (phase === 'error') {
    body = (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        {!isModelOnDisk() ? (
          <Pressable style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Back to download</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        )}
        {isModelOnDisk() ? (
          <Pressable
            style={[styles.button, styles.secondary]}
            onPress={async () => {
              await releaseLlama();
              await deleteModelFromDisk();
              setErrorMessage(null);
              setPhase('needsDownload');
            }}>
            <Text style={[styles.buttonText, styles.secondaryText]}>
              Delete downloaded model &amp; re-download
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        {body}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fafafa',
  },
  muted: {
    marginTop: 12,
    color: '#71717a',
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#52525b',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#18181b',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    maxWidth: 320,
  },
  secondary: {
    marginTop: 12,
    backgroundColor: '#e4e4e7',
  },
  buttonText: {
    color: '#fafafa',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryText: {
    color: '#18181b',
  },
});
