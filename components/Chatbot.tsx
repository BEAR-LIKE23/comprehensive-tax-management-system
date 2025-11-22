import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/apiService';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Hello! How can I help you with your taxes today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        const botResponse = await getChatbotResponse(userMessage);
        setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        setIsLoading(false);
    };

    return (
        <>
            <div className={`fixed bottom-24 right-4 sm:right-8 transition-all duration-300 z-40 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
                    <div className="bg-green-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">Tax Assistant Bot</h3>
                    </div>
                    <div className="flex-1 p-4 text-sm text-gray-700 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                   {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-800 p-2 rounded-lg">
                                    <span className="animate-pulse">...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-2 border-t flex">
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            className="flex-1 px-2 py-1 border rounded-l text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            className="px-4 py-1 bg-green-600 text-white rounded-r hover:bg-green-700 disabled:bg-green-400"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 bg-green-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center focus:outline-none hover:bg-green-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>
        </>
    );
};

export default Chatbot;