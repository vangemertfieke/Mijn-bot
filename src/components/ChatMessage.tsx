import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isAssistant: boolean;
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAssistant, timestamp }) => {
  return (
    <div className={`flex gap-3 p-4 ${isAssistant ? 'bg-gray-50' : 'bg-white'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAssistant ? 'bg-blue-100' : 'bg-green-100'
      }`}>
        {isAssistant ? (
          <Bot className="w-5 h-5 text-blue-600" />
        ) : (
          <User className="w-5 h-5 text-green-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {isAssistant ? 'Assistant' : 'Jij'}
          </span>
          <span className="text-xs text-gray-500">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="text-gray-800 whitespace-pre-wrap break-words">
          {message}
        </div>
      </div>
    </div>
  );
};