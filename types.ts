
// Fix: Define AppMode enum for consistent mode handling across components
export enum AppMode {
  LANGUAGE = 'LANGUAGE',
  HISTORY = 'HISTORY',
  QUIZ = 'QUIZ',
  VIDEO = 'VIDEO'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isAudio?: boolean;
  sources?: GroundingSource[];
  maps?: GroundingSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastTimestamp: number;
}
