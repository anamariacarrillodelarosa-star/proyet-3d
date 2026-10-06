import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, Loader2, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { ModelAnalysis, PrintConfig } from '../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

interface ProyetBotChatProps {
  modelAnalysis: ModelAnalysis | null;
  currentConfig: PrintConfig;
  isOpen: boolean;
  onToggle: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const ProyetBotChat: React.FC<ProyetBotChatProps> = ({
  modelAnalysis,
  currentConfig,
  isOpen,
  onToggle,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: '¡Hola! Soy **ProyetBot**, el asistente técnico de fabricación de PROYET 3D.\n\n¿Tienes dudas sobre qué material elegir para tu pieza (resistencia al sol, calor o esfuerzo mecánico), tolerancias o tiempos de entrega?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle external prompts (e.g. from material guide buttons)
  useEffect(() => {
    if (externalPrompt) {
      if (!isOpen) onToggle();
      sendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          modelContext: modelAnalysis
            ? {
                name: modelAnalysis.fileName,
                dimensions: modelAnalysis.dimensions,
                volumeCm3: modelAnalysis.volumeCm3,
                weightGrams: modelAnalysis.weightGrams,
                material: currentConfig.material,
                infill: currentConfig.infillPercent,
                hasOverhangs: modelAnalysis.hasOverhangs,
              }
            : null,
        }),
      });

      const data = await response.json();
      const botReply = data.reply || 'Disculpa, no he podido procesar tu solicitud.';

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: 'Ha ocurrido un error de conexión con el servidor. Pero puedo decirte que para exteriores al sol recomendamos **ASA** o **PETG**, y para piezas mecánicas **PETG** o **ABS**.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    '☀️ ¿Qué material para exterior y sol?',
    '⚡ ¿Cuál es el mejor material para piezas flexibles?',
    '⏱️ ¿Cuánto tiempo tarda mi pedido?',
    '🔧 ¿Qué relleno (infill) necesito para soporte mecánico?',
  ];

  // Simple formatting helper for markdown bold and bullet points
  const formatBotText = (txt: string) => {
    return txt.split('\n').map((line, idx) => {
      // Bold replace
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span
          key={idx}
          className="block mb-1 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Collapsed Bubble Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={onToggle}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#184E77] to-[#1E6091] hover:from-[#1E6091] hover:to-[#184E77] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 cursor-pointer active:scale-95"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-extrabold tracking-wide block">Asistente Técnico 3D</span>
            <span className="text-[10px] text-blue-200">ProyetBot en línea</span>
          </div>
        </button>
      ) : (
        /* Expanded Chat Window */
        <div className="w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#184E77] to-[#1E6091] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold">ProyetBot</h4>
                  <span className="text-[10px] font-semibold bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">
                    En línea
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">Ingeniero Técnico · Proyet 3D</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Model Context Pill (if model is loaded) */}
          {modelAnalysis && (
            <div className="bg-blue-50/90 px-4 py-2 border-b border-blue-100 flex items-center justify-between text-[11px] text-slate-700">
              <span className="truncate max-w-[240px]">
                📦 Pieza activa: <strong>{modelAnalysis.fileName}</strong> ({modelAnalysis.volumeCm3.toFixed(1)} cm³)
              </span>
              <span className="font-mono font-bold text-[#1E6091]">{currentConfig.material}</span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-[#1E6091] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#1E6091] text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <div>{formatBotText(m.text)}</div>
                  <span
                    className={`text-[9px] mt-1 block text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#1E6091] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E6091]" />
                  <span>ProyetBot está analizando tu consulta...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Pills */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q)}
                className="whitespace-nowrap text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-[#1E6091] px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-blue-200/60"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pregunta sobre materiales, tolerancias..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#1E6091] focus:ring-1 focus:ring-[#1E6091] outline-hidden"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-[#1E6091] hover:bg-[#184E77] text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
