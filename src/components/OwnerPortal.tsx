import React, { useState } from 'react';
import { Member, Seller, Transaction, ReimbursementClaim } from '../types';
import confetti from 'canvas-confetti';
import {
  LayoutGrid,
  Gift,
  Coins,
  Users,
  Store,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Zap,
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  ArrowRightLeft,
  FileText,
  Search,
  Filter,
  Check,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface OwnerPortalProps {
  members: Member[];
  sellers: Seller[];
  transactions: Transaction[];
  claims: ReimbursementClaim[];
  onGrantPoints: (
    target: 'ALL' | string,
    amountRM: number,
    campaignName: string,
    expiryDate?: string
  ) => void;
  onApproveClaim: (claimId: string) => void;
  onExpireUnusedPoints: (memberId?: string) => number;
  onUpdateExpiryDate: (memberId: string | 'ALL', newDate: string) => void;
  onSwitchView?: (view: 'SPLIT' | 'BUYER' | 'SELLER' | 'OWNER') => void;
  onResetData?: () => void;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  members,
  sellers,
  transactions,
  claims,
  onGrantPoints,
  onApproveClaim,
  onExpireUnusedPoints,
  onUpdateExpiryDate,
  onSwitchView,
  onResetData,
}) => {
  // Active Dashboard Sub-Tab controlled by the organic curved Side Menu
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'GRANT' | 'EXPIRY' | 'CLAIMS' | 'MEMBERS' | 'AUDIT' | 'ALL'
  >('OVERVIEW');

  const [grantTarget, setGrantTarget] = useState<'ALL' | string>('ALL');
  const [amountRM, setAmountRM] = useState<string>('10.00');
  const [campaignName, setCampaignName] = useState<string>(
    'Subsidi Promosi Jualan Agro MADANI (JAM)'
  );
  const [expiryDate, setExpiryDate] = useState<string>('2026-11-08 18:00');
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string>('');
  const [expirySuccessMsg, setExpirySuccessMsg] = useState<string>('');
  const [selectedMemberToExtend, setSelectedMemberToExtend] = useState<string>('');
  const [customExtendDate, setCustomExtendDate] = useState<string>('2026-11-15 18:00');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  const parsedAmountRM = parseFloat(amountRM) || 0;
  const pointsPerPerson = Math.round(parsedAmountRM * 100);
  const totalTargetCount = grantTarget === 'ALL' ? members.length : 1;
  const totalPointsToDistribute = pointsPerPerson * totalTargetCount;
  const totalRMToDistribute = parsedAmountRM * totalTargetCount;

  // Financial statistics
  const totalGrantedPoints = transactions
    .filter((t) => t.type === 'OWNER_GRANT')
    .reduce((sum, t) => sum + t.amountPoints, 0);

  const totalRedeemedPoints = transactions
    .filter((t) => t.type === 'PAYMENT')
    .reduce((sum, t) => sum + t.amountPoints, 0);

  const totalExpiredPoints = transactions
    .filter((t) => t.type === 'EXPIRY')
    .reduce((sum, t) => sum + t.amountPoints, 0);

  const totalGrantedRM = totalGrantedPoints / 100;
  const totalRedeemedRM = totalRedeemedPoints / 100;
  const totalExpiredRM = totalExpiredPoints / 100;
  const unredeemedRM = totalGrantedRM - totalRedeemedRM - totalExpiredRM;

  const pendingClaimsCount = claims.filter((c) => c.status === 'PENDING').length;

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmountRM <= 0) return;

    onGrantPoints(grantTarget, parsedAmountRM, campaignName, expiryDate);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });

    setGrantSuccessMsg(
      `Berjaya mengagihkan ${totalPointsToDistribute.toLocaleString()} Mata (RM ${totalRMToDistribute.toFixed(
        2
      )}) kepada ${totalTargetCount} ahli! Sah sehingga: ${expiryDate}.`
    );

    setTimeout(() => setGrantSuccessMsg(''), 5000);
  };

  const handleExpireAll = () => {
    const amountExpired = onExpireUnusedPoints();
    setExpirySuccessMsg(
      `Pelupusan berjaya: RM ${amountExpired.toFixed(
        2
      )} mata yang tidak digunakan melepasi had masa telah dilupuskan dan dipulangkan ke peruntukan JAM.`
    );
    setTimeout(() => setExpirySuccessMsg(''), 6000);
  };

  const handleExpireSingle = (memberId: string, memberName: string) => {
    const amountExpired = onExpireUnusedPoints(memberId);
    setExpirySuccessMsg(
      `Mata bagi ahli ${memberName} (RM ${amountExpired.toFixed(2)}) telah berjaya dilupuskan dan dipulangkan.`
    );
    setTimeout(() => setExpirySuccessMsg(''), 5000);
  };

  const handleApplyExtension = (memberId: string | 'ALL') => {
    onUpdateExpiryDate(memberId, customExtendDate);
    setExpirySuccessMsg(`Had masa tamat tempoh berjaya dikemas kini kepada: ${customExtendDate}`);
    setTimeout(() => setExpirySuccessMsg(''), 4000);
  };

  const setPreset = (rm: number, name: string, expiry: string) => {
    setAmountRM(rm.toFixed(2));
    setCampaignName(name);
    setExpiryDate(expiry);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.cardId.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.phone.includes(memberSearchQuery)
  );

  return (
    <div className="bg-white/95 rounded-[40px] shadow-2xl border-4 border-white overflow-hidden flex flex-row min-h-[860px] relative transition-all duration-300">
      
      {/* 🌟 1. ORGANIC CURVED SIDE MENU (MATCHING REFERENCE UI) */}
      <aside className="w-[68px] sm:w-[84px] bg-gradient-to-b from-[#5c54e8] via-[#4838d4] to-[#2563eb] text-white flex flex-col items-center py-6 relative shrink-0 z-30 select-none shadow-xl shadow-indigo-950/20">
        
        {/* SVG ORGANIC WAVE CONNECTOR EXTENDING OUTWARD TO RIGHT */}
        <div className="absolute top-0 -right-[22px] h-full w-[22px] pointer-events-none overflow-hidden hidden sm:block">
          <svg
            className="h-full w-full"
            viewBox="0 0 22 800"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0,0 C15,35 22,95 22,190 L22,610 C22,705 15,765 0,800 L0,0 Z"
              fill="url(#sideWaveGrad)"
            />
            <defs>
              <linearGradient id="sideWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5c54e8" />
                <stop offset="50%" stopColor="#4838d4" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top: JAM Logo Plaque */}
        <div className="mb-6 relative z-10">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1 shadow-md border border-white flex items-center justify-center">
            <img
              src="/logo-jam.png"
              alt="JAM"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Vertical Icon Navigation Stack */}
        <nav className="flex-1 flex flex-col items-center gap-2.5 sm:gap-3 relative z-10 w-full px-1.5 sm:px-2">
          
          {/* 1. Dashboard Overview (Grid Icon with White Rounded Card when Active) */}
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            title="Ringkasan Dashboard"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'OVERVIEW'
                ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {/* 2. Grant Points (Gift) */}
          <button
            onClick={() => setActiveTab('GRANT')}
            title="Agih Mata Subsidi"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'GRANT'
                ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <Gift className="w-5 h-5" />
          </button>

          {/* 3. Points Expiry (Clock with Green Badge matching reference image) */}
          <button
            onClick={() => setActiveTab('EXPIRY')}
            title="Pengurusan Had Tempoh (Points Expiry)"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'EXPIRY'
                ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <Clock className="w-5 h-5" />
            {/* Green Badge pill matching screenshot */}
            <span className="absolute -top-1 -right-1 bg-emerald-400 text-slate-950 font-black text-[7px] sm:text-[8px] px-1 py-0.2 rounded-full shadow-xs border border-white">
              AKTIF
            </span>
          </button>

          {/* 4. Seller Claims (Store with count badge) */}
          <button
            onClick={() => setActiveTab('CLAIMS')}
            title="Tuntutan Bayaran Balik Peniaga Gerai"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'CLAIMS'
                ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <Store className="w-5 h-5" />
            {pendingClaimsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                {pendingClaimsCount}
              </span>
            )}
          </button>

          {/* 5. Members & Sellers Directory (Users) */}
          <button
            onClick={() => setActiveTab('MEMBERS')}
            title="Direktori Ahli & Gerai"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'MEMBERS'
                ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>

          {/* 6. Security & Audit (ShieldCheck) */}
          <button
            onClick={() => setActiveTab('AUDIT')}
            title="Log Keselamatan & Audit Digital"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'AUDIT'
                ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </button>

          {/* 7. Full Page View (FileText) */}
          <button
            onClick={() => setActiveTab('ALL')}
            title="Paparan Penuh Semua Seksyen"
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'ALL'
                ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <FileText className="w-5 h-5" />
          </button>
        </nav>

        {/* Bottom Actions: Quick View Switchers / Reset */}
        <div className="mt-auto flex flex-col items-center gap-2 relative z-10 pt-4 border-t border-white/20 w-full px-1.5 sm:px-2">
          {onSwitchView && (
            <button
              onClick={() => onSwitchView('SPLIT')}
              title="Tukar ke Simulasi Serentak (Split View)"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-white/80 hover:text-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          )}

          {onResetData && (
            <button
              onClick={onResetData}
              title="Set Semula Data Contoh"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-white/80 hover:text-white hover:bg-white/15 flex items-center justify-center transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* 🌟 2. MAIN DASHBOARD CONTENT AREA (RIGHT OF THE SIDE MENU) */}
      <main className="flex-1 p-4 sm:p-7 overflow-y-auto space-y-6 min-w-0 bg-[#f8fbff]">
        
        {/* Top Header Row with Breadcrumb Pill (Matching Screenshot) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            {/* Breadcrumb Pill: [ ☵ Dashboard / Sub-page ] */}
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs text-xs font-extrabold text-slate-800 mb-2">
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dashboard</span>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-indigo-600 font-bold capitalize">
                {activeTab === 'OVERVIEW'
                  ? 'Ringkasan Utama'
                  : activeTab === 'GRANT'
                  ? 'Agih Subsidi'
                  : activeTab === 'EXPIRY'
                  ? 'Pengurusan Had Tempoh'
                  : activeTab === 'CLAIMS'
                  ? 'Tuntutan Peniaga'
                  : activeTab === 'MEMBERS'
                  ? 'Direktori Ahli & Gerai'
                  : activeTab === 'AUDIT'
                  ? 'Audit Keselamatan'
                  : 'Paparan Penuh'}
              </span>
            </div>

            {/* Greeting matching reference screenshot: "Hi, ..." */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Hi, Pengarah Jualan Agro MADANI 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pusat kawalan & pemantauan agihan subsidi tunai kad kesetiaan JAM (1 Mata = 1 Sen)
            </p>
          </div>

          {/* Quick View Switcher Pills */}
          {onSwitchView && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1.5 rounded-full border border-slate-200/90 shadow-2xs text-xs font-bold">
              <button
                onClick={() => onSwitchView('SPLIT')}
                className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulasi</span>
              </button>
              <button
                onClick={() => onSwitchView('BUYER')}
                className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Pembeli</span>
              </button>
              <button
                onClick={() => onSwitchView('SELLER')}
                className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span>Peniaga</span>
              </button>
            </div>
          )}
        </div>

        {/* 🌟 TAB CONTENT: OVERVIEW (RINGKASAN KPI) */}
        {(activeTab === 'OVERVIEW' || activeTab === 'ALL') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Banner with Vibrant Gradient Wave */}
            <div className="theme-gradient-wave text-white rounded-[32px] p-5 sm:p-7 shadow-lg border-2 border-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="bg-white p-2 rounded-2xl shadow-md border border-white shrink-0">
                  <img
                    src="/logo-jam.png"
                    alt="Jualan Agro MADANI"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/25 backdrop-blur-md text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/30">
                      SISTEM KAD KESETIAAN
                    </span>
                    <span className="text-xs text-blue-100 font-medium">
                      Jualan Agro MADANI (JAM)
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                    Kawalan Subsidi & Penebusan Mata
                  </h2>
                  <p className="text-xs text-blue-100 mt-0.5">
                    1 Mata = 1 Sen (RM 0.01) • Had tempoh luput automatik & audit digital
                  </p>
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 flex items-center gap-3 relative z-10 self-start md:self-auto">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                  <Coins className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[9px] text-blue-100 uppercase font-black tracking-wider">
                    Kadar Rasmi
                  </p>
                  <p className="text-xs font-black text-white font-mono">
                    1 MATA = 1 SEN
                  </p>
                  <p className="text-[9px] text-emerald-200 font-semibold">
                    100 Mata = RM 1.00
                  </p>
                </div>
              </div>
            </div>

            {/* KPI Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="glass-card p-4 rounded-3xl border border-white shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-bold">Jumlah Diagih</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  RM {totalGrantedRM.toFixed(2)}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {totalGrantedPoints.toLocaleString()} Mata
                </p>
              </div>

              <div className="glass-card p-4 rounded-3xl border border-white shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-bold">Ditebus di Gerai</span>
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  RM {totalRedeemedRM.toFixed(2)}
                </p>
                <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                  {totalRedeemedPoints.toLocaleString()} Mata Ditolak
                </p>
              </div>

              <div className="glass-card p-4 rounded-3xl border border-rose-200 bg-rose-50/60 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-bold text-rose-800">Luput Dipulangkan</span>
                  <Clock className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-black text-rose-600 mt-2 font-mono">
                  RM {totalExpiredRM.toFixed(2)}
                </p>
                <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                  {totalExpiredPoints.toLocaleString()} Mata Luput
                </p>
              </div>

              <div className="glass-card p-4 rounded-3xl border border-white shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-bold">Baki Belum Ditebus</span>
                  <Coins className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-blue-600 mt-2 font-mono">
                  RM {unredeemedRM.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Dalam dompet ahli
                </p>
              </div>

              <div className="glass-card p-4 rounded-3xl border border-white shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-bold">Ahli Berdaftar</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                  {members.length} Ahli
                </p>
                <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                  {sellers.length} Gerai Berdaftar
                </p>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab('GRANT')}
                className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Agih Mata Subsidi</h3>
                    <p className="text-[10px] text-slate-400">Pilih ahli & tetapkan tarikh luput</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </div>

              <div
                onClick={() => setActiveTab('EXPIRY')}
                className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:border-rose-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Pengurusan Had Tempoh</h3>
                    <p className="text-[10px] text-slate-400">Lupuskan mata atau lanjutkan tarikh</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition" />
              </div>

              <div
                onClick={() => setActiveTab('CLAIMS')}
                className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Tuntutan Peniaga</h3>
                    <p className="text-[10px] text-slate-400">{pendingClaimsCount} permohonan menunggu</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </div>
            </div>
          </div>
        )}

        {/* 🌟 TAB CONTENT: GRANT POINTS TO MEMBERS */}
        {(activeTab === 'GRANT' || activeTab === 'ALL') && (
          <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Agih Mata Subsidi Kepada Ahli (Bantuan Jualan)
                </h2>
                <p className="text-xs text-slate-500">
                  Setiap RM 1.00 bersamaan 100 mata. Tetapkan tarikh had masa supaya mata tidak digunakan boleh tamat tempoh.
                </p>
              </div>
            </div>

            {grantSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{grantSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleGrant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sasaran Penerima:
                  </label>
                  <select
                    value={grantTarget}
                    onChange={(e) => setGrantTarget(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Semua Ahli Berdaftar ({members.length} Orang)</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.cardId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nilai Subsidi Setiap Ahli (RM):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      RM
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={amountRM}
                      onChange={(e) => setAmountRM(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Tarikh Luput Mata:</span>
                    <span className="text-[10px] text-rose-600 font-bold">Masa Tamat</span>
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kempen / Catatan Agihan:
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500">Pilihan Pantas:</span>
                <button
                  type="button"
                  onClick={() => setPreset(10, 'Baucar Khas Hujung Minggu JAM', '2026-11-08 18:00')}
                  className="bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer"
                >
                  RM 10 (Pasar 8 Nov, 18:00)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(20, 'Subsidi Ayam & Sayur MADANI', '2026-11-15 18:00')}
                  className="bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer"
                >
                  RM 20 (Promosi 15 Nov, 18:00)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(50, 'Bantuan Barangan Asas Bulanan', '2026-11-30 23:59')}
                  className="bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer"
                >
                  RM 50 (Akhir Bulan 30 Nov)
                </button>
              </div>

              {/* Grant summary card */}
              <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">Jumlah Mata Bakal Diagih:</span>
                  <p className="font-mono font-black text-blue-700 text-base">
                    {totalPointsToDistribute.toLocaleString()} Mata (RM {totalRMToDistribute.toFixed(2)})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px]">Penerima:</span>
                  <p className="font-bold text-slate-800">{totalTargetCount} Orang Ahli</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-gradient-blue text-white py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Gift className="w-4 h-4" /> Sahkan & Agihkan Mata dengan Had Masa
              </button>
            </form>
          </div>
        )}

        {/* 🌟 TAB CONTENT: POINTS EXPIRY MANAGEMENT & RECONCILIATION */}
        {(activeTab === 'EXPIRY' || activeTab === 'ALL') && (
          <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-500" /> Pengurusan Had Tempoh Mata Kad (Points Expiry Date)
                </h2>
                <p className="text-xs text-slate-500">
                  Kawal had masa mata subsidi supaya mata yang tidak digunakan boleh tamat tempoh automatik dan dana dipulangkan ke peruntukan JAM.
                </p>
              </div>

              <button
                onClick={handleExpireAll}
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
              >
                <AlertTriangle className="w-4 h-4" /> Lupuskan Mata Melepasi Had Masa
              </button>
            </div>

            {expirySuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{expirySuccessMsg}</span>
              </div>
            )}

            {/* Quick Batch Expiry Extender Form */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" /> Tetapkan Had Masa Pukal:
              </span>
              <select
                value={selectedMemberToExtend}
                onChange={(e) => setSelectedMemberToExtend(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
              >
                <option value="ALL">Semua Ahli Sekaligus</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name.split(' ')[0]} ({m.cardId})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={customExtendDate}
                onChange={(e) => setCustomExtendDate(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none w-36"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCustomExtendDate('2026-11-08 18:00')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                >
                  8 Nov 18:00
                </button>
                <button
                  type="button"
                  onClick={() => setCustomExtendDate('2026-11-15 18:00')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                >
                  15 Nov 18:00
                </button>
                <button
                  type="button"
                  onClick={() => setCustomExtendDate('2026-11-30 23:59')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                >
                  30 Nov 23:59
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleApplyExtension(selectedMemberToExtend || 'ALL')}
                className="btn-gradient-blue text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl ml-auto cursor-pointer"
              >
                Kemas Kini Tarikh
              </button>
            </div>

            {/* Members Expiry Status Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3 rounded-l-2xl">Ahli & No. Kad</th>
                    <th className="py-3 px-3">Baki Mata Aktif</th>
                    <th className="py-3 px-3">Tarikh Luput Semasa</th>
                    <th className="py-3 px-3">Status Tempoh</th>
                    <th className="py-3 px-3 rounded-r-2xl text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-blue-50/30">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.cardId}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900">
                        {m.points.toLocaleString()} Mata
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (RM {(m.points / 100).toFixed(2)})
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                        {m.pointsExpiryDate || 'Tiada had'}
                      </td>
                      <td className="py-3 px-3">
                        {m.points > 0 ? (
                          <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Sah Aktif
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Sifar / Telah Luput
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApplyExtension(m.id)}
                            className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-full transition cursor-pointer"
                            title="Lanjutkan had masa ke tarikh pilihan"
                          >
                            + Lanjut
                          </button>
                          {m.points > 0 && (
                            <button
                              onClick={() => handleExpireSingle(m.id, m.name)}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] px-2.5 py-1 rounded-full transition cursor-pointer"
                              title="Lupuskan mata ahli ini serta-merta"
                            >
                              Lupuskan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🌟 TAB CONTENT: SELLER REIMBURSEMENT CLAIMS TABLE */}
        {(activeTab === 'CLAIMS' || activeTab === 'ALL') && (
          <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" /> Tuntutan Bayaran Balik Peniaga Gerai
                </h2>
                <p className="text-xs text-slate-500">
                  Peniaga yang menerima potongan mata JAM menuntut bayaran balik tunai/DuitNow daripada penganjur.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {claims.length} Permohonan
              </span>
            </div>

            {claims.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tiada permohonan tuntutan daripada peniaga setakat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-3 rounded-l-2xl">No. Tuntutan</th>
                      <th className="py-3 px-3">Gerai & Peniaga</th>
                      <th className="py-3 px-3">Masa</th>
                      <th className="py-3 px-3">Jumlah (RM)</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 rounded-r-2xl text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {claims.map((clm) => (
                      <tr key={clm.id} className="hover:bg-blue-50/40">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {clm.id}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">
                            {clm.sellerName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Gerai: {clm.stallNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{clm.timestamp}</td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900">
                          RM {clm.amountRM.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              clm.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {clm.status === 'PAID' ? 'SELESAI DIBAYAR' : 'MENUNGGU KELULUSAN'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {clm.status !== 'PAID' ? (
                            <button
                              onClick={() => onApproveClaim(clm.id)}
                              className="btn-gradient-blue text-white font-bold text-[10px] px-3.5 py-1.5 rounded-full transition cursor-pointer"
                            >
                              Luluskan & Bayar
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Berbayar
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 🌟 TAB CONTENT: MEMBERS & SELLERS DIRECTORY */}
        {(activeTab === 'MEMBERS' || activeTab === 'ALL') && (
          <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" /> Direktori Ahli Pemegang Kad
                  </h2>
                  <p className="text-xs text-slate-500">
                    Senarai semua penerima subsidi dengan baki mata terkini dan nombor kad.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari ahli / kad..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-3 rounded-l-2xl">Nama Ahli</th>
                      <th className="py-3 px-3">No. Kad JAM</th>
                      <th className="py-3 px-3">No. Telefon</th>
                      <th className="py-3 px-3">Baki Mata (RM)</th>
                      <th className="py-3 px-3 rounded-r-2xl">Status Kad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-blue-50/30">
                        <td className="py-3 px-3 font-bold text-slate-900">{m.name}</td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">{m.cardId}</td>
                        <td className="py-3 px-3 text-slate-600">{m.phone}</td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900">
                          {m.points.toLocaleString()} Mata (RM {(m.points / 100).toFixed(2)})
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              m.points > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {m.points > 0 ? 'Aktif' : 'Sifar / Luput'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gerai Peniaga Directory */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                <Store className="w-5 h-5 text-blue-600" /> Senarai Gerai Peniaga Rasmi
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Peniaga yang dilengkapi Standee Kod QR rasmi untuk menerima pembayaran mata ahli.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sellers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-mono">
                          {s.stallNumber}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">{s.businessName}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {s.ownerName} • {s.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Kutipan:</span>
                      <span className="font-mono font-black text-emerald-600 text-xs">
                        RM {(s.totalCollectedSen / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 🌟 TAB CONTENT: ANTI-FRAUD DIGITAL AUDIT & TRANSACTION LOG */}
        {(activeTab === 'AUDIT' || activeTab === 'ALL') && (
          <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Rekod Audit Ketirisan & Imbasan Sah
                </h2>
                <p className="text-xs text-slate-500">
                  Setiap transaksi direkodkan dengan identiti pembeli, gerai peniaga dan masa rasmi.
                </p>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-3 py-1 rounded-full">
                100% Imbasan QR Sah
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                        tx.type === 'OWNER_GRANT'
                          ? 'bg-amber-100 text-amber-800'
                          : tx.type === 'EXPIRY'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tx.type === 'OWNER_GRANT' ? 'AGIH' : tx.type === 'EXPIRY' ? 'LUPUT' : 'IMBAS'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {tx.type === 'OWNER_GRANT'
                          ? `Agihan Subsidi ke ${tx.memberName}`
                          : tx.type === 'EXPIRY'
                          ? `Pelupusan Mata (${tx.memberName})`
                          : `${tx.memberName} ➔ ${tx.sellerName} (Gerai ${tx.stallNumber})`}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ID: {tx.id} • {tx.timestamp} • {tx.note}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-black ${
                        tx.type === 'EXPIRY' ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'EXPIRY' ? '-' : ''}RM {tx.amountRM.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {tx.amountPoints} Mata
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};