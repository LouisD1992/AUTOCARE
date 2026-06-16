import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Bot, User, Sparkles, BrainCircuit, ShieldAlert } from "lucide-react";

export default function AiChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: "Xin chào! Tôi là RoyalAuto Fleet AI Co-pilot - Trợ lý thông minh phụ trách quản lý số km, tính định mức xăng xe và chuẩn đoán kỹ thuật hạm đội xe ô tô của bạn. \n\nHôm nay tôi có thể hỗ trợ gì cho bạn về: tính chi phí chuyến đi, tư vấn lịch bảo hiểm động cơ hay giải mã đèn báo lỗi táp-lô?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Suggested preset questions on vehicle tracking
  const SUGGESTED_PRESETS = [
    "Cách tính định mức tiêu hao xăng xe Toyota Camry?",
    "Lịch bảo dưỡng cho xe điện VinFast VF8 thế nào?",
    "Xe báo đèn check engine màu vàng (lỗi cá vàng) xử lý sao?",
    "Mẹo lái xe ô tô tiết kiệm xăng dầu hiệu quả nhất?"
  ];

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.success ? data.text : "Xin lỗi, hiện tại máy chủ AI của RoyalAuto đang bận. Bạn vui lòng gửi lại tin nhắn nhé!",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Failed to connect to chat API:", error);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: "Xin lỗi, kết nối tới Trợ lý AI đang gián đoạn. Vui lòng kiểm tra lại mạng hoặc thử lại sau!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="bg-white border border-royal-105 rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto flex flex-col h-[650px] animate-fadeIn" id="ai-chat-assistant">
      
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-royal-700 to-royal-950 p-5 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-royal-650/40 border border-royal-100/30 rounded-2xl">
            <BrainCircuit className="w-6 h-6 text-gold-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-base leading-tight">RoyalAuto Fleet AI Co-pilot</span>
              <span className="px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded tracking-wider">ONLINE</span>
            </div>
            <p className="text-[11px] text-royal-200 mt-0.5">Tư vấn định mức tiêu hao xăng dặm, kỹ thuật động cơ và lịch trình</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center text-[10px] font-semibold text-gold-300 bg-gold-950/40 px-3 py-1 rounded-full border border-gold-900/30">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>Gemini Core Active</span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center text-[10.5px] text-amber-900 shrink-0 select-none">
        <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-700 shrink-0" />
        <span>
          <strong className="font-extrabold uppercase text-amber-950 mr-1">Lưu ý an toàn quan trọng:</strong> Mọi ý kiến từ trợ lý ảo AI chỉ có giá trị tham khảo kỹ thuật. Chủ phương tiện luôn chú ý dừng đỗ xe an toàn trước khi thao tác tra cứu cơ sở dữ liệu.
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-royal-50/20 space-y-4" id="chat-messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            id={`chat-msg-${msg.id}`}
          >
            {/* Avatar icon */}
            <div className={`p-2 rounded-xl shrink-0 ${
              msg.sender === "user" 
                ? "bg-royal-600 text-white" 
                : "bg-white border border-royal-105 text-royal-700"
            }`}>
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-royal-600" />}
            </div>

            {/* Bubble wrapper */}
            <div className={`max-w-[85%] flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-royal-600 text-white rounded-tr-none shadow-md shadow-royal-600/10 font-medium"
                  : "bg-white border border-royal-100 text-royal-950 rounded-tl-none whitespace-pre-wrap"
              }`}>
                {msg.text.split("\n").map((line, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>{line}</p>
                ))}
              </div>
              <span className="text-[9px] text-royal-400 font-medium mt-1 uppercase tracking-wider">
                {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator state */}
        {isLoading && (
          <div className="flex items-start gap-3.5" id="chat-typing-indicator">
            <div className="p-2 bg-white border border-royal-105 rounded-xl shrink-0">
              <Bot className="w-4 h-4 text-royal-600 animate-bounce" />
            </div>
            <div className="bg-white border border-royal-100 p-3.5 rounded-2xl rounded-tl-none flex items-center space-x-1 shadow-sm">
              <span className="w-2 h-2 bg-royal-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-royal-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-royal-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Preset Suggestions Rail */}
      <div className="p-3 border-t border-royal-100 bg-white shadow-inner flex flex-wrap gap-2 shrink-0 overflow-x-auto select-none">
        {SUGGESTED_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => sendMessage(preset)}
            className="text-[10px] font-sans font-semibold text-royal-700 bg-royal-50 hover:bg-royal-100 px-3 py-1.5 rounded-full border border-royal-100 cursor-pointer transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Input controls footer */}
      <div className="p-4 bg-white border-t border-royal-100 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Hỏi AI về định mức xăng xe, mốc bảo trì định kỳ ô tô tại đây..."
            className="flex-1 px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-2xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-royal-600 hover:bg-royal-700 disabled:bg-royal-100 disabled:text-royal-400 text-white rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
            id="chat-send-submit"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
