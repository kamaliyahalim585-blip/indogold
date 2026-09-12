import React, { useState, useEffect, useRef } from 'react';
import { useGold } from '../context/GoldContext';
import {
  MessageSquareText,
  X,
  Send,
  Headphones,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  Minimize2,
  Maximize2,
  User,
  Mail,
  Edit2
} from 'lucide-react';

const QUICK_QUESTIONS = [
  'Saya belum bisa login dengan email saya, mohon bantuan',
  'Bagaimana cara konfirmasi deposit saldo kas?',
  'Berapa lama estimasi penarikan dana ke rekening?',
  'Bagaimana cara klaim bonus referral pendaftaran?'
];

interface LiveChatWidgetProps {
  onOpenAuth?: () => void;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ onOpenAuth }) => {
  const {
    currentUser,
    guestId,
    guestName,
    guestEmail,
    setGuestDetails,
    supportMessages,
    sendSupportMessage,
    markSupportChatAsRead,
    userUnreadCount
  } = useGold();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [customName, setCustomName] = useState(guestName || 'Calon Nasabah');
  const [customEmail, setCustomEmail] = useState(guestEmail || '');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active chat room ID: logged in user's UID or guest visitor ID
  const activeRoomId = currentUser ? currentUser.uid : guestId;

  // Filter messages for active session
  const userMessages = supportMessages.filter((m) => m.userId === activeRoomId);

  // Scroll to bottom on new message or when opened
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      markSupportChatAsRead(activeRoomId, 'user');
    }
  }, [isOpen, userMessages.length, activeRoomId, markSupportChatAsRead]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestDetails(customName, customEmail);
    setShowIdentityForm(false);
  };

  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const text = (directText !== undefined ? directText : inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    if (directText === undefined) {
      setInputText('');
    }

    const senderName = currentUser ? currentUser.nama : (customName.trim() || 'Calon Nasabah');
    const senderEmail = currentUser ? currentUser.email : customEmail.trim();

    await sendSupportMessage(
      text,
      undefined,
      senderName,
      senderEmail
    );

    setIsSending(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuickQuestion = async (question: string) => {
    await handleSendMessage(undefined, question);
  };

  return (
    <>
      {/* Floating Trigger Button (Always visible on all screens) */}
      {!isOpen && (
        <button
          id="open-live-chat-fab"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 to-[#ffd700] hover:from-amber-400 hover:to-[#ffe033] text-slate-950 font-bold rounded-full shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-amber-300/40"
          aria-label="Buka Live Chat Bantuan"
        >
          <div className="relative">
            <MessageSquareText className="w-5 h-5 text-slate-950 transition-transform group-hover:rotate-6" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>

          <span className="text-xs sm:text-sm font-extrabold tracking-wide">
            Live Chat CS
          </span>

          {/* Unread Counter Badge */}
          {userUnreadCount > 0 && (
            <span className="px-2 py-0.5 min-w-[20px] text-[10px] font-black bg-rose-600 text-white rounded-full flex items-center justify-center animate-bounce shadow-md">
              {userUnreadCount}
            </span>
          )}
        </button>
      )}

      {/* Live Chat Window Modal */}
      {isOpen && (
        <div
          id="live-chat-window"
          className={`fixed z-50 bg-[#0d1017]/98 backdrop-blur-2xl border border-[#262f44] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'bottom-2 right-2 left-2 top-2 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[500px] sm:h-[680px]'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] h-[560px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#111522] via-[#161c2e] to-[#111522] border-b border-[#262f44] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0d1017] rounded-full animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Customer Support 24/7
                  </h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500/20 text-[#ffd700] rounded border border-amber-500/30">
                    RESMI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Admin Siap Membantu • Respon Langsung</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
                title={isExpanded ? 'Kecilkan' : 'Perbesar'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header / User Identity Strip */}
          <div className="px-3.5 py-2 bg-[#121724] border-b border-[#202738] flex items-center justify-between text-[11px]">
            {currentUser ? (
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-400">Akun:</span>
                <strong className="text-white truncate max-w-[170px]">{currentUser.nama}</strong>
                <span className="text-slate-500 text-[10px]">({currentUser.email})</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span className="text-slate-400">Tamu:</span>
                  <span className="text-amber-300 font-semibold truncate max-w-[140px]">
                    {customName}
                  </span>
                  {customEmail && (
                    <span className="text-slate-500 text-[10px] truncate max-w-[100px]">
                      ({customEmail})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowIdentityForm(!showIdentityForm)}
                  className="text-[10px] text-[#ffd700] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{showIdentityForm ? 'Tutup' : 'Ubah Nama/Email'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Optional Identity Form for Guests */}
          {!currentUser && showIdentityForm && (
            <form
              onSubmit={handleSaveIdentity}
              className="p-3 bg-[#151b2a] border-b border-[#242e46] space-y-2 animate-in fade-in duration-150"
            >
              <div className="text-[10px] text-slate-300 font-medium">
                Tulis nama atau email Anda agar admin dapat segera mengidentifikasi akun Anda:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full pl-8 pr-2 py-1.5 bg-[#0a0c12] border border-[#2b3650] rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700]"
                  />
                </div>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="email@anda.com"
                    className="w-full pl-8 pr-2 py-1.5 bg-[#0a0c12] border border-[#2b3650] rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#ffd700] text-black text-[11px] font-bold rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Simpan Info
                </button>
              </div>
            </form>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#0a0c12] custom-scrollbar">
            {/* Welcome Greeting Card */}
            <div className="p-3 bg-[#131724] border border-[#242c40] rounded-xl text-xs text-slate-300 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                <span>Halo {currentUser ? currentUser.nama : customName}!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Selamat datang di layanan <strong>Live Support IndoGold</strong>.
                Semua pesan Anda terhubung langsung ke panel admin backoffice secara real-time.
                Silakan tanyakan kendala login, deposit, penarikan dana, atau pertanyaan akun.
              </p>
            </div>

            {/* Quick Questions Suggestions */}
            {userMessages.length === 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Pilih Pertanyaan Cepat:</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-left text-[11px] p-2.5 rounded-xl bg-[#141824] hover:bg-[#1a2133] border border-[#242c40] hover:border-amber-500/40 text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="leading-snug">{q}</span>
                      <span className="text-[#ffd700] text-xs opacity-80 group-hover:translate-x-0.5 transition-transform ml-2 shrink-0">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render User & Admin Messages */}
            {userMessages.map((msg) => {
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
                    <span className="text-[9px] text-slate-500">
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
                        : 'bg-[#181f2f] border border-[#2a3652] text-slate-100 rounded-tl-none'
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

          {/* Active Input Footer (Available for ALL users, including guests) */}
          <form
            onSubmit={(e) => handleSendMessage(e)}
            className="p-2.5 bg-[#0f131d] border-t border-[#202738] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik pesan untuk Admin CS..."
              className="flex-1 bg-[#151a27] border border-[#273147] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ffd700] transition-colors"
              disabled={isSending}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#ffd700] hover:from-amber-400 hover:to-[#ffe033] text-slate-950 font-bold transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow cursor-pointer flex items-center gap-1 text-xs"
              title="Kirim Pesan"
            >
              <span>{isSending ? '...' : 'Kirim'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
