import { useState, useCallback, useRef, useEffect } from 'react';
import { openAI } from '../services/openai';

interface Message {
  id: string;
  content: string;
  isAssistant: boolean;
  timestamp: Date;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadIdRef = useRef<string | null>(null);

  const initializeThread = useCallback(async () => {
    try {
      if (!threadIdRef.current) {
        threadIdRef.current = await openAI.createThread();
      }
    } catch (err) {
      setError('Fout bij het initialiseren van de chat');
      console.error('Thread creation error:', err);
    }
  }, []);

  useEffect(() => {
    initializeThread();
  }, [initializeThread]);

  const sendMessage = useCallback(async (content: string) => {
    if (!threadIdRef.current) {
      await initializeThread();
      if (!threadIdRef.current) return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isAssistant: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Voeg bericht toe aan thread
      await openAI.addMessage(threadIdRef.current, content);
      
      // Start assistant run
      const runId = await openAI.runAssistant(threadIdRef.current);
      
      // Wacht tot completion
      await openAI.waitForCompletion(threadIdRef.current, runId);
      
      // Haal berichten op
      const threadMessages = await openAI.getMessages(threadIdRef.current);
      
      // Vind het laatste assistant bericht
      const latestAssistantMessage = threadMessages
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => b.created_at - a.created_at)[0];

      if (latestAssistantMessage && latestAssistantMessage.content[0]?.text?.value) {
        const assistantMessage: Message = {
          id: latestAssistantMessage.id,
          content: latestAssistantMessage.content[0].text.value,
          isAssistant: true,
          timestamp: new Date(latestAssistantMessage.created_at * 1000),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      setError('Fout bij het versturen van bericht');
      console.error('Message send error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [initializeThread]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError,
  };
};