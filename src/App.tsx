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
    if (window.confirm('Adakah anda ingin set semula semua data ke asal?')) {
      setMembers(INITIAL_MEMBERS);
      setSellers(INITIAL_SELLERS);
      setTransactions(INITIAL_TRANSACTIONS);
      setClaims(INITIAL_CLAIMS);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col text-slate-800">
      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
              <img
                src="/logo-jam.png"
                alt="Jualan Agro MADANI"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">
                  KAD KESETIAAN JAM
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                  MADANI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Penebusan Mata Belian Jualan Agro MADANI (1 Mata = 1 Sen)
              </p>
            </div>
          </div>

          {/* Navigation View Switcher (Rounded Pill dock) */}
          <div className="flex items-center bg-white/90 p-1.5 rounded-full border border-slate-200/80 shadow-xs text-xs font-bold">
            <button
              onClick={() => setActiveView('SPLIT')}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'SPLIT'
                  ? 'btn-gradient-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Simulasi Serentak</span>
            </button>
            <button
              onClick={() => setActiveView('BUYER')}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'BUYER'
                  ? 'btn-gradient-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Ahli (Pembeli)</span>
            </button>
            <button
              onClick={() => setActiveView('SELLER')}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'SELLER'
                  ? 'btn-gradient-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Peniaga (Gerai)</span>
            </button>
            <button
              onClick={() => setActiveView('OWNER')}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'OWNER'
                  ? 'btn-gradient-blue text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dashboard (Penganjur)</span>
            </button>
          </div>

          {/* Reset Demo Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              title="Set Semula Data Contoh"
              className="text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-2 rounded-full transition text-xs flex items-center gap-1.5 border border-slate-200/80 shadow-2xs cursor-pointer font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Reset Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
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

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-white py-4 px-4 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <HeartHandshake className="w-4 h-4 text-blue-600" /> Inisiatif Inovasi Digital
          <strong className="text-slate-800">Program Jualan Agro MADANI (JAM)</strong>
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
          Kadar Tetap: 1 Mata = 1 Sen (RM 0.01) • Imbas QR Meja Gerai • Perlindungan Ketirisan Baucar
        </p>
      </footer>
    </div>
  );
};
