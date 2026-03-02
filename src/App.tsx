import { useState, useEffect } from 'react';
import { Message } from './types';
import { getChatResponse } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import MapDisplay from './components/MapDisplay';
import { MapPin, Info, Navigation2 } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Location access denied. Some features may be limited.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { text: responseText, groundingChunks } = await getChatResponse(text, location || undefined);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        groundingChunks,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto lg:h-[calc(100vh-4rem)] flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* Map Section - Top on Mobile, Right on Desktop */}
        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col gap-6 min-h-0">
          <div className="h-[300px] lg:flex-1 min-h-0">
            {location ? (
              <MapDisplay center={[location.latitude, location.longitude]} />
            ) : (
              <div className="h-full w-full bg-white rounded-2xl border border-black/5 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                <div className="animate-pulse p-4 bg-zinc-100 rounded-full">
                  <Navigation2 className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium">Detecting your location...</p>
              </div>
            )}
          </div>

          {/* Info Section - Hidden on small mobile, visible on tablet/desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">About GeoChat AI</h3>
                <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                  This assistant uses real-time data from Google Maps and Search to provide accurate local information. 
                  Ask about nearby places, directions, or local history.
                </p>
                {error && (
                  <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-xs text-amber-700 font-medium">{error}</span>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">System Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Grounding Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section - Bottom on Mobile, Left on Desktop */}
        <div className="order-2 lg:order-1 lg:col-span-5 h-[500px] lg:h-full flex flex-col min-h-0">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        </div>

      </div>
    </div>
  );
}
