import React, { useState } from 'react';
import { Member, Seller, Transaction, ReimbursementClaim, EventLocation } from '../types';
import confetti from 'canvas-confetti';
import { analyzeClaimAudit } from '../utils/auditUtils';
import {
  ChickenProduceIcon,
  EggCrateIcon,
  PineappleMelonIcon,
  KampungVegIcon,
  RicePaddyIcon,
  FreshFishIcon,
  PasarStallIcon,
  ItemProduceIcon,
  QuotaMeterIcon,
  EventTentPinIcon,
  AutoExpiryHourglassIcon,
} from './AgroIcons';
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
  TrendingDown,
  Receipt,
  FileText,
  Eye,
  ShieldAlert,
  AlertOctagon,
  X,
  CreditCard
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
  onRejectClaim?: (claimId: string, reason: string) => void;
  onExpireUnusedPoints: (memberId?: string) => number;
  onUpdateExpiryDate: (memberId: string | 'ALL', newDate: string) => void;
  onSwitchView?: (view: 'SPLIT' | 'BUYER' | 'SELLER' | 'OWNER') => void;
  onResetData?: () => void;
  events?: EventLocation[];
  onToggleEventStatus?: (eventId: string) => void;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  members,
  sellers,
  transactions,
  claims,
  onGrantPoints,
  onApproveClaim,
  onRejectClaim,
  onExpireUnusedPoints,
  onUpdateExpiryDate,
  onSwitchView,
  onResetData,
  events = [],
  onToggleEventStatus,
}) => {
  // Active Navigation in Visualboard Left Sidebar
  const [activeNav, setActiveNav] = useState<
    'DASHBOARD' | 'ORDERS' | 'PRODUCTS' | 'ANALYTICS' | 'MESSAGES' | 'SUPPORT' | 'SETTINGS'
  >('DASHBOARD');

  // Form states for Grant Points Modal / Panel
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [isClaimsModalOpen, setIsClaimsModalOpen] = useState(false);
  
  // Selected claim for receipt & anti-fraud audit inspection modal
  const [selectedClaimForAudit, setSelectedClaimForAudit] = useState<ReimbursementClaim | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('');
  const [isRejectBoxOpen, setIsRejectBoxOpen] = useState<boolean>(false);
  const [claimFilter, setClaimFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('ALL');
  const [claimAuditSuccessMsg, setClaimAuditSuccessMsg] = useState<string>('');

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

  // Products Table Data matching reference layout with JAM fresh produce (Bespoke Icons)
  const PRODUCT_ROWS = [
    {
      id: '1',
      name: 'Ayam Segar Bismi',
      sub: 'Zon Unggas & Daging • Gerai Pak Ali',
      iconType: 'CHICKEN',
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
      iconType: 'EGGS',
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
      iconType: 'FRUITS',
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
      iconType: 'VEG',
      stocks: '19,498 ikat',
      price: 'RM 5.00',
      sales: '6,392',
      earnings: 'RM 31,960.00',
      growth: '+8.32%',
    },
    {
      id: '5',
      name: 'Beras Putih MADANI (5kg)',
      sub: 'Zon Keperluan Asas • Gerai Haji Ramli',
      iconType: 'RICE',
      stocks: '5,000 beg',
      price: 'RM 13.00',
      sales: '3,110',
      earnings: 'RM 40,430.00',
      growth: '+12.4%',
    },
    {
      id: '6',
      name: 'Ikan Kembung Segar Laut',
      sub: 'Zon Ikan & Hasil Laut • Nelayan MADANI',
      iconType: 'FISH',
      stocks: '3,200 kg',
      price: 'RM 9.00',
      sales: '2,840',
      earnings: 'RM 25,560.00',
      growth: '+9.15%',
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

                    {/* Floating bespoke produce badges (NO AI IMAGES) */}
                    <div className="absolute top-0 right-2 w-12 h-12 rounded-2xl bg-white/95 p-1.5 shadow-lg border border-white flex items-center justify-center">
                      <ChickenProduceIcon className="w-9 h-9 drop-shadow-xs" />
                    </div>

                    <div className="absolute bottom-1 left-2 w-12 h-12 rounded-2xl bg-white/95 p-1.5 shadow-lg border border-white flex items-center justify-center">
                      <PineappleMelonIcon className="w-9 h-9 drop-shadow-xs" />
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
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-50 to-emerald-50/60 p-1 shrink-0 border border-slate-200/60 flex items-center justify-center">
                                <ItemProduceIcon
                                  type={row.iconType}
                                  className="w-8 h-8 drop-shadow-2xs"
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

                {/* Event list items from events state */}
                <div className="space-y-3 pt-1">
                  {events.length > 0 ? (
                    events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-2.5 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                              evt.status === 'ACTIVE'
                                ? 'bg-emerald-600'
                                : evt.status === 'ENDED'
                                ? 'bg-rose-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-black text-slate-900 truncate">
                              {evt.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 font-mono truncate">
                              {evt.dateStr} • {evt.startTime} - {evt.endTime}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                              <span
                                className={`font-mono font-bold ${
                                  evt.claimedCount >= evt.totalQuota
                                    ? 'text-rose-600 font-black'
                                    : 'text-slate-600'
                                }`}
                              >
                                Kuota: {evt.claimedCount}/{evt.totalQuota}
                              </span>
                              {evt.claimedCount >= evt.totalQuota && (
                                <span className="bg-rose-100 text-rose-800 font-black px-1.5 py-0.2 rounded text-[8px] uppercase">
                                  Habis (Penuh)
                                </span>
                              )}
                              {evt.totalQuota - evt.claimedCount > 0 && evt.status === 'ACTIVE' && (
                                <span className="text-emerald-700 font-semibold">
                                  (Baki: {evt.totalQuota - evt.claimedCount})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              evt.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : evt.status === 'ENDED'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {evt.status === 'ACTIVE'
                              ? 'Aktif'
                              : evt.status === 'ENDED'
                              ? 'Tamat'
                              : 'Akan Datang'}
                          </span>

                          {onToggleEventStatus && (
                            <button
                              type="button"
                              onClick={() => onToggleEventStatus(evt.id)}
                              className={`text-[9px] font-extrabold px-2 py-1 rounded-lg transition cursor-pointer ${
                                evt.status === 'ACTIVE'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {evt.status === 'ACTIVE' ? 'Tamatkan' : 'Aktifkan'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-2">
                      Tiada lokasi acara direkodkan.
                    </div>
                  )}
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

      {/* ======================================================== */}
      {/* 3. MODAL: PENGURUSAN TUNTUTAN GERAI (CLAIMS AUDIT TABLE)  */}
      {/* ======================================================== */}
      {isClaimsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[88vh] overflow-y-auto">
            
            {/* Modal Header with Count & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Pengesahan & Audit Tuntutan Subsidi Peniaga
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Semak padanan lejar digital, lampiran resit, dan pengesanan pertindihan MyKad/Telefon.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setIsClaimsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setClaimFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    claimFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Semua ({claims.length})
                </button>
                <button
                  onClick={() => setClaimFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                    claimFilter === 'PENDING' ? 'bg-white text-amber-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>Menunggu Kelulusan</span>
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono text-[9px] flex items-center justify-center">
                    {claims.filter((c) => c.status === 'PENDING').length}
                  </span>
                </button>
                <button
                  onClick={() => setClaimFilter('PAID')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    claimFilter === 'PAID' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Diluluskan ({claims.filter((c) => c.status === 'PAID').length})
                </button>
                <button
                  onClick={() => setClaimFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    claimFilter === 'REJECTED' ? 'bg-white text-rose-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Ditolak ({claims.filter((c) => c.status === 'REJECTED').length})
                </button>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-medium">Baki Tertunggak Kelulusan:</span>
                <span className="text-sm font-black font-mono text-blue-900">
                  RM {claims.filter(c => c.status === 'PENDING').reduce((acc, c) => acc + c.amountRM, 0).toFixed(2)}
                </span>
              </div>
            </div>

            {claimAuditSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{claimAuditSuccessMsg}</span>
              </div>
            )}

            {/* Claims Table */}
            {claims.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tiada permohonan tuntutan daripada peniaga setakat ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">No. Tuntutan</th>
                      <th className="py-2.5 px-3">Peniaga & Gerai</th>
                      <th className="py-2.5 px-3">Jumlah (RM)</th>
                      <th className="py-2.5 px-3">Lampiran Resit</th>
                      <th className="py-2.5 px-3">Status Integriti & Audit</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {claims
                      .filter((clm) => {
                        if (claimFilter === 'ALL') return true;
                        return clm.status === claimFilter;
                      })
                      .map((clm) => {
                        const audit = analyzeClaimAudit(clm, transactions, members);
                        return (
                          <tr key={clm.id} className="hover:bg-blue-50/30 transition">
                            <td className="py-3 px-3 font-mono font-bold text-slate-800">
                              {clm.id}
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-extrabold text-slate-900 block leading-tight">
                                {clm.sellerName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Gerai: {clm.stallNumber}
                              </span>
                            </td>

                            <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                              RM {clm.amountRM.toFixed(2)}
                            </td>

                            {/* Lampiran Resit */}
                            <td className="py-3 px-3">
                              {clm.receiptUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedClaimForAudit(clm)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[11px] font-bold cursor-pointer transition shadow-2xs"
                                >
                                  <div className="w-5 h-5 rounded-md overflow-hidden bg-white border border-slate-200 shrink-0">
                                    <img src={clm.receiptUrl} alt="Resit" className="w-full h-full object-cover" />
                                  </div>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Lihat</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
                                  <AlertTriangle className="w-3 h-3" /> Tiada Resit
                                </span>
                              )}
                            </td>

                            {/* Semakan Integriti & Audit */}
                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                {audit.isTally ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    <Check className="w-2.5 h-2.5" /> 100% Sepadan (Tally)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                                    <AlertOctagon className="w-2.5 h-2.5" /> Tidak Sepadan!
                                  </span>
                                )}

                                {audit.hasDuplicatePhone && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full block w-fit">
                                    <AlertTriangle className="w-2.5 h-2.5" /> No. Telefon Berkongsi
                                  </span>
                                )}

                                {audit.hasDuplicateIc && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full block w-fit">
                                    <ShieldAlert className="w-2.5 h-2.5" /> MyKad Berulang!
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3">
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                  clm.status === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : clm.status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {clm.status === 'PAID'
                                  ? 'SELESAI DIBAYAR'
                                  : clm.status === 'REJECTED'
                                  ? 'DITOLAK'
                                  : 'MENUNGGU KELULUSAN'}
                              </span>
                            </td>

                            {/* Tindakan */}
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setSelectedClaimForAudit(clm)}
                                className="btn-gradient-blue text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Semak & Lulus</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. LIGHTBOX: MODAL SEMAKAN AUDIT INTEGRITI & RESIT       */}
      {/* ======================================================== */}
      {selectedClaimForAudit && (() => {
        const audit = analyzeClaimAudit(selectedClaimForAudit, transactions, members);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-[36px] w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        Audit Integriti & Semakan Resit Tuntutan: {selectedClaimForAudit.id}
                      </h3>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          selectedClaimForAudit.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedClaimForAudit.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedClaimForAudit.status === 'PAID'
                          ? 'DILULUSKAN'
                          : selectedClaimForAudit.status === 'REJECTED'
                          ? 'DITOLAK'
                          : 'MENUNGGU KELULUSAN'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Peniaga: <strong>{selectedClaimForAudit.sellerName}</strong> • Gerai No: <strong>{selectedClaimForAudit.stallNumber}</strong> • Tarikh: {selectedClaimForAudit.timestamp}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedClaimForAudit(null);
                    setIsRejectBoxOpen(false);
                    setRejectReasonInput('');
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 2-Column Split: Left is Receipt Preview, Right is Audit Ledger Engine */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* 1. LEFT COLUMN: ATTACHED RECEIPT PREVIEW (5 Cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>Dokumen Resit Lampiran Peniaga</span>
                    </h4>
                    {selectedClaimForAudit.receiptUrl && (
                      <a
                        href={selectedClaimForAudit.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Imej Penuh</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {selectedClaimForAudit.receiptUrl ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden shadow-xs">
                      <img
                        src={selectedClaimForAudit.receiptUrl}
                        alt="Resit Tuntutan"
                        className="w-full h-auto max-h-[460px] object-contain rounded-xl bg-white border border-slate-200"
                      />
                      <div className="mt-2 px-1 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                        <span>{selectedClaimForAudit.receiptName || 'resit_tuntutan.png'}</span>
                        <span className="text-emerald-700 font-bold">Terlampir ✅</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 p-8 text-center space-y-2">
                      <AlertOctagon className="w-8 h-8 text-rose-500 mx-auto" />
                      <p className="text-xs font-black text-rose-900">
                        Tiada Lampiran Resit Dijumpai!
                      </p>
                      <p className="text-[10px] text-rose-700">
                        Peniaga tidak melampirkan bukti resit jualan atau penyata rasmi. Tuntutan ini berisiko tinggi.
                      </p>
                    </div>
                  )}

                  {/* Bank Details Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Akaun Bank Pembayaran Tunai:
                    </span>
                    <p className="font-extrabold text-slate-900">
                      {selectedClaimForAudit.bankName || 'Maybank'} • <span className="font-mono">{selectedClaimForAudit.bankAccountNumber || '5142 8829 1042'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Penerima: {selectedClaimForAudit.accountHolderName || selectedClaimForAudit.sellerName}
                    </p>
                  </div>
                </div>

                {/* 2. RIGHT COLUMN: DIGITAL RECONCILIATION & ANTI-FRAUD ENGINE (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* TALLY & RISK SCORECARD */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Jumlah Tuntutan Peniaga:
                      </span>
                      <p className="text-2xl font-black font-mono text-blue-900 mt-0.5">
                        RM {selectedClaimForAudit.amountRM.toFixed(2)}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Lejar Sebenar: RM {audit.calculatedSumRM.toFixed(2)}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-2xl border ${
                      audit.riskScore === 'LOW'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : audit.riskScore === 'MEDIUM'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-rose-50/80 border-rose-200 text-rose-950'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                        Penarafan Risiko Audit:
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {audit.riskScore === 'LOW' ? (
                          <span className="text-lg font-black text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> RENDAH (SAH)
                          </span>
                        ) : audit.riskScore === 'MEDIUM' ? (
                          <span className="text-lg font-black text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-5 h-5 text-amber-600" /> PERLU SEMAKAN
                          </span>
                        ) : (
                          <span className="text-lg font-black text-rose-800 flex items-center gap-1">
                            <ShieldAlert className="w-5 h-5 text-rose-600" /> TINGGI (BERISIKO)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] opacity-80 block mt-0.5">
                        {audit.isTally ? 'Padanan Lejar Tally 100% ✅' : 'Ralat Padanan Lejar ❌'}
                      </span>
                    </div>
                  </div>

                  {/* FRAUD DETECTION AUDIT BAR */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Semakan Anti-Ketirisan & Identiti Pengguna</span>
                    </h5>

                    <div className="space-y-1.5 pt-1">
                      {/* Check 1: MyKad Uniqueness */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-700">Semakan Pertindihan MyKad (IC):</span>
                        {!audit.hasDuplicateIc ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Semua MyKad Unik ({audit.uniqueBuyersCount}/{audit.totalTransactionsCount} Ahli)
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3 text-rose-600" /> Pertindihan MyKad Dikesan!
                          </span>
                        )}
                      </div>

                      {/* Check 2: Phone Number Uniqueness */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-700">Semakan Nombor Telefon Ahli:</span>
                        {!audit.hasDuplicatePhone ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Tiada Pertindihan Telefon
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> No. Telefon Sama (Keluarga / Proksi)
                          </span>
                        )}
                      </div>

                      {/* Check 3: Digital Ledger Tally Check */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                        <span className="font-bold text-slate-700">Padanan Nilai Lejar Digital:</span>
                        {audit.isTally ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> 100% Sepadan (Tally RM {selectedClaimForAudit.amountRM.toFixed(2)})
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3 text-rose-600" /> Tidak Sepadan (Beza: RM {(selectedClaimForAudit.amountRM - audit.calculatedSumRM).toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ITEMISED TRANSACTIONS THAT FORM THIS CLAIM */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-slate-900 text-xs">
                        Senarai Belian Pengguna Berkaitan ({audit.transactions.length} transaksi)
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        Penebusan QR sah di gerai
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white">
                      {audit.transactions.map((tx) => (
                        <div key={tx.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400 font-bold">{tx.id}</span>
                              <span className="font-extrabold text-slate-900">{tx.memberName}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              MyKad: <span className="font-mono text-slate-600">{tx.memberIc || '850412-10-****'}</span> • Tel: <span className="font-mono text-slate-600">{tx.memberPhone || '012-384****'}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {tx.timestamp} • {tx.note}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black font-mono text-slate-900 block text-xs">
                              RM {tx.amountRM.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-emerald-600 font-bold font-mono">
                              ({tx.amountPoints} Mata)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REJECTION REASON BOX (WHEN REJECT IS TOGGLED) */}
                  {isRejectBoxOpen && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                      <label className="block text-[11px] font-bold text-rose-900">
                        Sebab Penolakan Tuntutan:
                      </label>
                      <input
                        type="text"
                        value={rejectReasonInput}
                        onChange={(e) => setRejectReasonInput(e.target.value)}
                        placeholder="Contoh: Resit jualan kabur / Jumlah tidak tally dengan belian"
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setIsRejectBoxOpen(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => {
                            if (onRejectClaim) {
                              onRejectClaim(selectedClaimForAudit.id, rejectReasonInput);
                            }
                            setSelectedClaimForAudit(null);
                            setIsRejectBoxOpen(false);
                            setRejectReasonInput('');
                            setClaimAuditSuccessMsg(`Tuntutan ${selectedClaimForAudit.id} telah ditolak dengan catatan audit.`);
                            setTimeout(() => setClaimAuditSuccessMsg(''), 5000);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer shadow-xs"
                        >
                          Sahkan Penolakan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTION BAR: APPROVE OR REJECT */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {selectedClaimForAudit.status === 'PAID' ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl w-full flex items-center gap-2 text-xs font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p>Tuntutan ini telah disahkan & diluluskan bayaran pada {selectedClaimForAudit.approvedAt || 'hari ini'}.</p>
                          <p className="text-[10px] text-emerald-700 font-normal">Pegawai Pelulus: {selectedClaimForAudit.approvedBy || 'Urusetia Pusat JAM'}</p>
                        </div>
                      </div>
                    ) : selectedClaimForAudit.status === 'REJECTED' ? (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl w-full flex items-center gap-2 text-xs font-bold">
                        <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                          <p>Tuntutan ini telah ditolak oleh penganjur.</p>
                          <p className="text-[10px] text-rose-700 font-normal">Sebab: {selectedClaimForAudit.rejectionReason || 'Maklumat tidak sah'}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsRejectBoxOpen(true)}
                            className="px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs transition cursor-pointer"
                          >
                            Tolak Tuntutan
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onApproveClaim(selectedClaimForAudit.id);
                              confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
                              setSelectedClaimForAudit(null);
                              setClaimAuditSuccessMsg(`Tuntutan ${selectedClaimForAudit.id} berjaya diluluskan untuk bayaran balik tunai sebanyak RM ${selectedClaimForAudit.amountRM.toFixed(2)}!`);
                              setTimeout(() => setClaimAuditSuccessMsg(''), 5000);
                            }}
                            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Luluskan & Sahkan Pembayaran</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
