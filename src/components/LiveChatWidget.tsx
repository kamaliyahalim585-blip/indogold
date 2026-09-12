import React, { useState, useEffect, useRef } from 'react';
import { useGold } from '../context/GoldContext';
import {
  MessageSquareText,
  X,
  Send,
  Headphones,
  CheckCheck,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

const QUICK_QUESTIONS = [
  'Bagaimana cara konfirmasi deposit saldo?',
  'Berapa lama estimasi penarikan saldo?',
  'Bagaimana cara klaim bonus referral?',
  'Apakah emas batangan di IndoGold bersertifikat resmi?'
];

interface LiveChatWidgetProps {
  onOpenAuth?: () => void;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ onOpenAuth }) => {
  const {
    currentUser,
    supportMessages,
    sendSupportMessage,
    markSupportChatAsRead,
    userUnreadCount
  } = useGold();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter messages for current user
  const userMessages = currentUser
    ? supportMessages.filter((m) => m.userId === currentUser.uid)
    : [];

  // Scroll to bottom on new message or when opened
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (currentUser) {
        markSupportChatAsRead(currentUser.uid, 'user');
      }
    }
  }, [isOpen, userMessages.length, currentUser, markSupportChatAsRead]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && currentUser) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, currentUser]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || !currentUser) return;

    setIsSending(true);
    setInputText('');

    await sendSupportMessage(text, currentUser.uid);
    setIsSending(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuickQuestion = async (question: string) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setIsSending(true);
    await sendSupportMessage(question, currentUser.uid);
    setIsSending(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="open-live-chat-fab"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2.5 px-3.5 py-3 sm:px-4 sm:py-3 bg-gradient-to-r from-amber-500 to-[#ffd700] hover:from-amber-400 hover:to-[#ffe033] text-slate-950 font-bold rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-amber-300/40"
          aria-label="Buka Live Chat Bantuan"
        >
          <div className="relative">
            <MessageSquareText className="w-5 h-5 text-slate-950 transition-transform group-hover:rotate-6" />
            {/* Green Online Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>

          <span className="text-xs sm:text-sm font-extrabold tracking-wide">
            Live CS
          </span>

          {/* Unread Counter Badge */}
          {userUnreadCount > 0 && (
            <span className="px-1.5 py-0.5 min-w-[18px] text-[10px] font-black bg-rose-600 text-white rounded-full flex items-center justify-center animate-bounce shadow-sm">
              {userUnreadCount}
            </span>
          )}
        </button>
      )}

      {/* Live Chat Window Modal */}
      {isOpen && (
        <div
          id="live-chat-window"
          className={`fixed z-50 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'bottom-2 right-2 left-2 top-2 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[500px] sm:h-[680px]'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] h-[550px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Customer Support
                  </h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500/20 text-[#ffd700] rounded border border-amber-500/30">
                    OFFICIAL
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Online • Respon Rata-rata &lt; 2 Menit</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title={isExpanded ? 'Kecilkan' : 'Perbesar'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header / Guarantee */}
          <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Percakapan terenkripsi & dilayani admin resmi</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>24/7 Aktif</span>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-950/60 custom-scrollbar">
            {/* Greeting / Welcome Card */}
            <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Halo {currentUser?.nama || 'Kakak'}!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Selamat datang di layanan <strong>Live Support IndoGold</strong>.
                Silakan tanyakan kendala seputar deposit, penarikan dana, pergerakan harga emas, atau bonus kemitraan.
              </p>
            </div>

            {/* If Not Logged In */}
            {!currentUser && (
              <div className="my-6 p-4 bg-slate-800/90 border border-amber-500/30 rounded-xl text-center space-y-3 shadow-lg">
                <HelpCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="text-xs font-bold text-white">
                  Masuk Akun untuk Memulai Chat
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Harap login atau mendaftar terlebih dahulu agar admin dapat memverifikasi profil akun dan transaksi Anda.
                </p>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-[#ffd700] text-slate-950 font-bold text-xs rounded-lg shadow hover:brightness-110 transition-all cursor-pointer"
                  >
                    Masuk / Daftar Sekarang
                  </button>
                )}
              </div>
            )}

            {/* Quick Questions Suggestions (Shown if no messages or user wants quick ask) */}
            {currentUser && userMessages.length === 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Pertanyaan Cepat Sering Ditanyakan</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-left text-[11px] p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50 hover:border-amber-500/40 text-slate-200 transition-colors flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <span className="text-amber-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render User Messages */}
            {currentUser &&
              userMessages.map((msg) => {
                const isMe = msg.senderRole === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        {isMe ? 'Anda' : 'Admin CS IndoGold'}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(msg.waktu).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-amber-500 to-[#ffd700] text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.pesan}</p>

                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isMe ? 'text-slate-800 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          {currentUser ? (
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik pesan untuk Admin CS..."
                className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                disabled={isSending}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ffd700] hover:from-amber-400 hover:to-[#ffe033] text-slate-950 font-bold transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow cursor-pointer"
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[11px] text-slate-400">
              Silakan login untuk mengirim pesan langsung.
            </div>
          )}
        </div>
      )}
    </>
  );
};
