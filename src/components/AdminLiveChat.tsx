import React, { useState, useEffect, useRef } from 'react';
import { useGold } from '../context/GoldContext';
import { formatRupiah, formatGrams } from '../utils/formatters';
import {
  MessageSquare,
  Search,
  Send,
  User,
  CheckCheck,
  Headphones,
  Sliders,
  Sparkles,
  Check,
  Clock,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface AdminLiveChatProps {
  onOpenAdjustBalance?: (uid: string) => void;
  initialUserId?: string | null;
}

const CS_TEMPLATES = [
  'Halo Kak, ada yang bisa kami bantu terkait akun atau transaksi Anda?',
  'Deposit Anda telah kami verifikasi & saldo kas sudah masuk ke akun.',
  'Permintaan penarikan dana sedang diproses oleh bagian keuangan ke rekening tujuan.',
  'Mohon lampirkan foto/screenshot bukti transfer yang lebih jelas dan terbaca.',
  'Harga emas di IndoGold diperbarui secara real-time mengikuti fluktuasi pasar dunia.'
];

export const AdminLiveChat: React.FC<AdminLiveChatProps> = ({ onOpenAdjustBalance, initialUserId }) => {
  const {
    allUsers,
    supportRooms,
    supportMessages,
    sendSupportMessage,
    markSupportChatAsRead,
    hitungTotalGramEmas
  } = useGold();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId || null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initialUserId when changed from parent
  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);

  // Auto select first user with unread or first room if none selected
  useEffect(() => {
    if (!selectedUserId) {
      const roomWithUnread = supportRooms.find((r) => (r.unreadByAdmin || 0) > 0);
      if (roomWithUnread) {
        setSelectedUserId(roomWithUnread.userId);
      } else if (supportRooms.length > 0) {
        setSelectedUserId(supportRooms[0].userId);
      } else if (allUsers.length > 1) {
        // Find a regular customer (not admin)
        const regularUser = allUsers.find((u) => !u.isAdmin);
        if (regularUser) {
          setSelectedUserId(regularUser.uid);
        }
      }
    }
  }, [supportRooms, allUsers, selectedUserId]);

  // When selected user changes, mark as read by admin and scroll
  useEffect(() => {
    if (selectedUserId) {
      markSupportChatAsRead(selectedUserId, 'admin');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedUserId, markSupportChatAsRead]);

  // Scroll on new message in active thread
  const activeMessages = selectedUserId
    ? supportMessages.filter((m) => m.userId === selectedUserId)
    : [];

  useEffect(() => {
    if (selectedUserId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length, selectedUserId]);

  // Get active user data
  const selectedUser = allUsers.find((u) => u.uid === selectedUserId);

  // Combine rooms and all registered users to make sure admin can chat with anyone
  const threadList = [...supportRooms];
  // If user search is active, also search allUsers
  const filteredRooms = threadList.filter((room) => {
    const q = searchQuery.toLowerCase();
    return (
      room.userName.toLowerCase().includes(q) ||
      room.userEmail.toLowerCase().includes(q) ||
      (room.lastMessage && room.lastMessage.toLowerCase().includes(q))
    );
  });

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || inputText).trim();
    if (!text || !selectedUserId || isSending) return;

    setIsSending(true);
    if (!customText) setInputText('');

    await sendSupportMessage(text, selectedUserId);
    setIsSending(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <div className="bg-[#0f121a] border border-[#222838] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[700px] max-h-[85vh]">
      {/* LEFT COLUMN: Customer Threads List */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-[#212738] flex flex-col bg-[#0b0e14]">
        {/* Header Search & Actions */}
        <div className="p-3.5 border-b border-[#212738] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#ffd700]" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Obrolan Nasabah
              </h3>
            </div>
            <button
              onClick={() => setShowUserPicker(!showUserPicker)}
              className="p-1.5 rounded-lg bg-[#191f2d] hover:bg-[#252f44] text-[#ffd700] text-xs font-bold flex items-center gap-1 border border-[#2d384e] transition-colors"
              title="Mulai obrolan baru dengan nasabah"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Chat Baru</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full bg-[#131722] border border-[#22283a] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700]"
            />
          </div>
        </div>

        {/* User Picker Dropdown (when clicking Chat Baru) */}
        {showUserPicker && (
          <div className="p-2 border-b border-[#212738] bg-[#141926] max-h-48 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
              Pilih Nasabah untuk Dihubungi:
            </div>
            {allUsers
              .filter((u) => !u.isAdmin)
              .map((u) => (
                <button
                  key={u.uid}
                  onClick={() => {
                    setSelectedUserId(u.uid);
                    setShowUserPicker(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#1f2638] text-xs text-slate-200 flex items-center justify-between transition-colors"
                >
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{u.nama}</div>
                    <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                  </div>
                  <span className="text-[10px] text-[#ffd700] font-mono">
                    {formatRupiah(u.saldo)}
                  </span>
                </button>
              ))}
          </div>
        )}

        {/* Room Threads List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#171d2b] custom-scrollbar">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p className="text-xs">Belum ada obrolan aktif.</p>
              <button
                onClick={() => setShowUserPicker(true)}
                className="text-[11px] font-bold text-[#ffd700] hover:underline"
              >
                + Mulai chat dengan nasabah
              </button>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isSelected = selectedUserId === room.userId;
              const hasUnread = (room.unreadByAdmin || 0) > 0;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedUserId(room.userId)}
                  className={`p-3 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#182030] border-l-4 border-l-[#ffd700]'
                      : 'hover:bg-[#121622]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-[#2b354d] flex items-center justify-center font-bold text-xs text-amber-400">
                      {room.userName.slice(0, 2).toUpperCase()}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#0b0e14]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {room.userName}
                      </h4>
                      <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                        {room.lastMessageTime || ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {room.lastSenderRole === 'admin' && (
                        <span className="text-[#ffd700] font-semibold mr-1">Anda:</span>
                      )}
                      {room.lastMessage || 'Obrolan dimulai'}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-500 truncate">
                        {room.userEmail}
                      </span>
                      {hasUnread && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black bg-rose-600 text-white rounded-full">
                          {room.unreadByAdmin} Baru
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Chat & Reply Window */}
      <div className="flex-1 flex flex-col bg-[#0d1017]">
        {selectedUserId && selectedUser ? (
          <>
            {/* Chat Header Profile Info */}
            <div className="p-3.5 bg-[#10141e] border-b border-[#212738] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                  {selectedUser.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {selectedUser.nama}
                    </h3>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      NASABAH TERVERIFIKASI
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedUser.email} • ID: {selectedUser.uid}
                  </div>
                </div>
              </div>

              {/* User Financial Snapshot & Action */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-[10px] text-slate-400">Saldo Kas Nasabah</div>
                  <div className="text-xs font-bold text-[#ffd700] font-mono">
                    {formatRupiah(selectedUser.saldo)}
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <div className="text-[10px] text-slate-400">Saldo Emas</div>
                  <div className="text-xs font-bold text-amber-400 font-mono">
                    {formatGrams(hitungTotalGramEmas(selectedUser))}
                  </div>
                </div>

                {onOpenAdjustBalance && (
                  <button
                    onClick={() => onOpenAdjustBalance(selectedUser.uid)}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#ffd700]" />
                    <span>Ubah Saldo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080a0f] custom-scrollbar">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#131722] flex items-center justify-center text-slate-400">
                    <Headphones className="w-6 h-6 text-[#ffd700]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Belum Ada Riwayat Pesan</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      Kirimkan sapaan pertama atau jawaban untuk membantu nasabah {selectedUser.nama}.
                    </p>
                  </div>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isAdminMsg = msg.senderRole === 'admin';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          {isAdminMsg ? 'Admin CS (Anda)' : msg.userName}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(msg.waktu).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                          isAdminMsg
                            ? 'bg-gradient-to-r from-amber-500 to-[#ffd700] text-slate-950 font-medium rounded-tr-none'
                            : 'bg-[#151a27] border border-[#232b3e] text-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.pesan}</p>

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isAdminMsg ? 'text-slate-800 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {isAdminMsg && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* CS Quick Response Templates Bar */}
            <div className="p-2.5 bg-[#0e121b] border-t border-[#1d2333] overflow-x-auto">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 px-1">
                  <Sparkles className="w-3 h-3 text-[#ffd700]" />
                  Template Balasan:
                </span>
                {CS_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, tmpl)}
                    className="text-[10px] py-1 px-2.5 rounded-lg bg-[#161c2b] hover:bg-[#20293d] border border-[#252f46] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {tmpl.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="p-3 bg-[#111520] border-t border-[#212738] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Balas ${selectedUser.nama} sebagai Tim CS IndoGold...`}
                className="flex-1 bg-[#090b10] border border-[#232a3c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700] transition-colors"
                disabled={isSending}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#ffd700] hover:from-amber-400 hover:to-[#ffe033] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-600 opacity-60" />
            <h4 className="text-sm font-bold text-white">Pilih Obrolan Nasabah</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Silakan pilih salah satu nasabah di bilah kiri untuk membuka percakapan bantuan dan membalas secara real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
