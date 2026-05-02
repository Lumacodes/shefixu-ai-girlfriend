import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../hooks/useAI';
import { useSpeech } from '../hooks/useSpeech';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface ChatUIProps {
  onAudioLevel: (level: number) => void;
}

export const ChatUI = ({ onAudioLevel }: ChatUIProps) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { sendMessage } = useAI();
  const { speak, stop, audioLevel } = useSpeech();

  useEffect(() => { onAudioLevel(audioLevel); }, [audioLevel, onAudioLevel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); stop(); };
    recognition.onresult = (event: any) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setInput(final || interim);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [stop]);

  const toggleListen = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setInput(''); recognitionRef.current?.start(); }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isThinking) return;
    if (isListening) recognitionRef.current?.stop();
    stop();

    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'user' }]);
    setInput('');
    setIsThinking(true);

    const history = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    const aiResponse = await sendMessage(text, history);
    setIsThinking(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai' }]);
    speak(aiResponse);
  };

  return (
    <div className="ui-container">
      <div className="brand-label">
        <span className="brand-name">shefixu</span>
        <span className="brand-sub">subhajit</span>
      </div>

      <div className="chat-history">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className={`message ${msg.sender}`}
            >
              {msg.text}
            </motion.div>
          ))}
          {isThinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="message ai thinking"
            >
              <span className="dot" /><span className="dot" /><span className="dot" />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="input-area glass-card"
      >
        <button className="icon-button" onClick={toggleListen} style={{ color: isListening ? 'var(--accent)' : undefined }} id="mic-button">
          <Mic size={20} />
        </button>
        <input
          type="text"
          placeholder={isListening ? 'Listening...' : 'Say something to Aria...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          id="chat-input"
        />
        <button className="icon-button" onClick={handleSend} id="send-button">
          <Send size={20} style={{ color: 'var(--accent)' }} />
        </button>
      </motion.div>
    </div>
  );
};
