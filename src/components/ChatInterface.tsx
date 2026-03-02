import { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Search, ExternalLink, Loader2, Languages } from 'lucide-react';
import Markdown from 'react-markdown';
import { Message, GroundingChunk, Language } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TRANSLATIONS = {
  en: {
    title: "GeoChat AI",
    subtitle: "Real-time Location Assistant",
    placeholder: "Ask about a location...",
    emptyTitle: "Ask anything about your surroundings",
    emptySubtitle: '"Find Italian restaurants nearby" or "What\'s the history of this area?"',
    thinking: "Thinking...",
    whereAmI: "Where am I?",
    viewOnMaps: "View on Google Maps",
    source: "Source"
  },
  uz: {
    title: "GeoChat AI",
    subtitle: "Real-vaqtda joylashuv yordamchisi",
    placeholder: "Joylashuv haqida so'rang...",
    emptyTitle: "Atrofingiz haqida xohlagan narsani so'rang",
    emptySubtitle: '"Yaqin atrofdagi italyan restoranlarini toping" yoki "Ushbu hududning tarixi qanday?"',
    thinking: "O'ylamoqda...",
    whereAmI: "Men qayerdaman?",
    viewOnMaps: "Google Xaritalarda ko'rish",
    source: "Manba"
  },
  ru: {
    title: "GeoChat AI",
    subtitle: "Помощник по местоположению в реальном времени",
    placeholder: "Спросите о местоположении...",
    emptyTitle: "Спрашивайте что угодно о вашем окружении",
    emptySubtitle: '"Найдите итальянские рестораны поблизости" или "Какова история этого района?"',
    thinking: "Думаю...",
    whereAmI: "Где я?",
    viewOnMaps: "Посмотреть на Google Картах",
    source: "Источник"
  }
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading, 
  language, 
  onLanguageChange 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/5 bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 leading-none">{t.title}</h2>
            <p className="text-xs text-zinc-500 mt-1">{t.subtitle}</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-zinc-200/50 p-1 rounded-lg">
          {(['en', 'uz', 'ru'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={cn(
                "px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                language === lang 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="p-4 bg-zinc-100 rounded-full">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-medium text-zinc-900">{t.emptyTitle}</p>
              <p className="text-xs text-zinc-500 mt-1">{t.emptySubtitle}</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div 
            key={message.id}
            className={cn(
              "flex flex-col max-w-[85%]",
              message.role === 'user' ? "ml-auto items-end" : "items-start"
            )}
          >
            <div 
              className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === 'user' 
                  ? "bg-zinc-900 text-white rounded-tr-none" 
                  : "bg-zinc-100 text-zinc-800 rounded-tl-none"
              )}
            >
              <div className="markdown-body">
                <Markdown>{message.text}</Markdown>
              </div>
            </div>

            {/* Grounding Links */}
            {message.groundingChunks && message.groundingChunks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.groundingChunks.map((chunk, idx) => (
                  <a
                    key={idx}
                    href={chunk.maps?.uri || chunk.web?.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 rounded-full text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm"
                  >
                    {chunk.maps ? <MapPin className="w-3 h-3 text-red-500" /> : <Search className="w-3 h-3 text-blue-500" />}
                    <span className="truncate max-w-[120px]">{chunk.maps?.title || chunk.web?.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                ))}
              </div>
            )}
            
            <span className="text-[10px] text-zinc-400 mt-1 px-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium">{t.thinking}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t border-black/5 bg-white"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSendMessage(t.whereAmI)}
            disabled={isLoading}
            title={t.whereAmI}
            className="p-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="w-full pl-4 pr-12 py-3 bg-zinc-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
