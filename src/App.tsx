import React, { useState, useEffect } from 'react';
import {
  Member,
  Seller,
  Transaction,
  ReimbursementClaim,
} from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_SELLERS,
  INITIAL_TRANSACTIONS,
  INITIAL_CLAIMS,
  playCashierChime,
} from './store';
import { BuyerPortal } from './components/BuyerPortal';
import { SellerPortal } from './components/SellerPortal';
import { OwnerPortal } from './components/OwnerPortal';
import { SplitView } from './components/SplitView';
import {
  Smartphone,
  Store,
  ShieldCheck,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  HeartHandshake,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Gift,
  Coins
} from 'lucide-react';

export const App: React.FC = () => {
  // Load initial states from localStorage if available
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('jam_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('jam_sellers');
    return saved ? JSON.parse(saved) : INITIAL_SELLERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('jam_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [claims, setClaims] = useState<ReimbursementClaim[]>(() => {
    const saved = localStorage.getItem('jam_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [activeView, setActiveView] = useState<'SPLIT' | 'BUYER' | 'SELLER' | 'OWNER'>('SPLIT');
  const [currentMemberId, setCurrentMemberId] = useState<string>('MEM-001');
  const [currentSellerId, setCurrentSellerId] = useState<string>('STALL-001');

  // Sidebar Collapse states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('jam_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('jam_sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('jam_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('jam_claims', JSON.stringify(claims));
  }, [claims]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];
  const currentSeller = sellers.find((s) => s.id === currentSellerId) || sellers[0];

  // Core Payment logic: Buyer scans Seller QR and points auto deduct
  const handleMakePayment = (
    memberId: string,
    sellerId: string,
    amountRM: number,
    note: string
  ) => {
    const targetMember = members.find((m) => m.id === memberId);
    const targetSeller = sellers.find((s) => s.id === sellerId);

    if (!targetMember || !targetSeller) {
      return { success: false, message: 'Ahli atau Gerai tidak dijumpai.' };
    }

    const pointsToDeduct = Math.round(amountRM * 100);

    if (targetMember.points < pointsToDeduct) {
      return {
        success: false,
        message: `Mata tidak mencukupi. Perlu ${pointsToDeduct} mata, baki anda ${targetMember.points} mata.`,
      };
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: formattedDate,
      type: 'PAYMENT',
      memberId: targetMember.id,
      memberName: targetMember.name,
      sellerId: targetSeller.id,
      sellerName: targetSeller.businessName,
      stallNumber: targetSeller.stallNumber,
      amountSen: pointsToDeduct,
      amountPoints: pointsToDeduct,
      amountRM: amountRM,
      note: note,
      status: 'SUCCESS',
    };

    // Deduct points from buyer
    setMembers((prev) =>
      prev.map((m) =>
        m.id === targetMember.id
          ? { ...m, points: m.points - pointsToDeduct }
          : m
      )
    );

    // Credit collected amount to seller
    setSellers((prev) =>
      prev.map((s) =>
        s.id === targetSeller.id
          ? {
              ...s,
              totalCollectedSen: s.totalCollectedSen + pointsToDeduct,
              unclaimedSen: s.unclaimedSen + pointsToDeduct,
            }
          : s
      )
    );

    // Add transaction
    setTransactions((prev) => [newTxn, ...prev]);

    // Play cashier chime audio!
    playCashierChime();

    return { success: true, transaction: newTxn };
  };

  // Core Owner Grant logic: Give points equivalent to RM
  const handleGrantPoints = (
    target: 'ALL' | string,
    amountRM: number,
    campaignName: string,
    expiryDate?: string
  ) => {
    const pointsToAdd = Math.round(amountRM * 100);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newTxns: Transaction[] = [];

    setMembers((prev) =>
      prev.map((m) => {
        if (target === 'ALL' || m.id === target) {
          newTxns.push({
            id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: formattedDate,
            type: 'OWNER_GRANT',
            memberId: m.id,
            memberName: m.name,
            amountSen: pointsToAdd,
            amountPoints: pointsToAdd,
            amountRM: amountRM,
            note: campaignName,
            status: 'SUCCESS',
          });
          return {
            ...m,
            points: m.points + pointsToAdd,
            pointsExpiryDate: expiryDate || m.pointsExpiryDate || '2026-11-08 18:00',
          };
        }
        return m;
      })
    );

    if (newTxns.length > 0) {
      setTransactions((prev) => [...newTxns, ...prev]);
    }
  };

  // Admin manually or automatically expires unused points
  const handleExpireUnusedPoints = (memberId?: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    let totalExpiredSen = 0;
    const newTxns: Transaction[] = [];

    setMembers((prev) =>
      prev.map((m) => {
        if ((!memberId || m.id === memberId) && m.points > 0) {
          totalExpiredSen += m.points;
          newTxns.push({
            id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: formattedDate,
            type: 'EXPIRY',
            memberId: m.id,
            memberName: m.name,
            amountSen: m.points,
            amountPoints: m.points,
            amountRM: m.points / 100,
            note: `Mata luput tamat tempoh (${m.pointsExpiryDate || 'Had masa'})`,
            status: 'SUCCESS',
          });
          return {
            ...m,
            points: 0,
            expiredPointsTotal: (m.expiredPointsTotal || 0) + m.points,
          };
        }
        return m;
      })
    );

    if (newTxns.length > 0) {
      setTransactions((prev) => [...newTxns, ...prev]);
    }

    return totalExpiredSen / 100;
  };

  // Admin updates/extends points expiry date
  const handleUpdateExpiryDate = (memberId: string | 'ALL', newDate: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (memberId === 'ALL' || m.id === memberId) {
          return { ...m, pointsExpiryDate: newDate };
        }
        return m;
      })
    );
  };

  // Seller submits reimbursement claim
  const handleSubmitClaim = (sellerId: string, amountRM: number) => {
    const targetSeller = sellers.find((s) => s.id === sellerId);
    if (!targetSeller) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newClaim: ReimbursementClaim = {
      id: `CLM-${Math.floor(100 + Math.random() * 900)}`,
      sellerId: targetSeller.id,
      sellerName: targetSeller.businessName,
      stallNumber: targetSeller.stallNumber,
      amountRM: amountRM,
      timestamp: formattedDate,
      status: 'PENDING',
    };

    setClaims((prev) => [newClaim, ...prev]);

    // Reset unclaimed in seller
    setSellers((prev) =>
      prev.map((s) =>
        s.id === sellerId ? { ...s, unclaimedSen: 0 } : s
      )
    );
  };

  // Owner approves claim
  const handleApproveClaim = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: 'PAID' } : c))
    );
  };

  // Reset to initial test data
  const handleResetData = () => {
    if (window.confirm('Adakah anda ingin set semula semua data contoh ke asal?')) {
      setMembers(INITIAL_MEMBERS);
      setSellers(INITIAL_SELLERS);
      setTransactions(INITIAL_TRANSACTIONS);
      setClaims(INITIAL_CLAIMS);
      localStorage.clear();
    }
  };

  // Navigation Items Specification
  const NAV_ITEMS = [
    {
      id: 'SPLIT' as const,
      label: 'Simulasi Serentak',
      subtitle: 'Pembeli & Peniaga',
      icon: ArrowRightLeft,
      badge: 'Dual View',
    },
    {
      id: 'BUYER' as const,
      label: 'Ahli (Pembeli)',
      subtitle: 'Kad Kesetiaan & QR',
      icon: Smartphone,
      badge: `${members.length} Ahli`,
    },
    {
      id: 'SELLER' as const,
      label: 'Peniaga (Gerai)',
      subtitle: 'Standee QR & Tuntutan',
      icon: Store,
      badge: `${sellers.length} Gerai`,
    },
    {
      id: 'OWNER' as const,
      label: 'Dashboard (Penganjur)',
      subtitle: 'Analisis, Agihan & Expiry',
      icon: LayoutGrid,
      badge: 'Admin',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      
      {/* ======================================================== */}
      {/* 1. MOBILE TOP HEADER (SHOWN ONLY ON SMALL SCREENS < MD)   */}
      {/* ======================================================== */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-blue-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 p-0.5 shadow-xs flex items-center justify-center">
            <img
              src="/logo-jam.png"
              alt="JAM"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
              KAD KESETIAAN JAM
            </h1>
            <p className="text-[10px] text-blue-600 font-bold">
              {NAV_ITEMS.find((n) => n.id === activeView)?.label}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 cursor-pointer transition hover:bg-blue-100"
          title="Buka Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ======================================================== */}
      {/* 2. MOBILE SIDEBAR DRAWER OVERLAY                         */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between border-r border-blue-100">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 p-1 shadow-xs flex items-center justify-center">
                    <img
                      src="/logo-jam.png"
                      alt="JAM"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 leading-tight">
                      KAD KESETIAAN JAM
                    </h2>
                    <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.2 rounded-full">
                      MADANI
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items in Mobile */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                  PILIHAN MOD PAPARAN
                </span>
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeView === item.id
                        ? 'btn-gradient-blue text-white shadow-md'
                        : 'text-slate-600 hover:bg-blue-50/70 hover:text-blue-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <div className="text-left leading-tight">
                        <span className="block font-black">{item.label}</span>
                        <span className={`text-[10px] ${activeView === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        activeView === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  handleResetData();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition text-xs font-bold"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Set Semula Data Contoh</span>
              </button>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DESKTOP COLLAPSIBLE SIDE MENU NAVIGATION               */}
      {/* ======================================================== */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-blue-100 shadow-md z-40 transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarCollapsed ? 'w-[76px] p-3' : 'w-[264px] p-5'
        }`}
      >
        {/* Top Branding Section */}
        <div className="pb-4 border-b border-blue-50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 p-1 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src="/logo-jam.png"
                    alt="JAM"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-slate-900 whitespace-nowrap">
                      KAD KESETIAAN JAM
                    </span>
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-black uppercase">
                      MADANI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    1 Mata = 1 Sen (RM 0.01)
                  </p>
                </div>
              </div>

              {/* Collapse Icon Button */}
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="w-7 h-7 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition cursor-pointer"
                title="Kecilkan bar sisi"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 p-1 shadow-xs flex items-center justify-center">
                <img
                  src="/logo-jam.png"
                  alt="JAM"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-7 h-7 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition cursor-pointer"
                title="Kembangkan bar sisi"
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Middle Navigation Section */}
        <div className="flex-1 py-4 space-y-1.5 overflow-y-auto">
          {!isSidebarCollapsed && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
              MOD PAPARAN SISTEM
            </span>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return !isSidebarCollapsed ? (
              // Expanded item button
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer group ${
                  isActive
                    ? 'btn-gradient-blue text-white shadow-md'
                    : 'text-slate-600 hover:bg-blue-50/70 hover:text-blue-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block font-black truncate text-xs">{item.label}</span>
                    <span
                      className={`text-[10px] block truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ) : (
              // Collapsed item icon
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={`${item.label} (${item.subtitle})`}
                className={`relative w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition cursor-pointer group ${
                  isActive
                    ? 'btn-gradient-blue text-white shadow-md'
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -left-1 w-1 h-5 rounded-r-full bg-blue-600"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Promo / Info Widget (Only when expanded) */}
        {!isSidebarCollapsed && (
          <div className="my-2 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-100 rounded-2xl p-3 text-center space-y-1">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              Kadar Subsidi Rasmi
            </span>
            <p className="text-xs font-black text-slate-900 font-mono">
              1 Mata = 1 Sen (RM 0.01)
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">
              Penebusan segera di gerai pameran Jualan Agro MADANI.
            </p>
          </div>
        )}

        {/* Bottom System Controls */}
        <div className="pt-3 border-t border-blue-50 space-y-2">
          {!isSidebarCollapsed ? (
            <>
              {/* Reset Data Button */}
              <button
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition text-xs font-bold cursor-pointer"
                title="Set semula data demo"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Data Demo</span>
              </button>

              {/* Collapse Switcher Bar */}
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kecilkan Menu</span>
              </button>
            </>
          ) : (
            <>
              {/* Collapsed Reset Data */}
              <button
                onClick={handleResetData}
                title="Set Semula Data Contoh"
                className="w-11 h-11 mx-auto rounded-xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Collapsed Expand Button */}
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                title="Kembangkan Menu"
                className="w-11 h-11 mx-auto rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT AREA (FLEXIBLE CANVAS FOR ALL VIEWS)      */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* Content Canvas */}
        <main className="flex-1 p-3 sm:p-6 w-full max-w-7xl mx-auto">
          {activeView === 'SPLIT' && (
            <SplitView
              currentMember={currentMember}
              allMembers={members}
              onSelectMember={setCurrentMemberId}
              currentSeller={currentSeller}
              allSellers={sellers}
              onSelectSeller={setCurrentSellerId}
              onMakePayment={handleMakePayment}
              transactions={transactions}
              claims={claims}
              onSubmitClaim={handleSubmitClaim}
            />
          )}

          {activeView === 'BUYER' && (
            <BuyerPortal
              currentMember={currentMember}
              allMembers={members}
              onSelectMember={setCurrentMemberId}
              sellers={sellers}
              onMakePayment={handleMakePayment}
              transactions={transactions}
            />
          )}

          {activeView === 'SELLER' && (
            <SellerPortal
              currentSeller={currentSeller}
              allSellers={sellers}
              onSelectSeller={setCurrentSellerId}
              transactions={transactions}
              claims={claims}
              onSubmitClaim={handleSubmitClaim}
            />
          )}

          {activeView === 'OWNER' && (
            <OwnerPortal
              members={members}
              sellers={sellers}
              transactions={transactions}
              claims={claims}
              onGrantPoints={handleGrantPoints}
              onApproveClaim={handleApproveClaim}
              onExpireUnusedPoints={handleExpireUnusedPoints}
              onUpdateExpiryDate={handleUpdateExpiryDate}
              onSwitchView={setActiveView}
              onResetData={handleResetData}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-blue-50 py-3 px-4 text-center text-xs text-slate-500">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <HeartHandshake className="w-4 h-4 text-blue-600" /> Inisiatif Inovasi Digital
            <strong className="text-slate-800">Program Jualan Agro MADANI (JAM)</strong>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Kadar Tetap: 1 Mata = 1 Sen (RM 0.01) • Imbas QR Meja Gerai • Perlindungan Ketirisan Baucar
          </p>
        </footer>
      </div>

    </div>
  );
};
