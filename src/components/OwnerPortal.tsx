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
  UserCheck,
  MoreHorizontal,
  Tag,
  Paperclip,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Send,
  Bell,
  BellOff,
  Smile,
  Image as ImageIcon,
  File as FileIcon,
  Download,
  ExternalLink
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
  // Navigation Tabs in Blue Ribbon
  const [activeTab, setActiveTab] = useState<
    'BOARD' | 'OVERVIEW' | 'GRANT' | 'EXPIRY' | 'CLAIMS' | 'MEMBERS' | 'AUDIT'
  >('BOARD');

  // Selected Campaign in Left Secondary Sidebar
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('CMP-01');

  // Form states for Grant Points
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Checklist states for Glendale Board View
  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Agihan Subsidi RM 10.00 (1,000 Mata per Ahli)', done: true },
    { id: '2', text: 'Penetapan Had Tempoh Luput (08 Nov 2026, 18:00)', done: true },
    { id: '3', text: 'Imbasan Kamera Kod QR Meja Gerai Diaktifkan', done: true },
    { id: '4', text: 'Semakan & Kelulusan Tuntutan Bayaran Balik Peniaga', done: false },
    { id: '5', text: 'Pelupusan Automatik Mata Baki Melepasi Had Masa', done: false },
  ]);

  // Quick note / comment input
  const [newComment, setNewComment] = useState<string>('');
  const [customAuditNotes, setCustomAuditNotes] = useState<
    { author: string; time: string; text: string; avatarColor: string }[]
  >([
    {
      author: 'Gilbert Oliver (Ketua Penyelaras)',
      time: '01:30AM • 04/11/26',
      text: 'Sila pastikan semua baki mata subsidi disemak sebelum tarikh had masa 8 Nov 2026 untuk mengelakkan ketirisan dana.',
      avatarColor: 'bg-indigo-600',
    },
    {
      author: 'Gabriel Lam (Urusetia Tapak)',
      time: '01:35AM • 04/11/26',
      text: 'Standee kod QR gerai ayam segar dan sayur telah dipasang. Penebusan mata berjalan lancar!',
      avatarColor: 'bg-emerald-600',
    },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCustomAuditNotes((prev) => [
      ...prev,
      {
        author: 'Pengarah Jualan Agro MADANI',
        time: 'Baru sebentar tadi',
        text: newComment,
        avatarColor: 'bg-blue-600',
      },
    ]);
    setNewComment('');
  };

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

  // Campaigns list for the secondary sidebar
  const CAMPAIGNS = [
    {
      id: 'CMP-01',
      title: 'Pasar Tani Mega Putrajaya',
      date: '08 Nov 2026',
      sub: 'Peruntukan RM 15.00',
      thumbnail: '/jam-card-luxury.jpg',
      badge: 'AKTIF',
    },
    {
      id: 'CMP-02',
      title: 'Jualan Agro MADANI Selayang',
      date: '15 Nov 2026',
      sub: 'Ayam Segar & Telur',
      thumbnail: '/ayam_segar.png',
      badge: 'AKAN DATANG',
    },
    {
      id: 'CMP-03',
      title: 'Karnival Rahmah Agro Johor',
      date: '30 Nov 2026',
      sub: 'Buah & Keperluan Asas',
      thumbnail: '/buah_tempatan.png',
      badge: 'BULANAN',
    },
    {
      id: 'CMP-04',
      title: 'Pasar Komuniti Desa Pandan',
      date: '05 Dis 2026',
      sub: 'Sayur Segar Kampung',
      thumbnail: '/sayur_kampung.png',
      badge: 'PERANCANGAN',
    },
  ];

  return (
    <div className="bg-[#e9edf5] p-2 sm:p-5 rounded-[36px] shadow-2xl border border-slate-300/80 font-sans select-none">
      
      {/* 🌟 MAIN GLENDALE APPLICATION WINDOW */}
      <div className="bg-white rounded-[28px] shadow-xl overflow-hidden border border-slate-200/90 flex flex-col min-h-[820px]">
        
        {/* Top Window Strip with Mac Traffic Lights */}
        <div className="bg-white px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-2xs"></span>
            <span className="ml-3 text-[11px] font-bold text-slate-600 hidden sm:inline">
              JAM Loyalty Card Dashboard • Sistem Pengurusan Subsidi Agro MADANI
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
            <span className="hidden md:inline">1 Mata = 1 Sen (RM 0.01)</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              Versi Rasmi
            </span>
          </div>
        </div>

        {/* 🌟 3-COLUMN GLENDALE WORKSPACE LAYOUT */}
        <div className="flex-1 flex flex-row overflow-hidden">
          
          {/* ======================================================== */}
          {/* 1. LEFTMOST DEEP ROYAL BLUE STRIP (WITH LIQUID CURVED NOTCH) */}
          {/* ======================================================== */}
          <aside className="w-[62px] sm:w-[72px] bg-[#0c4ec5] text-white flex flex-col items-center py-5 shrink-0 relative z-20 select-none">
            
            {/* Top Orange Circle Avatar (OS / Logo) */}
            <div className="w-10 h-10 rounded-full bg-[#ff6b4a] text-white font-black text-xs flex items-center justify-center shadow-md mb-6 cursor-pointer hover:scale-105 transition">
              JAM
            </div>

            {/* Vertical App / Mode Icons Stack */}
            <div className="flex-1 flex flex-col items-center gap-4 w-full">
              
              {/* ACTIVE NOTCHED BUTTON: DASHBOARD (BLUE MESSENGER ICON ON WHITE CIRCLE) */}
              <div className="relative w-full flex items-center justify-center py-1">
                
                {/* SVG Liquid Inward Curve Notch (Top) */}
                <div className="absolute right-0 -top-4 w-4 h-4 pointer-events-none text-[#f6f8fc]">
                  <svg viewBox="0 0 16 16" className="w-full h-full" fill="currentColor">
                    <path d="M16,0 C16,8.837 8.837,16 0,16 L16,16 Z" />
                  </svg>
                </div>

                {/* The Active Cutout Background connecting to Secondary Panel */}
                <div className="absolute right-0 top-0 bottom-0 w-full bg-[#f6f8fc] rounded-l-full"></div>

                {/* SVG Liquid Inward Curve Notch (Bottom) */}
                <div className="absolute right-0 -bottom-4 w-4 h-4 pointer-events-none text-[#f6f8fc]">
                  <svg viewBox="0 0 16 16" className="w-full h-full" fill="currentColor">
                    <path d="M16,16 C16,7.163 8.837,0 0,0 L16,16 Z" />
                  </svg>
                </div>

                {/* The Active Icon Circle */}
                <button
                  onClick={() => setActiveTab('BOARD')}
                  title="Dashboard Papan Kawalan (Glendale View)"
                  className="w-10 h-10 rounded-full bg-[#1660eb] text-white flex items-center justify-center shadow-md relative z-10 hover:scale-105 transition cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Second Mode: Black Circle Icon (Ahli / Pembeli) */}
              <button
                onClick={() => onSwitchView && onSwitchView('BUYER')}
                title="Tukar ke Paparan Telefon Pembeli (Ahli)"
                className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition cursor-pointer shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
              </button>

              {/* Third Mode: Green Circle Icon (Gerai Peniaga) */}
              <button
                onClick={() => onSwitchView && onSwitchView('SELLER')}
                title="Tukar ke Terminal Standee Peniaga Gerai"
                className="w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center hover:scale-105 transition cursor-pointer shadow-sm"
              >
                <Store className="w-4 h-4" />
              </button>

              {/* Fourth Mode: Split Simulation Shortcut */}
              <button
                onClick={() => onSwitchView && onSwitchView('SPLIT')}
                title="Tukar ke Simulasi Serentak (Split View)"
                className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center hover:scale-105 transition cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Actions: Reset Data Button */}
            {onResetData && (
              <button
                onClick={onResetData}
                title="Set Semula Data Contoh"
                className="w-9 h-9 rounded-full bg-white/15 text-white/80 hover:text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer mt-auto"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </aside>

          {/* ======================================================== */}
          {/* 2. SECONDARY SIDEBAR: CAMPAIGN / PROJECT LIST COLUMN */}
          {/* ======================================================== */}
          <div className="w-[200px] sm:w-[230px] bg-[#f6f8fc] border-r border-slate-200/80 flex flex-col shrink-0 p-3.5 space-y-4">
            
            {/* Team / Organization Header Switcher */}
            <div>
              <div className="flex items-center justify-between cursor-pointer">
                <h3 className="font-black text-slate-800 text-xs sm:text-sm tracking-tight flex items-center gap-1">
                  Urusetia JAM <span className="text-[10px] text-slate-400">▾</span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                admin@jualanagromadani.gov.my
              </p>

              {/* Status Row: Do not Disturb / Active Market */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Status Pasar: ON
                </span>
                <Bell className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Campaign Cards Stack (Glendale Style) */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
              {CAMPAIGNS.map((cmp) => {
                const isSelected = selectedCampaignId === cmp.id;
                return (
                  <div
                    key={cmp.id}
                    onClick={() => setSelectedCampaignId(cmp.id)}
                    className={`rounded-2xl p-2.5 border transition cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#1b63eb] text-white border-blue-600 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Thumbnail Preview Banner */}
                    <div className="w-full h-16 rounded-xl overflow-hidden mb-2 relative bg-slate-100">
                      <img
                        src={cmp.thumbnail}
                        alt={cmp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span
                        className={`absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                          isSelected
                            ? 'bg-black/60 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {cmp.badge}
                      </span>
                    </div>

                    {/* Card Title & Date */}
                    <h4
                      className={`text-xs font-black truncate leading-tight ${
                        isSelected ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {cmp.title}
                    </h4>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {cmp.date} • {cmp.sub}
                    </p>

                    {/* Overlapping Member Avatars + Three Dots */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/20">
                      <div className="flex items-center -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[8px] font-black text-slate-900">
                          PR
                        </div>
                        <div className="w-5 h-5 rounded-full bg-blue-400 border border-white flex items-center justify-center text-[8px] font-black text-white">
                          SH
                        </div>
                        <div className="w-5 h-5 rounded-full bg-emerald-400 border border-white flex items-center justify-center text-[8px] font-black text-slate-900">
                          SR
                        </div>
                      </div>

                      <MoreHorizontal
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. MAIN WORKSPACE AREA (SEARCH, BLUE RIBBON, BOARD VIEW) */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7fb] overflow-y-auto">
            
            {/* Top Search Bar with Glendale Logo / JAM Branding */}
            <div className="bg-white px-5 py-3 border-b border-slate-200/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-lg">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari ahli, no. kad JAM, gerai peniaga, transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Glendale-style Logo Plaque */}
              <div className="flex items-center gap-2 shrink-0">
                <img
                  src="/logo-jam.png"
                  alt="JAM"
                  className="h-8 w-auto object-contain"
                />
                <span className="font-extrabold text-sm tracking-tight text-slate-900 font-display">
                  glendale<span className="text-blue-600">.jam</span>
                </span>
              </div>
            </div>

            {/* 🌟 VIBRANT ROYAL BLUE HORIZONTAL RIBBON WITH ORGANIC CUTOUT TAB */}
            <div className="bg-[#1254d3] px-5 pt-2 flex items-center gap-2 overflow-x-auto relative select-none">
              
              {/* Tab 1: Papan Kawalan (Glendale Board View) - ACTIVE WITH ORGANIC CONCAVE FILLET */}
              <div className="relative">
                {activeTab === 'BOARD' && (
                  <>
                    {/* Left concave fillet SVG */}
                    <div className="absolute -left-3 bottom-0 w-3 h-3 text-[#f4f7fb] pointer-events-none">
                      <svg viewBox="0 0 12 12" className="w-full h-full" fill="currentColor">
                        <path d="M12,0 C12,6.627 6.627,12 0,12 L12,12 Z" />
                      </svg>
                    </div>
                    {/* Right concave fillet SVG */}
                    <div className="absolute -right-3 bottom-0 w-3 h-3 text-[#f4f7fb] pointer-events-none">
                      <svg viewBox="0 0 12 12" className="w-full h-full" fill="currentColor">
                        <path d="M0,0 C0,6.627 5.373,12 12,12 L0,12 Z" />
                      </svg>
                    </div>
                  </>
                )}

                <button
                  onClick={() => setActiveTab('BOARD')}
                  className={`px-5 py-2.5 rounded-t-2xl font-black text-xs flex items-center gap-2 transition cursor-pointer relative ${
                    activeTab === 'BOARD'
                      ? 'bg-[#f4f7fb] text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#ff6b4a] inline-block"></span>
                  <span>Task Board</span>
                </button>
              </div>

              {/* Tab 2: Ringkasan KPI (Overview) */}
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-[#f4f7fb] text-slate-900'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Reports & KPI</span>
              </button>

              {/* Tab 3: Agih Subsidi (Grant) */}
              <button
                onClick={() => setActiveTab('GRANT')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'GRANT'
                    ? 'bg-[#f4f7fb] text-slate-900'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Agih Subsidi</span>
              </button>

              {/* Tab 4: Pengurusan Had Masa Expiry */}
              <button
                onClick={() => setActiveTab('EXPIRY')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'EXPIRY'
                    ? 'bg-[#f4f7fb] text-slate-900'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Had Masa Expiry</span>
                <span className="bg-emerald-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full">
                  AKTIF
                </span>
              </button>

              {/* Tab 5: Tuntutan Peniaga Gerai */}
              <button
                onClick={() => setActiveTab('CLAIMS')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'CLAIMS'
                    ? 'bg-[#f4f7fb] text-slate-900'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Tuntutan Gerai</span>
                {pendingClaimsCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingClaimsCount}
                  </span>
                )}
              </button>

              {/* Tab 6: Direktori Ahli & Gerai */}
              <button
                onClick={() => setActiveTab('MEMBERS')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'MEMBERS'
                    ? 'bg-[#f4f7fb] text-slate-900'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Ahli & Gerai</span>
              </button>

              {/* Tab 7: Rekod Audit */}
              <button
                onClick={() => setActiveTab('AUDIT')}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'AUDIT'
                    ? 'bg-[#f4f7fb] text-slate-900'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audit Trail</span>
              </button>
            </div>

            {/* 🌟 TAB CONTENT AREA */}
            <div className="flex-1 p-5 space-y-5">
              
              {/* ======================================================== */}
              {/* VIEW 1: GLENDALE TASK BOARD VIEW (DEFAULT GLENDALE STYLE) */}
              {/* ======================================================== */}
              {activeTab === 'BOARD' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Title & Navigation Row */}
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Task Board View
                          </h2>
                          <span className="bg-rose-50 text-rose-600 border border-rose-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                            URGENT
                          </span>
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold px-2 py-0.5 rounded-md font-mono">
                            1 MATA = 1 SEN
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Due Date: <strong>Today at 11:00PM (08 Nov 2026, 18:00)</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Two-Column Glendale Canvas Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* LEFT / CENTER COLUMN: TASK DETAILS, CHECKLIST, LIVE CHAT STREAM */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                      
                      {/* Description & Metadata Section */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Task Description
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                          Complete Task Board view on this Thursday • Pelaksanaan Agihan Subsidi Jualan Agro MADANI
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Sistem agihan mata subsidi digital terus ke kad kesetiaan pembeli dengan nilai 1 Mata = 1 Sen. Penebusan dibuat di gerai ayam segar, telur, sayur dan buah tempatan.
                        </p>
                      </div>

                      {/* Meta Grid: Due Date, Members, Task Owner */}
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Due Date</span>
                          <p className="font-extrabold text-slate-800 mt-0.5 font-mono">
                            Today at 11:00PM
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Members</span>
                          <div className="flex items-center -space-x-1.5 mt-1">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center border border-white">
                              PR
                            </div>
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center border border-white">
                              SH
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center border border-white">
                              SR
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Task Owner</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center">
                              GO
                            </div>
                            <span className="font-bold text-slate-800 text-xs">Gilbert Oliver</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Checklist / Actions (Glendale Style) */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                          Actions & Checklist
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {checklist.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleChecklist(item.id)}
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                            >
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                  item.done
                                    ? 'bg-[#22c55e] border-[#22c55e] text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span
                                className={`font-semibold ${
                                  item.done ? 'text-slate-800' : 'text-slate-500'
                                }`}
                              >
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comments / Stream Section (Glendale Style) */}
                      <div className="pt-4 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
                          Comments & Live Audit Stream
                        </span>

                        <div className="space-y-3.5">
                          {customAuditNotes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs">
                              <div
                                className={`w-8 h-8 rounded-full ${note.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                              >
                                {note.author.split(' ')[0][0]}
                                {note.author.split(' ')[1] ? note.author.split(' ')[1][0] : ''}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800">
                                    {note.author}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {note.time}
                                  </span>
                                </div>
                                <div className="mt-1 bg-slate-50/90 rounded-2xl rounded-tl-xs p-3 text-slate-700 text-xs border border-slate-100 shadow-2xs leading-relaxed inline-block max-w-xl">
                                  {note.text}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Recent Transactions formatted into Glendale Stream */}
                          {transactions.slice(0, 2).map((tx) => (
                            <div key={tx.id} className="flex items-start gap-3 text-xs">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                TX
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800">
                                    {tx.memberName}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {tx.timestamp}
                                  </span>
                                </div>
                                <div className="mt-1 bg-blue-50/80 rounded-2xl rounded-tl-xs p-3 text-blue-900 text-xs border border-blue-100 shadow-2xs inline-block">
                                  <strong>
                                    {tx.type === 'OWNER_GRANT' ? 'Subsidi Masuk:' : 'Penebusan di Gerai:'}
                                  </strong>{' '}
                                  {tx.amountPoints} Mata (RM {tx.amountRM.toFixed(2)}) • {tx.note}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Interactive Chat Input Bar (Glendale Style) */}
                        <form
                          onSubmit={handleAddComment}
                          className="mt-4 flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 gap-2 shadow-inner"
                        >
                          <input
                            type="text"
                            placeholder="Type your message / Catatan audit..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                          />
                          <div className="flex items-center gap-2 text-slate-400">
                            <Smile className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
                            <Paperclip className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
                            <button
                              type="submit"
                              className="w-7 h-7 rounded-full bg-[#175ceb] text-white flex items-center justify-center hover:bg-blue-600 transition cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: ADD WIDGETS & SHARED FILES (GLENDALE STYLE) */}
                    <div className="lg:col-span-4 space-y-4">
                      
                      {/* Glendale "Add" Actions Panel */}
                      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Add & Tindakan Pantas
                        </span>

                        {/* Primary Solid Blue Action Button (Glendale Style) */}
                        <button
                          onClick={() => setActiveTab('GRANT')}
                          className="w-full bg-[#1b63eb] text-white rounded-2xl py-3 px-4 text-xs font-black flex items-center gap-2.5 shadow-md shadow-blue-500/20 hover:bg-blue-600 transition cursor-pointer"
                        >
                          <Users className="w-4 h-4" />
                          <span>Agih Mata Subsidi Ahli</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('EXPIRY')}
                          className="w-full bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Clock className="w-4 h-4 text-rose-500" />
                          <span>Urus Had Tempoh Expiry</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('CLAIMS')}
                          className="w-full bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Store className="w-4 h-4 text-amber-500" />
                          <span>Tuntutan Peniaga ({pendingClaimsCount})</span>
                        </button>

                        <button
                          onClick={handleExpireAll}
                          className="w-full bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Lupuskan Melepasi Had</span>
                        </button>
                      </div>

                      {/* Glendale "Shared files" Widget */}
                      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-black text-slate-900 block">
                              Shared files
                            </span>
                            <span className="text-[10px] text-slate-400">
                              04 files, Bahan Rasmi JAM
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">
                            Lihat Semua
                          </span>
                        </div>

                        {/* File list items matching Glendale Screenshot */}
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between hover:bg-white transition cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                                  Standee_QR_Gerai_A01.svg
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  04/11/26 • 512.0 KB
                                </p>
                              </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                          </div>

                          <div className="p-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between hover:bg-white transition cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                                  Kad_Mewah_Loyalty_JAM.jpg
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  04/11/26 • 820.0 KB
                                </p>
                              </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                          </div>

                          <div className="p-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between hover:bg-white transition cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <FileIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                                  Senarai_Harga_Siling_JAM.pdf
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  04/11/26 • 1.2 MB
                                </p>
                              </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* VIEW 2: FINANCIAL KPI OVERVIEW (REPORTS) */}
              {/* ======================================================== */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                        <span>Jumlah Diagih</span>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                        RM {totalGrantedRM.toFixed(2)}
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                        {totalGrantedPoints.toLocaleString()} Mata
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                        <span>Ditebus di Gerai</span>
                        <TrendingDown className="w-4 h-4 text-rose-600" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                        RM {totalRedeemedRM.toFixed(2)}
                      </p>
                      <p className="text-xs text-rose-600 font-semibold mt-0.5">
                        {totalRedeemedPoints.toLocaleString()} Mata Ditolak
                      </p>
                    </div>

                    <div className="bg-rose-50/70 p-5 rounded-3xl border border-rose-200 shadow-xs">
                      <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
                        <span>Luput Dipulangkan</span>
                        <Clock className="w-4 h-4 text-rose-600" />
                      </div>
                      <p className="text-2xl font-black text-rose-600 mt-2 font-mono">
                        RM {totalExpiredRM.toFixed(2)}
                      </p>
                      <p className="text-xs text-rose-700 font-semibold mt-0.5">
                        {totalExpiredPoints.toLocaleString()} Mata Luput
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                        <span>Baki Belum Ditebus</span>
                        <Coins className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-black text-blue-600 mt-2 font-mono">
                        RM {unredeemedRM.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Dalam dompet ahli
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                        <span>Ahli Berdaftar</span>
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                        {members.length} Ahli
                      </p>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                        {sellers.length} Gerai Berdaftar
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* VIEW 3: GRANT POINTS FORM */}
              {/* ======================================================== */}
              {activeTab === 'GRANT' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Presets */}
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

                    <button
                      type="submit"
                      className="w-full bg-[#1b63eb] text-white py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-600"
                    >
                      <Gift className="w-4 h-4" /> Sahkan & Agihkan Mata dengan Had Masa
                    </button>
                  </form>
                </div>
              )}

              {/* ======================================================== */}
              {/* VIEW 4: POINTS EXPIRY MANAGEMENT */}
              {/* ======================================================== */}
              {activeTab === 'EXPIRY' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
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
                    <button
                      type="button"
                      onClick={() => handleApplyExtension(selectedMemberToExtend || 'ALL')}
                      className="bg-[#1b63eb] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl ml-auto cursor-pointer"
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
                                >
                                  + Lanjut
                                </button>
                                {m.points > 0 && (
                                  <button
                                    onClick={() => handleExpireSingle(m.id, m.name)}
                                    className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] px-2.5 py-1 rounded-full transition cursor-pointer"
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

              {/* ======================================================== */}
              {/* VIEW 5: SELLER REIMBURSEMENT CLAIMS */}
              {/* ======================================================== */}
              {activeTab === 'CLAIMS' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
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
                                    className="bg-[#1b63eb] text-white font-bold text-[10px] px-3.5 py-1.5 rounded-full transition cursor-pointer"
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

              {/* ======================================================== */}
              {/* VIEW 6: MEMBERS & STALLS DIRECTORY */}
              {/* ======================================================== */}
              {activeTab === 'MEMBERS' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" /> Direktori Ahli & Pemegang Kad
                      </h2>
                      <p className="text-xs text-slate-500">
                        Senarai penerima subsidi dengan baki mata aktif dan tarikh tamat.
                      </p>
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
                          <th className="py-3 px-3 rounded-r-2xl">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {members.map((m) => (
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
              )}

              {/* ======================================================== */}
              {/* VIEW 7: DIGITAL AUDIT TRAIL */}
              {/* ======================================================== */}
              {activeTab === 'AUDIT' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" /> Log Audit Ketirisan & Imbasan Sah
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

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};