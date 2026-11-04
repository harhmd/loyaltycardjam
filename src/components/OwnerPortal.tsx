import React, { useState } from 'react';
import { Member, Seller, Transaction, ReimbursementClaim } from '../types';
import confetti from 'canvas-confetti';
import {
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  BarChart2,
  MessageSquare,
  Headphones,
  Settings,
  Search,
  Bell,
  Mail,
  ChevronDown,
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  Gift,
  Coins,
  Users,
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  ArrowRightLeft,
  Calendar,
  ExternalLink,
  Check,
  PanelLeftClose,
  ChevronRight,
  TrendingUp,
  TrendingDown
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
  // Active Navigation in Visualboard Left Sidebar
  const [activeNav, setActiveNav] = useState<
    'DASHBOARD' | 'ORDERS' | 'PRODUCTS' | 'ANALYTICS' | 'MESSAGES' | 'SUPPORT' | 'SETTINGS'
  >('DASHBOARD');

  // Form states for Grant Points Modal / Panel
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [isClaimsModalOpen, setIsClaimsModalOpen] = useState(false);

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

    setTimeout(() => {
      setGrantSuccessMsg('');
      setIsGrantModalOpen(false);
    }, 4000);
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

  // Products Table Data matching reference layout with JAM fresh produce
  const PRODUCT_ROWS = [
    {
      id: '1',
      name: 'Ayam Segar Bismi',
      sub: 'Zon Unggas & Daging • Gerai Pak Ali',
      image: '/ayam_segar.png',
      stocks: '12,245 ekor',
      price: 'RM 12.00',
      sales: '8,983',
      earnings: 'RM 107,796.00',
      growth: '+8.32%',
    },
    {
      id: '2',
      name: 'Telur Ayam Gred A',
      sub: 'Zon Telur & Runcit • Gerai Cikgu Samad',
      image: '/telur_ayam.png',
      stocks: '8,463 papan',
      price: 'RM 14.00',
      sales: '1,293',
      earnings: 'RM 18,102.00',
      growth: '+8.32%',
    },
    {
      id: '3',
      name: 'Nenas MD2 & Buah Tempatan',
      sub: 'Zon Buah Tropika • Gerai Kak Som',
      image: '/buah_tempatan.png',
      stocks: '24,432 kg',
      price: 'RM 8.00',
      sales: '4,425',
      earnings: 'RM 35,400.00',
      growth: '+8.32%',
    },
    {
      id: '4',
      name: 'Sayur Kampung Segar',
      sub: 'Zon Hasil Tani Hijau • Gerai Mak Jah',
      image: '/sayur_kampung.png',
      stocks: '19,498 ikat',
      price: 'RM 5.00',
      sales: '6,392',
      earnings: 'RM 31,960.00',
      growth: '+8.32%',
    },
  ];

  return (
    <div className="bg-[#f0f7ff] min-h-[920px] p-2 sm:p-5 rounded-[40px] text-slate-800 font-sans select-none border border-blue-100 shadow-2xl">
      
      {/* 🌟 2-COLUMN VISUALBOARD SHELL WITH ICE-BLUE & GLASS THEME */}
      <div className="bg-white/80 backdrop-blur-md rounded-[36px] overflow-hidden flex flex-col lg:flex-row min-h-[880px] border border-white shadow-sm">
        
        {/* ======================================================== */}
        {/* 1. LEFT SIDEBAR (VISUALBOARD NAVIGATION - BLUE/CYAN THEME) */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-[240px] bg-white border-r border-blue-50 p-5 flex flex-col shrink-0 space-y-6">
          
          {/* Brand Logo & Collapse Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs p-1">
                <img
                  src="/logo-jam.png"
                  alt="JAM"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Visualboard<span className="text-blue-600">.jam</span>
              </span>
            </div>

            <button
              title="Kecilkan bar sisi"
              className="w-7 h-7 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 flex items-center justify-center transition cursor-pointer"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile Card Pill (Barudak visual / Urusetia JAM) */}
          <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer hover:border-blue-200 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shrink-0 shadow-2xs">
                <img
                  src="/logo-jam.png"
                  alt="Avatar"
                  className="w-full h-full object-contain rounded-full bg-white p-0.5"
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Urusetia JAM
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  3.09K Ahli Berdaftar
                </p>
              </div>
            </div>
            <div className="flex flex-col text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Nav Section: GENERAL */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
              GENERAL
            </span>

            {/* Item 1: Dashboard (Active Pill with Royal Blue theme & ⌘ D) */}
            <button
              onClick={() => setActiveNav('DASHBOARD')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer ${
                activeNav === 'DASHBOARD'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span>Dashboard</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-white border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md shadow-2xs">
                ⌘ D
              </span>
            </button>

            {/* Item 2: Orders / Penebusan & Belian */}
            <button
              onClick={() => {
                setActiveNav('ORDERS');
                setIsClaimsModalOpen(true);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNav === 'ORDERS'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span>Orders (Tuntutan)</span>
              </div>
              {pendingClaimsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {pendingClaimsCount}
                </span>
              )}
            </button>

            {/* Item 3: Products / Produk & Gerai */}
            <button
              onClick={() => setActiveNav('PRODUCTS')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNav === 'PRODUCTS'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span>Products (Produk)</span>
            </button>

            {/* Item 4: Analytics / Had Tempoh Expiry */}
            <button
              onClick={() => {
                setActiveNav('ANALYTICS');
                setIsExpiryModalOpen(true);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNav === 'ANALYTICS'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                <span>Had Masa (Expiry)</span>
              </div>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">
                AKTIF
              </span>
            </button>

            {/* Item 5: Messages / Suapan Transaksi */}
            <button
              onClick={() => setActiveNav('MESSAGES')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeNav === 'MESSAGES'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                  : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Messages (Audit)</span>
            </button>
          </div>

          {/* Nav Section: HELP & SETTINGS */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
              HELP & SETTINGS
            </span>

            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-blue-50/60 hover:text-blue-700 transition cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-slate-400" />
              <span>Agih Mata Subsidi</span>
            </button>

            <button
              onClick={() => onResetData && onResetData()}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Set Semula Data</span>
            </button>
          </div>

          {/* Bottom Promo Card (Dana Subsidi JAM in Royal Blue Theme) */}
          <div className="mt-auto bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200/70 rounded-3xl p-3.5 text-center relative overflow-hidden space-y-2 shadow-xs">
            {/* Blue & Cyan Shopping Bag Motif */}
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <ShoppingBag className="w-6 h-6 text-white stroke-[2.5]" />
            </div>

            <div>
              <h5 className="text-xs font-black text-slate-900 leading-tight">
                Dana Subsidi JAM
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Baki Peruntukan Penganjur: <strong className="text-blue-900">RM 50,000</strong>
              </p>
            </div>

            {/* Progress bar with Royal Blue to Emerald gradient */}
            <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full w-[65%] rounded-full"></div>
            </div>

            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="w-full btn-gradient-blue text-white font-black text-[11px] py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              Agih Subsidi Sekarang ➔
            </button>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* 2. MAIN CONTENT AREA (VISUALBOARD CANVAS)                */}
        {/* ======================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto space-y-5 bg-[#f8fbff]/70">
          
          {/* Top Header Row: Greeting & Right User Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                Selamat Pagi,
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Urusetia Induk • Pengarah Jualan Agro MADANI
              </h1>
            </div>

            {/* Right Action Cluster matching reference image */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              
              {/* Circular Search button */}
              <button className="w-9 h-9 rounded-full bg-white border border-slate-200/90 text-slate-600 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer shadow-2xs">
                <Search className="w-4 h-4" />
              </button>

              {/* Circular Notification Bell with dot */}
              <button className="w-9 h-9 rounded-full bg-white border border-slate-200/90 text-slate-600 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer relative shadow-2xs">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>
              </button>

              {/* Circular Inbox button with badge 4 */}
              <button className="w-9 h-9 rounded-full bg-white border border-slate-200/90 text-slate-600 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer relative shadow-2xs">
                <Mail className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  4
                </span>
              </button>

              {/* User Profile Pill matching reference screenshot */}
              <div className="bg-white border border-slate-200/90 rounded-full py-1 pl-1 pr-3 flex items-center gap-2 shadow-2xs cursor-pointer hover:border-blue-300 transition">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                  JAM
                </div>
                <div className="hidden md:block leading-tight text-left">
                  <p className="text-xs font-black text-slate-900">Urusetia Pusat</p>
                  <p className="text-[9px] text-slate-400">admin@agro.madani.gov.my</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Quick View Switcher Ribbon (Buyer / Seller / Split) */}
          {onSwitchView && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-blue-100 shadow-2xs text-xs font-bold overflow-x-auto">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider px-2 font-black">
                MOD PAPARAN:
              </span>
              <button
                onClick={() => onSwitchView('SPLIT')}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulasi Serentak</span>
              </button>
              <button
                onClick={() => onSwitchView('BUYER')}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Skrin Pembeli (Ahli)</span>
              </button>
              <button
                onClick={() => onSwitchView('SELLER')}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span>Standee Gerai (Peniaga)</span>
              </button>
            </div>
          )}

          {/* 🌟 2-COLUMN GRID (CENTER HERO + RIGHT METRICS WIDGETS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ======================================================== */}
            {/* CENTER COLUMN (HERO, SALES FUNNEL, PRODUCTS TABLE)      */}
            {/* ======================================================== */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* 1. ROYAL BLUE TO EMERALD HERO BANNER CARD (OFFICIAL THEME-GRADIENT-WAVE) */}
              <div className="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#059669] text-white rounded-[32px] p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Background decorative waves / radial glow matching Buyer & Seller theme */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-sm space-y-3">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    Prestasi Jualan & Subsidi Terkini JAM 👋
                  </h2>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-xs">
                        RM {totalRedeemedRM > 0 ? totalRedeemedRM.toFixed(2) : '8,567.00'}
                      </span>
                      <span className="text-xs text-cyan-200 font-extrabold uppercase tracking-wider">
                        Subsidi Ditebus
                      </span>
                    </div>
                    <p className="text-xs text-blue-50/90 mt-1 leading-relaxed">
                      2,478 barangan segar telah ditebus oleh ahli menggunakan kad kesetiaan JAM (1 Mata = 1 Sen).
                    </p>
                  </div>

                  <button
                    onClick={() => setIsGrantModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-5 py-2.5 rounded-full font-black text-xs transition cursor-pointer shadow-md"
                  >
                    <span>Agih Subsidi Baru</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-700" />
                  </button>
                </div>

                {/* Right Illustration / 3D Produce Motif */}
                <div className="relative z-10 shrink-0 w-44 sm:w-56 h-36 flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Visual Badge & Fresh Produce composition */}
                    <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center p-2 relative shadow-inner">
                      <img
                        src="/logo-jam.png"
                        alt="JAM"
                        className="w-16 h-16 object-contain drop-shadow-md"
                      />
                    </div>

                    {/* Floating produce cards */}
                    <div className="absolute top-0 right-2 w-12 h-12 rounded-2xl bg-white p-1 shadow-lg border border-white">
                      <img
                        src="/ayam_segar.png"
                        alt="Ayam"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <div className="absolute bottom-1 left-2 w-11 h-11 rounded-2xl bg-white p-1 shadow-lg border border-white">
                      <img
                        src="/buah_tempatan.png"
                        alt="Buah"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. SALES FUNNEL / MULTI-TIER METRICS STRIP CARD (BLUE-CYAN ACCENT) */}
              <div className="bg-white rounded-[32px] p-6 border border-blue-50 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Sales funnel (Aliran Subsidi JAM)
                  </h3>
                  <button className="text-slate-400 hover:text-blue-600 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Metric Columns matching reference layout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  {/* Column 1 */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      All sessions
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                        {totalGrantedPoints > 0 ? `${(totalGrantedPoints / 1000).toFixed(1)}K` : '289.12K'}
                      </span>
                      <span className="inline-flex items-center text-[9px] font-black text-blue-700 bg-blue-50 px-1 py-0.2 rounded-md">
                        <ArrowUpRight className="w-2.5 h-2.5" /> 8.32%
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      Jumlah Mata Diagih
                    </span>
                  </div>

                  {/* Column 2 */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Product views
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                        {totalRedeemedPoints > 0 ? `${(totalRedeemedPoints / 1000).toFixed(1)}K` : '184.64K'}
                      </span>
                      <span className="inline-flex items-center text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-md">
                        <ArrowUpRight className="w-2.5 h-2.5" /> 8.32%
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      Penebusan di Gerai
                    </span>
                  </div>

                  {/* Column 3 */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Add to cart
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                        {unredeemedRM > 0 ? `${(unredeemedRM * 10).toFixed(1)}K` : '156.3K'}
                      </span>
                      <span className="inline-flex items-center text-[9px] font-black text-blue-700 bg-blue-50 px-1 py-0.2 rounded-md">
                        <ArrowUpRight className="w-2.5 h-2.5" /> 8.32%
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      Baki Belum Ditebus
                    </span>
                  </div>

                  {/* Column 4 */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Checkout
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                        {totalExpiredPoints > 0 ? `${(totalExpiredPoints / 1000).toFixed(1)}K` : '65.8K'}
                      </span>
                      <span className="inline-flex items-center text-[9px] font-black text-amber-700 bg-amber-50 px-1 py-0.2 rounded-md">
                        <ArrowUpRight className="w-2.5 h-2.5" /> 8.32%
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      Mata Luput / Pulang
                    </span>
                  </div>
                </div>

                {/* Smooth Multi-Step Blue & Cyan Wave Chart across the bottom */}
                <div className="mt-4 -mx-6 -mb-6 h-16 overflow-hidden relative">
                  <svg
                    viewBox="0 0 500 70"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient id="visualboardBlueWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,45 Q 60,30 130,48 T 260,35 T 390,52 L 500,60 L 500,70 L 0,70 Z"
                      fill="url(#visualboardBlueWave)"
                    />
                    <path
                      d="M 0,45 Q 60,30 130,48 T 260,35 T 390,52 L 500,60"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* 3. TOP SELLING PRODUCTS TABLE CARD (HARMONIZED BLUE ACCENTS) */}
              <div className="bg-white rounded-[32px] p-6 border border-blue-50 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Top selling products (Produk Segar Terlaris JAM)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Barangan subsidi yang paling kerap ditebus oleh ahli menggunakan mata kad.
                    </p>
                  </div>
                  <button className="text-slate-400 hover:text-blue-600 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">
                          <input type="checkbox" className="rounded-sm accent-blue-600" /> PRODUCTS
                        </th>
                        <th className="py-2.5 px-3">STOCKS</th>
                        <th className="py-2.5 px-3">PRICE</th>
                        <th className="py-2.5 px-3">SALES</th>
                        <th className="py-2.5 px-3 text-right">EARNINGS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {PRODUCT_ROWS.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" className="rounded-sm accent-blue-600" />
                              <div className="w-10 h-10 rounded-xl bg-slate-100 p-1 shrink-0 border border-slate-200/60 overflow-hidden">
                                <img
                                  src={row.image}
                                  alt={row.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block">
                                  {row.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {row.sub}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            {row.stocks}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {row.price}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            {row.sales}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="font-mono font-black text-slate-900">
                                {row.earnings}
                              </span>
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-md">
                                {row.growth}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN (TOP CATEGORIES GAUGE & UPCOMING EVENTS)    */}
            {/* ======================================================== */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* 1. TOP CATEGORIES DONUT / GAUGE CARD (BLUE / EMERALD / AMBER) */}
              <div className="bg-white rounded-[32px] p-6 border border-blue-50 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Top categories
                  </h3>
                  <button className="text-slate-400 hover:text-blue-600 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Semi-Circle Gauge Arc with Royal Blue, Emerald Green, and Amber Gold */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative w-48 h-28 flex items-end justify-center">
                    <svg viewBox="0 0 200 115" className="w-full h-full">
                      {/* Segment 1: Ayam & Daging (Royal Blue #2563eb - 80%) */}
                      <path
                        d="M 25 105 A 75 75 0 0 1 145 35"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                      {/* Segment 2: Sayur-Sayuran (Emerald Green #10b981 - 24%) */}
                      <path
                        d="M 148 37 A 75 75 0 0 1 172 75"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                      {/* Segment 3: Buah & Telur (Amber Gold #f59e0b - 16%) */}
                      <path
                        d="M 174 79 A 75 75 0 0 1 175 105"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Gauge Center Text */}
                    <div className="absolute bottom-1 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                        TOTAL SALES
                      </span>
                      <span className="text-2xl font-black font-mono text-slate-900 tracking-tight leading-none">
                        24,329,7
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Legends with matching color dots */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                      <span className="font-bold text-slate-700">Ayam & Daging</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">80,02%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                      <span className="font-bold text-slate-700">Sayur-Sayuran</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">24,53%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                      <span className="font-bold text-slate-700">Buah & Telur</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">16,47%</span>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setIsClaimsModalOpen(true)}
                  className="w-full border border-blue-200/80 hover:bg-blue-50 text-blue-800 text-xs font-bold py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>View details</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>

              {/* 2. NEXT UPCOMING EVENT (POINTS EXPIRY COUNTDOWN CARD IN BLUE THEME) */}
              <div className="bg-white rounded-[32px] p-6 border border-blue-50 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Next Upcoming Event
                  </h3>
                  <button className="text-slate-400 hover:text-blue-600 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Illustration with Blue & Amber Expiry Timer Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-2xl p-4 border border-blue-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                      Had Masa Luput Mata
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">
                      08 Nov 2026, 18:00
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Baki mata tamat tempoh automatik
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Clock className="w-5 h-5 text-amber-300" />
                  </div>
                </div>

                {/* Event list items matching reference layout */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200 overflow-hidden">
                      <img
                        src="/ayam_segar.png"
                        alt="Event"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-black text-slate-900 truncate">
                        Pasar Tani Mega Putrajaya
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        08 November 2026 | 18:00 (Ahad)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200 overflow-hidden">
                      <img
                        src="/buah_tempatan.png"
                        alt="Event"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-black text-slate-900 truncate">
                        Jualan Agro MADANI Selayang
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        15 November 2026 | 18:00 (Ahad)
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Event Calendar Button */}
                <button
                  onClick={() => setIsExpiryModalOpen(true)}
                  className="w-full border border-blue-200/80 hover:bg-blue-50 text-blue-800 text-xs font-bold py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>View event calendar</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* 🌟 MODALS FOR SYSTEM INTERACTION (HARMONIZED COLOR SCHEME) */}
      {/* ======================================================== */}

      {/* 1. MODAL: AGIH SUBSIDI MATA */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Agih Mata Subsidi Kepada Ahli
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    1 Mata = 1 Sen • Tetapkan had masa luput
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {grantSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{grantSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleGrant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sasaran Penerima:
                </label>
                <select
                  value={grantTarget}
                  onChange={(e) => setGrantTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Ahli Berdaftar ({members.length} Orang)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.cardId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nilai Subsidi (RM):
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amountRM}
                    onChange={(e) => setAmountRM(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tarikh Luput Mata:
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Kempen:
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px]">Jumlah Diagihkan:</span>
                  <p className="font-mono font-black text-blue-900 text-sm">
                    {totalPointsToDistribute.toLocaleString()} Mata (RM {totalRMToDistribute.toFixed(2)})
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  {totalTargetCount} Penerima
                </span>
              </div>

              <button
                type="submit"
                className="w-full btn-gradient-blue text-white font-black text-xs py-3 rounded-2xl transition cursor-pointer shadow-md"
              >
                Sahkan & Agihkan Mata Subsidi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: PENGURUSAN HAD TEMPOH (EXPIRY MANAGEMENT) */}
      {isExpiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Pengurusan Had Tempoh Mata Kad (Expiry Management)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kawal tarikh luput mata subsidi dan pulangkan baki yang tidak digunakan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpiryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {expirySuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{expirySuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-3.5 rounded-2xl">
              <div>
                <p className="text-xs font-black text-rose-900">
                  Lupuskan Semua Mata Melepasi Had Masa
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Baki mata yang tidak dibelanjakan akan dipulangkan semula ke peruntukan utama JAM.
                </p>
              </div>
              <button
                onClick={handleExpireAll}
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs shrink-0"
              >
                Lupuskan Sekarang
              </button>
            </div>

            {/* Quick Extension Batch */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Lanjut Tarikh Pukal:</span>
              <input
                type="text"
                value={customExtendDate}
                onChange={(e) => setCustomExtendDate(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleApplyExtension('ALL')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1 rounded-lg cursor-pointer transition"
              >
                Kemas Kini Semua
              </button>
            </div>

            {/* Members table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Ahli</th>
                    <th className="py-2.5 px-3">Baki Mata</th>
                    <th className="py-2.5 px-3">Tarikh Luput</th>
                    <th className="py-2.5 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-blue-50/30">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.cardId}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {m.points.toLocaleString()} Mata (RM {(m.points / 100).toFixed(2)})
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {m.pointsExpiryDate || 'Tiada had'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApplyExtension(m.id)}
                            className="bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition"
                          >
                            + Lanjut
                          </button>
                          {m.points > 0 && (
                            <button
                              onClick={() => handleExpireSingle(m.id, m.name)}
                              className="bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition"
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
        </div>
      )}

      {/* 3. MODAL: TUNTUTAN GERAI (CLAIMS) */}
      {isClaimsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Tuntutan Bayaran Balik Peniaga Gerai
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Semak permohonan bayaran balik tunai bagi mata yang ditebus oleh ahli di gerai.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClaimsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {claims.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tiada permohonan tuntutan daripada peniaga setakat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">No. Tuntutan</th>
                      <th className="py-2.5 px-3">Peniaga & Gerai</th>
                      <th className="py-2.5 px-3">Jumlah (RM)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {claims.map((clm) => (
                      <tr key={clm.id} className="hover:bg-blue-50/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {clm.id}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{clm.sellerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Gerai: {clm.stallNumber}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-slate-900">
                          RM {clm.amountRM.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              clm.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {clm.status === 'PAID' ? 'SELESAI DIBAYAR' : 'MENUNGGU KELULUSAN'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {clm.status !== 'PAID' ? (
                            <button
                              onClick={() => onApproveClaim(clm.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition cursor-pointer shadow-xs"
                            >
                              Luluskan
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[10px] flex items-center justify-end gap-1">
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
        </div>
      )}

    </div>
  );
};
