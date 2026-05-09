import { DEFAULT_SYSTEM_PROMPT } from '../constants/model';
import { ChatScreen } from './ChatScreen';

/** Tab route wrapper so ChatScreen + deps load in a stable module order (Hermes / Fast Refresh). */
export function ChatTabScreen() {
  return <ChatScreen systemPrompt={DEFAULT_SYSTEM_PROMPT} />;
}
