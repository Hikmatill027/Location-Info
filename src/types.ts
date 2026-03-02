export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  groundingChunks?: GroundingChunk[];
  timestamp: number;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
  web?: {
    uri: string;
    title: string;
  };
}
