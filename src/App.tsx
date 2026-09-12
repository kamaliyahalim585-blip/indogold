import React, { useState, useEffect } from 'react';
import { GoldProvider, useGold } from './context/GoldContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { Toast } from './components/Toast';
import { BerandaPage } from './components/BerandaPage';
import { BeliPage } from './components/BeliPage';
import { JualPage } from './components/JualPage';
import { DepositPage } from './components/DepositPage';
import { TarikPage } from './components/TarikPage';
import { RiwayatPage } from './components/RiwayatPage';
import { AkunPage } from './components/AkunPage';
import { AdminPortal } from './components/AdminPortal';
import { AuthPage } from './components/AuthPage';
import { ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, logout } = useGold();

  // Mode: 'user' (Aplikasi Nasabah) vs 'admin' (Portal Pengelola Terpisah)
  const [portalMode, setPortalMode] = useState<'user' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || search.includes('admin')) {
        return 'admin';
      }
    }
    return 'user';
  });

  // User App States
  const [activeTab, setActiveTab] = useState<TabType>('beranda');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Sync hash changes & keyboard shortcut (Ctrl+Shift+A or Alt+A) for admin access
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setPortalMode('admin');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret admin shortcut: Ctrl+Shift+A or Alt+A
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        handleOpenAdminPortal();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenAdminPortal = () => {
    setIsDepositOpen(false);
    setIsWithdrawOpen(false);
    setPortalMode('admin');
    window.location.hash = '/admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToUserApp = () => {
    setPortalMode('user');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // 1. SEPARATE ADMIN PORTAL (Stand-alone Backoffice, accessed via #/admin)
  // =========================================================================
  if (portalMode === 'admin') {
    return (
      <>
        <Toast />
        <AdminPortal onBackToUserApp={handleBackToUserApp} />
      </>
    );
  }

  // =========================================================================
  // 2. USER AUTHENTICATION SCREEN (If not logged in to user app)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col items-center justify-center p-4">
        <Toast />
        <div className="w-full max-w-md bg-[#0b0e14] border border-[#1d2230] rounded-3xl p-3 sm:p-5 shadow-2xl space-y-4">
          <AuthPage initialMode="register" onOpenAdmin={handleOpenAdminPortal} />
        </div>
      </div>
    );
  }

  // Navigation handlers for User App
  const handleTabChange = (tab: TabType) => {
    setIsDepositOpen(false);
    setIsWithdrawOpen(false);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDeposit = () => {
    setIsWithdrawOpen(false);
    setIsDepositOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWithdraw = () => {
    setIsDepositOpen(false);
    setIsWithdrawOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // 3. CLEAN USER APPLICATION (No Admin Panel Inside)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 font-sans selection:bg-[#ffd700] selection:text-black flex flex-col justify-between">
      {/* Toast Notification Container */}
      <Toast />

      {/* Main Container - Centered Mobile / Tablet Viewport for Users */}
      <div className="max-w-md w-full mx-auto min-h-screen flex flex-col bg-[#0b0e14] border-x border-[#1a1f2c] shadow-2xl relative">
        {/* Persistent Top Header (Customer App Header) */}
        <Header
          onNavigate={handleTabChange}
          onOpenDeposit={handleOpenDeposit}
          onOpenWithdraw={handleOpenWithdraw}
          onOpenAdmin={handleOpenAdminPortal}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          {isDepositOpen ? (
            <DepositPage
              onBack={() => setIsDepositOpen(false)}
              onSuccess={() => {
                setIsDepositOpen(false);
                setActiveTab('riwayat');
              }}
            />
          ) : isWithdrawOpen ? (
            <TarikPage
              onBack={() => setIsWithdrawOpen(false)}
              onSuccess={() => {
                setIsWithdrawOpen(false);
                setActiveTab('riwayat');
              }}
            />
          ) : activeTab === 'beranda' ? (
            <BerandaPage
              onNavigate={handleTabChange}
              onOpenDeposit={handleOpenDeposit}
              onOpenWithdraw={handleOpenWithdraw}
            />
          ) : activeTab === 'beli' ? (
            <BeliPage
              onOpenDeposit={handleOpenDeposit}
              onSuccess={() => setActiveTab('beranda')}
            />
          ) : activeTab === 'jual' ? (
            <JualPage
              onNavigate={handleTabChange}
              onSuccess={() => setActiveTab('beranda')}
            />
          ) : activeTab === 'riwayat' ? (
            <RiwayatPage />
          ) : (
            <AkunPage onLogout={logout} onOpenAdmin={handleOpenAdminPortal} />
          )}
        </main>

        {/* Persistent Mobile Bottom Navigation for Users */}
        {!isDepositOpen && !isWithdrawOpen && (
          <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} />
        )}
      </div>

      {/* Clean, professional footer for users with discreet admin access */}
      <footer className="py-3 text-center text-[11px] text-slate-600 flex flex-col items-center justify-center gap-1.5">
        <span>© {new Date().getFullYear()} IndoGold Platform. Investasi Emas Digital Aman & Terpercaya.</span>
        <button
          onClick={handleOpenAdminPortal}
          className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1 py-0.5 px-2 rounded-lg hover:bg-slate-800/50"
          title="Buka panel admin dan backoffice pengelola"
        >
          <ShieldCheck className="w-3 h-3 text-amber-400/80" />
          <span>Portal Admin Pengelola (#admin)</span>
        </button>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GoldProvider>
      <MainApp />
    </GoldProvider>
  );
}
