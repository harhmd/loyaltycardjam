import React, { useState } from 'react';
import { Member, Seller, Transaction, ProductItem, EventLocation } from '../types';
import { INITIAL_PRODUCTS, playCashierChime } from '../store';
import { CameraQrScanner } from './CameraQrScanner';
import { MyDigitalIdAuthModal } from './MyDigitalIdAuthModal';
import { ClaimPointsModal } from './ClaimPointsModal';
import {
  ChickenProduceIcon,
  EggCrateIcon,
  PineappleMelonIcon,
  KampungVegIcon,
  RicePaddyIcon,
  FreshFishIcon,
  PasarStallIcon,
  ItemProduceIcon,
  EventTentPinIcon,
  AutoExpiryHourglassIcon,
  NfcContactlessIcon,
} from './AgroIcons';
import { NfcReaderModal, NfcModalMode } from './NfcReaderModal';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Scan,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Store,
  CheckCircle2,
  AlertCircle,
  Coins,
  ChevronRight,
  ShieldCheck,
  Search,
  Grid,
  Heart,
  Home,
  ShoppingBag,
  ChevronLeft,
  Sparkles,
  Clock,
  AlertTriangle,
  Gift,
  MapPin,
  Lock,
  UserCheck,
  RefreshCw,
  LogOut,
  Maximize2,
  X
} from 'lucide-react';

interface BuyerPortalProps {
  currentMember: Member;
  allMembers: Member[];
  onSelectMember: (memberId: string) => void;
  sellers: Seller[];
  products?: ProductItem[];
  onMakePayment: (
    memberId: string,
    sellerId: string,
    amountRM: number,
    note: string
  ) => { success: boolean; message?: string; transaction?: Transaction };
  transactions: Transaction[];
  events?: EventLocation[];
  onClaimEventPoints?: (
    eventId: string,
    event: EventLocation
  ) => { success: boolean; message: string };
  onAuthenticateMyDigitalId?: (userData: {
    nama: string;
    nric: string;
    phone: string;
    memberId?: string;
  }) => void;
  onLogoutMyDigitalId?: () => void;
  onToggleEventStatus?: (eventId: string) => void;
}

export const BuyerPortal: React.FC<BuyerPortalProps> = ({
  currentMember,
  allMembers,
  onSelectMember,
  sellers,
  products = INITIAL_PRODUCTS,
  onMakePayment,
  transactions,
  events = [],
  onClaimEventPoints,
  onAuthenticateMyDigitalId,
  onLogoutMyDigitalId,
  onToggleEventStatus,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [cameraScanSuccessMsg, setCameraScanSuccessMsg] = useState<string>('');
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [amountRM, setAmountRM] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [lastReceipt, setLastReceipt] = useState<Transaction | null>(null);
  const [activeNav, setActiveNav] = useState<'HOME' | 'SCAN' | 'HISTORY'>('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modals for MyDigital ID, Claim Points, and Fullscreen QR
  const [isMyIdModalOpen, setIsMyIdModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isBuyerQrModalOpen, setIsBuyerQrModalOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [nfcMode, setNfcMode] = useState<NfcModalMode>('BUYER_TAP_MERCHANT');

  const parsedAmountRM = parseFloat(amountRM) || 0;
  const pointsNeeded = Math.round(parsedAmountRM * 100);

  // Active event lookup
  const activeEvent =
    events.find((e) => e.id === currentMember.activeEventId) ||
    events.find((e) => e.status === 'ACTIVE') ||
    events[0];

  const isEventEnded =
    activeEvent?.status === 'ENDED' ||
    (currentMember.points === 0 && (currentMember.expiredPointsTotal || 0) > 0);

  const hasClaimed =
    (currentMember.claimedEvents && currentMember.claimedEvents.length > 0) ||
    currentMember.points > 0;

  const isMyIdVerified = currentMember.isMyDigitalIdVerified ?? false;

  const canAfford =
    isMyIdVerified &&
    !isEventEnded &&
    currentMember.points >= pointsNeeded &&
    pointsNeeded > 0;

  const [historyFilter, setHistoryFilter] = useState<
    'ALL' | 'PAYMENT' | 'OWNER_GRANT' | 'EXPIRY'
  >('ALL');

  const memberTransactions = transactions.filter(
    (t) => t.memberId === currentMember.id
  );

  const filteredMemberTransactions = memberTransactions.filter((tx) => {
    if (historyFilter === 'ALL') return true;
    return tx.type === historyFilter;
  });

  const categories = ['Semua', 'Ayam Segar', 'Telur Ayam', 'Buah Tempatan', 'Sayur Kampung'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredSellers = sellers.filter((s) => {
    const matchesSearch =
      s.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stallNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle live camera QR detection
  const handleCameraQrSuccess = (decodedText: string) => {
    const matched = sellers.find(
      (s) =>
        decodedText.includes(s.id) ||
        decodedText.includes(s.stallNumber) ||
        s.qrPayload === decodedText
    );

    if (matched) {
      setSelectedSellerId(matched.id);
      setCameraScanSuccessMsg(
        `Kod QR Dikesan: Gerai ${matched.stallNumber} - ${matched.businessName}`
      );
      setPaymentError('');
      playCashierChime();
      setScannerMode('MANUAL');
    } else {
      setPaymentError(`Kod QR diimbas ("${decodedText}") tidak sah di bawah sistem rasmi JAM.`);
    }
  };

  // One-click quick redeem from product card
  const handleSelectProduct = (product: ProductItem) => {
    if (!isMyIdVerified) {
      setIsMyIdModalOpen(true);
      return;
    }
    if (!hasClaimed) {
      setIsClaimModalOpen(true);
      return;
    }
    if (isEventEnded) {
      setPaymentError(
        'Acara di lokasi ini telah tamat. Mata subsidi telah luput secara automatik.'
      );
      return;
    }
    setSelectedSellerId(product.sellerId);
    setAmountRM(product.priceRM.toFixed(2));
    setNote(`Tebus: ${product.name}`);
    setPaymentError('');
    setCameraScanSuccessMsg(`Barangan Dipilih: ${product.name}`);
    setScannerMode('MANUAL');
    setIsScannerOpen(true);
  };

  const handleQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!isMyIdVerified) {
      setPaymentError('Sila log masuk menggunakan MyDigital ID terlebih dahulu.');
      setIsMyIdModalOpen(true);
      return;
    }

    if (isEventEnded) {
      setPaymentError(
        'Mata ganjaran telah tamat tempoh seiring dengan berakhirnya acara di lokasi ini dan tidak sah digunakan lagi.'
      );
      return;
    }

    if (!hasClaimed || currentMember.points <= 0) {
      setPaymentError(
        'Anda belum menuntut mata subsidi untuk acara ini. Sila tekan "Tuntut Mata Subsidi".'
      );
      setIsClaimModalOpen(true);
      return;
    }

    if (!selectedSellerId) {
      setPaymentError('Sila pilih gerai peniaga yang ingin diimbas.');
      return;
    }

    if (parsedAmountRM <= 0) {
      setPaymentError('Sila masukkan nilai bayaran yang sah (minimum RM 0.10).');
      return;
    }

    if (!canAfford) {
      setPaymentError(
        `Baki mata tidak mencukupi. Anda ada ${currentMember.points.toLocaleString()} mata (RM ${(
          currentMember.points / 100
        ).toFixed(2)}), belian memerlukan ${pointsNeeded.toLocaleString()} mata.`
      );
      return;
    }

    const res = onMakePayment(
      currentMember.id,
      selectedSellerId,
      parsedAmountRM,
      note || `Belian di ${selectedSellerObj?.businessName || 'Gerai JAM'}`
    );

    if (res.success && res.transaction) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setLastReceipt(res.transaction);
      setIsScannerOpen(false);
      setAmountRM('');
      setNote('');
      setSelectedSellerId('');
    } else {
      setPaymentError(res.message || 'Ralat semasa memproses pembayaran.');
    }
  };

  const selectedSellerObj = sellers.find((s) => s.id === selectedSellerId);

  // Buyer QR Payload containing Member ID, IC, and Active Event
  const buyerQrPayload = `JAM-LOYALTY:${currentMember.id}:${currentMember.icNumber || ''}:${
    activeEvent?.id || 'EVENT-GENERAL'
  }`;

  return (
    <div className="max-w-[420px] mx-auto bg-[#f0f7ff] min-h-[760px] rounded-[44px] shadow-2xl border-4 border-white overflow-hidden flex flex-col relative select-none">
      
      {/* 1. TOP HEADER WITH ORGANIC BLUE-TO-GREEN GRADIENT WAVE */}
      <div className="relative pt-6 pb-12 px-6 theme-gradient-wave text-white rounded-b-[42px] shadow-lg overflow-hidden">
        {/* Soft radial glow overlays */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/30 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-400/30 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Navbar Row */}
        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-sm">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-blue-100 font-medium">Hello, Selamat Datang</p>
              <h2 className="text-sm font-extrabold text-white tracking-tight leading-tight">
                {currentMember.name.split(' ')[0]}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Member Switcher Avatar Pill */}
            <select
              value={currentMember.id}
              onChange={(e) => onSelectMember(e.target.value)}
              className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold rounded-2xl px-2.5 py-1.5 border border-white/30 focus:outline-none cursor-pointer"
            >
              {allMembers.map((m) => (
                <option key={m.id} value={m.id} className="text-slate-800">
                  {m.name.split(' ')[0]} ({m.cardId})
                </option>
              ))}
            </select>

            <div className="w-9 h-9 rounded-full bg-white p-1 shadow-sm border border-white flex items-center justify-center shrink-0">
              <img
                src="/logo-jam.png"
                alt="JAM"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* MyDigital ID SSO Status Banner in Header */}
        <div className="relative z-10 mb-3">
          {isMyIdVerified ? (
            <div className="bg-white/20 backdrop-blur-md border border-cyan-300/40 rounded-2xl px-3 py-2 flex items-center justify-between text-xs shadow-xs">
              <div className="flex items-center gap-2">
                {/* Official mini MyDigital ID badge */}
                <div className="bg-white px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 shadow-2xs">
                  <span className="text-[#002f6c] font-black text-[10px] leading-none">my</span>
                  <span className="text-[#004b99] font-black text-[10px] leading-none">digital</span>
                  <span className="bg-cyan-500 text-white font-black px-1 py-0.2 rounded text-[8px] leading-none">ID</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-cyan-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-300" /> Disahkan Kerajaan Malaysia
                  </p>
                  <p className="text-[9px] font-mono text-cyan-200">
                    MyKad: {currentMember.icNumber || '850412-10-5432'}
                  </p>
                </div>
              </div>

              {onLogoutMyDigitalId && (
                <button
                  onClick={onLogoutMyDigitalId}
                  className="text-[10px] text-cyan-200 hover:text-white underline font-semibold cursor-pointer shrink-0"
                >
                  Tukar / Keluar
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => setIsMyIdModalOpen(true)}
              className="bg-amber-400/25 hover:bg-amber-400/35 backdrop-blur-md border border-amber-300/60 rounded-2xl px-3 py-2 flex items-center justify-between text-xs cursor-pointer transition shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 animate-pulse">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-amber-100 leading-tight">
                    Log Masuk MyDigital ID Diperlukan
                  </p>
                  <p className="text-[9px] text-amber-200/90">
                    Klik untuk sahkan MyKad & tebus subsidi RM10
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-tight shadow-2xs">
                Log Masuk ➔
              </span>
            </div>
          )}
        </div>

        {/* Search Bar Pill */}
        <div className="relative z-10">
          <div className="flex items-center bg-white/95 rounded-full px-4 py-2 shadow-md shadow-blue-900/10 border border-white">
            <Search className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Cari ayam segar, telur gred A, nenas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. STUNNING LUXURY LOYALTY CARD BLENDED WITH JAM LOGO & FRESH PRODUCE ARTWORK */}
      <div className="-mt-8 px-4 relative z-20">
        <div
          className={`rounded-[36px] border-2 shadow-2xl relative overflow-hidden text-white transition-all duration-300 ${
            isEventEnded
              ? 'border-rose-400/80 bg-gradient-to-br from-slate-950 via-rose-950/80 to-slate-900'
              : 'border-amber-300/80 bg-gradient-to-br from-[#02182b] via-[#042845] to-[#044331] hover:shadow-emerald-900/30'
          }`}
        >
          {/* Authentic Vector Geometric Batik & Agro Lattice Watermark (NO AI IMAGES) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cardAgroPattern" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M18 0L36 18L18 36L0 18Z" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.4" />
                  <circle cx="18" cy="18" r="3" fill="#34d399" opacity="0.35" />
                  <circle cx="0" cy="0" r="1.5" fill="#60a5fa" opacity="0.4" />
                  <circle cx="36" cy="36" r="1.5" fill="#60a5fa" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cardAgroPattern)" />
            </svg>
          </div>
          <div className="absolute inset-0 card-gloss-shimmer pointer-events-none"></div>

          <div className="relative z-10 p-5 flex flex-col justify-between min-h-[250px]">
            {/* Top Row: Official JAM Logo Plaque + QR Code */}
            <div className="flex items-start justify-between gap-2">
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-white flex items-center gap-2.5">
                <img
                  src="/logo-jam.png"
                  alt="Jualan Agro MADANI"
                  className="h-8 w-auto object-contain"
                />
                <div className="border-l border-slate-200 pl-2 leading-none">
                  <span className="font-fancy-italic text-sm text-blue-950 font-bold block leading-none">
                    Loyalty Card
                  </span>
                  <span className="text-[8px] font-bold text-emerald-700 tracking-tight block mt-0.5">
                    JUALAN AGRO MADANI
                  </span>
                </div>
              </div>

              {/* Right: Contactless NFC Tap & QR Code Plaques */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* NFC Contactless Tap Plaque */}
                <div
                  onClick={() => {
                    setNfcMode('BUYER_TAP_MERCHANT');
                    setIsNfcModalOpen(true);
                  }}
                  title="Sentuh Kad NFC (Tap-to-Pay / Imbas Gerai)"
                  className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-emerald-400 shadow-lg cursor-pointer relative group transition hover:scale-105 flex items-center justify-center text-emerald-800"
                >
                  <NfcContactlessIcon className="w-8 h-8 drop-shadow-xs" />
                  <span className="absolute -bottom-1 -left-1 text-[7px] font-black bg-emerald-600 text-white px-1 py-0.2 rounded-full uppercase tracking-tighter shadow-2xs">
                    NFC
                  </span>
                </div>

                {/* QR Code Plaque with Golden Border - Clickable for Fullscreen QR */}
                <div
                  onClick={() => setIsBuyerQrModalOpen(true)}
                  title="Tekan untuk paparan QR penuh"
                  className={`bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border-2 shadow-lg shrink-0 cursor-pointer relative group transition hover:scale-105 ${
                    isEventEnded ? 'border-rose-400' : 'border-amber-300'
                  }`}
                >
                  <QRCodeSVG
                    value={buyerQrPayload}
                    size={38}
                    bgColor="transparent"
                    fgColor={isEventEnded ? '#991b1b' : '#0f172a'}
                  />
                  {isEventEnded && (
                    <div className="absolute inset-0 bg-rose-900/80 backdrop-blur-xs rounded-xl flex items-center justify-center text-white">
                      <Lock className="w-4 h-4 text-rose-300" />
                    </div>
                  )}
                  {!hasClaimed && !isEventEnded && (
                    <div className="absolute inset-0 bg-amber-900/80 backdrop-blur-xs rounded-xl flex items-center justify-center text-white">
                      <Gift className="w-4 h-4 text-amber-300 animate-bounce" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Maximize2 className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Smart Chip Motif + Balance */}
            <div className="my-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                {/* Gold EMV Chip Graphic */}
                <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-200 shadow-xs flex items-center justify-center p-0.5">
                  <div className="w-full h-full border border-amber-700/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-80">
                    <div className="border-r border-b border-amber-700/40"></div>
                    <div className="border-b border-amber-700/40"></div>
                    <div className="border-r border-amber-700/40"></div>
                    <div></div>
                  </div>
                </div>
                <span className="font-fancy-italic text-sm text-amber-300 drop-shadow-md tracking-wide">
                  Loyalty Card
                </span>
                <span className="text-[10px] text-slate-300 font-mono">• Baki Mata</span>
              </div>

              {/* Points & RM Display based on Claim & Event Status */}
              {isEventEnded ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-rose-300 tracking-tight drop-shadow-md">
                      0
                    </span>
                    <span className="text-xs font-black text-rose-400 uppercase tracking-widest drop-shadow">
                      Mata (Tamat Acara)
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-rose-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-rose-400/40 shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    <span className="text-[10px] text-rose-200 font-bold">
                      Mata subsidi telah luput secara automatik kerana acara telah tamat.
                    </span>
                  </div>
                </div>
              ) : !hasClaimed ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-slate-300 tracking-tight drop-shadow-md">
                      0
                    </span>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-widest drop-shadow">
                      Mata
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-amber-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 shadow-md">
                    <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-amber-200 font-bold">
                      Tekan "Tuntut Mata Subsidi" untuk menerima RM 10.00
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-md">
                      {currentMember.points.toLocaleString()}
                    </span>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-widest drop-shadow">
                      Mata
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-black/55 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-md">
                    <span className="text-[11px] text-slate-300 font-medium">Nilai Tebus:</span>
                    <span className="text-sm font-black text-emerald-300 font-mono">
                      RM {(currentMember.points / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-amber-300/90 font-mono">
                      (1 Mata = 1 Sen)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bespoke Agro Produce Category Vector Badges (NO AI IMAGES) */}
            <div className="flex items-center gap-1.5 flex-wrap my-1.5">
              <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/30 text-[9px] font-bold text-amber-200">
                <ChickenProduceIcon className="w-3.5 h-3.5" />
                <span>Ayam Segar</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/30 text-[9px] font-bold text-amber-200">
                <EggCrateIcon className="w-3.5 h-3.5" />
                <span>Telur Gred A</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/30 text-[9px] font-bold text-amber-200">
                <PineappleMelonIcon className="w-3.5 h-3.5" />
                <span>Buah MD2</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/30 text-[9px] font-bold text-amber-200">
                <KampungVegIcon className="w-3.5 h-3.5" />
                <span>Sayur Kampung</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/30 text-[9px] font-bold text-amber-200">
                <RicePaddyIcon className="w-3.5 h-3.5" />
                <span>Beras MADANI</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/30 text-[9px] font-bold text-amber-200">
                <FreshFishIcon className="w-3.5 h-3.5" />
                <span>Ikan Segar</span>
              </div>
            </div>

            {/* Approved Event Location Tag on Card */}
            <div className="flex items-center gap-1.5 flex-wrap my-1">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border shadow-xs ${
                  isEventEnded
                    ? 'bg-rose-950/70 border-rose-400/40 text-rose-200'
                    : 'bg-emerald-950/75 border-emerald-400/40 text-emerald-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-[10px] font-extrabold tracking-wide truncate max-w-[280px]">
                  {activeEvent?.name || currentMember.activeEventName || 'Lokasi: Belum Dituntut'}
                </span>
              </div>
            </div>

            {/* EXPIRY DATE BADGE ON CARD */}
            <div className="flex items-center justify-between text-[10px] mt-1 pt-1.5 border-t border-white/10">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-md border ${
                  isEventEnded
                    ? 'bg-rose-950/80 text-rose-300 border-rose-400/40'
                    : 'bg-black/60 text-amber-200 border-amber-300/40'
                }`}
              >
                <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="font-bold text-[9px] tracking-tight">
                  {isEventEnded
                    ? `Status: Acara Selesai (Mata Luput)`
                    : `Sah Sehingga Acara Selesai: ${
                        activeEvent?.endTime
                          ? `${activeEvent.endTime} Hari Ini`
                          : currentMember.pointsExpiryDate || '18:00'
                      }`}
                </span>
              </div>
              <span className="text-[9px] text-emerald-300 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Rasmi MADANI
              </span>
            </div>

            {/* Bottom Card Row: Member Name & Card ID */}
            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px]">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">
                  Nama Ahli MyDigital ID
                </p>
                <p className="font-extrabold text-white text-xs truncate max-w-[180px] drop-shadow-xs">
                  {currentMember.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">
                  No. Kad Ahli
                </p>
                <p className="font-mono font-black text-amber-300 tracking-wider">
                  {currentMember.cardId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN BODY CONTENT */}
      <div className="flex-1 px-5 pt-3 pb-24 overflow-y-auto space-y-4">
        
        {/* ACTION BUTTON BAR: Tuntut Mata / Imbas QR Gerai / Tunjuk QR Saya */}
        <div className="space-y-2">
          {!isMyIdVerified ? (
            /* Button 1: Authenticate via MyDigital ID */
            <button
              onClick={() => setIsMyIdModalOpen(true)}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-[#002f6c] via-[#004b99] to-[#0070ba] hover:from-[#002555] hover:to-[#005e9e] text-white rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-blue-900/25 active:scale-[0.98] transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <span>Log Masuk MyDigital ID (SSO)</span>
              <ChevronRight className="w-4 h-4 ml-auto text-cyan-200" />
            </button>
          ) : !hasClaimed ? (
            /* Button 2: Claim Points for Approved Event Location */
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition cursor-pointer animate-pulse"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span>Tuntut Mata Subsidi JAM (1,000 Mata)</span>
              <ChevronRight className="w-4 h-4 ml-auto text-amber-200" />
            </button>
          ) : (
            /* Button 3: Triple Action: Scan Stall QR, Tap Web NFC, or Show My QR */
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setPaymentError('');
                  setCameraScanSuccessMsg('');
                  setSelectedSellerId('');
                  setScannerMode('CAMERA');
                  setIsScannerOpen(true);
                }}
                disabled={isEventEnded}
                className={`py-3 px-2 rounded-full font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 shadow-md transition cursor-pointer ${
                  isEventEnded
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'btn-gradient-blue text-white shadow-blue-500/25 active:scale-[0.98]'
                }`}
              >
                <Scan className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Imbas QR</span>
              </button>

              <button
                onClick={() => {
                  setNfcMode('BUYER_TAP_MERCHANT');
                  setIsNfcModalOpen(true);
                }}
                disabled={isEventEnded}
                className={`py-3 px-2 rounded-full font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 shadow-md transition cursor-pointer ${
                  isEventEnded
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25 active:scale-[0.98]'
                }`}
              >
                <NfcContactlessIcon className="w-3.5 h-3.5 shrink-0 text-white" />
                <span className="truncate">Sentuh NFC</span>
              </button>

              <button
                onClick={() => setIsBuyerQrModalOpen(true)}
                className="py-3 px-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-blue-600/30 rounded-full font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Papar QR</span>
              </button>
            </div>
          )}

          {/* Quick Event Switcher & Simulator Pill */}
          <div className="glass-card bg-white/80 rounded-2xl p-2.5 border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isEventEnded
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
                  Lokasi Acara: {activeEvent?.name || 'JAM Malaysia'}
                </p>
                <p className="text-[11px] font-black text-slate-800 truncate">
                  {isEventEnded ? (
                    <span className="text-rose-600 font-bold">
                      Acara Telah Tamat (Mata Tidak Sah)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      Sedang Berlangsung ({activeEvent?.startTime} - {activeEvent?.endTime})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(true)}
                className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-xl transition cursor-pointer"
              >
                Tukar Lokasi
              </button>

              {onToggleEventStatus && activeEvent && (
                <button
                  type="button"
                  title="Klik untuk uji simulasi tamat masa acara secara langsung"
                  onClick={() => onToggleEventStatus(activeEvent.id)}
                  className={`text-[9px] font-black px-2 py-1 rounded-xl transition cursor-pointer ${
                    activeEvent.status === 'ACTIVE'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                  }`}
                >
                  {activeEvent.status === 'ACTIVE' ? 'Uji Tamat' : 'Aktifkan Semula'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Had Tempoh Mata Kad Status Banner */}
        {isEventEnded ? (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 flex items-start gap-2.5 shadow-sm text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-rose-900 leading-tight">
                Mata Telah Tamat Tempoh & Dilupuskan
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Acara di lokasi ini telah selesai. Mengikut peraturan rasmi Jualan Agro MADANI, sebarang baki mata yang tidak dibelanjakan akan dilupuskan secara automatik dan kod QR tidak lagi boleh digunakan.
              </p>
            </div>
          </div>
        ) : null}

        {activeNav === 'HISTORY' ? (
          /* FULL TRANSACTION HISTORY TAB VIEW */
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" /> Penyata Aktiviti & Sejarah Mata
                </h3>
                <p className="text-[10px] text-slate-500">
                  Semua rekod belian, subsidi, dan pelupusan had masa
                </p>
              </div>
              <button
                onClick={() => setActiveNav('HOME')}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Kembali ke Menu
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { key: 'ALL', label: 'Semua', count: memberTransactions.length },
                  { key: 'PAYMENT', label: 'Belian', count: memberTransactions.filter((t) => t.type === 'PAYMENT').length },
                  { key: 'OWNER_GRANT', label: 'Subsidi', count: memberTransactions.filter((t) => t.type === 'OWNER_GRANT').length },
                  { key: 'EXPIRY', label: 'Luput', count: memberTransactions.filter((t) => t.type === 'EXPIRY').length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setHistoryFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    historyFilter === tab.key
                      ? 'btn-gradient-blue text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                      historyFilter === tab.key
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Transaction List */}
            <div className="space-y-2">
              {filteredMemberTransactions.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
                  Tiada rekod transaksi untuk kategori ini.
                </div>
              ) : (
                filteredMemberTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => tx.type === 'PAYMENT' && setLastReceipt(tx)}
                    className="bg-white rounded-2xl p-3 border border-white shadow-xs flex items-center justify-between text-xs hover:border-blue-200 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'OWNER_GRANT'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : tx.type === 'EXPIRY'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}
                      >
                        {tx.type === 'OWNER_GRANT' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : tx.type === 'EXPIRY' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">
                          {tx.type === 'OWNER_GRANT'
                            ? 'Subsidi Penganjur JAM'
                            : tx.type === 'EXPIRY'
                            ? 'Mata Luput Had Masa'
                            : `${tx.sellerName} (${tx.stallNumber})`}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {tx.timestamp.split(' ')[0]} • {tx.note}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`font-black font-mono text-xs ${
                          tx.type === 'OWNER_GRANT'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'OWNER_GRANT' ? '+' : '-'}
                        {tx.amountPoints} Mata
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        (RM {tx.amountRM.toFixed(2)})
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* HOME TAB CONTENT */
          <>
            {/* Horizontal Category Frosted Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-2xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'btn-gradient-blue text-white shadow-sm'
                      : 'glass-pill text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 🌟 DEDICATED VISUAL CARDS: PRODUK SEGAR UTAMA */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <img
                      src="/logo-jam.png"
                      alt="JAM"
                      className="h-4 w-auto object-contain"
                    />
                    Barangan Segar Pilihan JAM
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Pilih barangan untuk tebus automatik guna mata JAM anda
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                  {filteredProducts.length} Produk
                </span>
              </div>

              <div className="space-y-3">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className="bg-white rounded-[26px] p-3.5 border border-white shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer relative flex items-center gap-3.5 group"
                  >
                    {/* Bespoke Vector Agro Item Icon Frame (NO AI IMAGES) */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-50 via-emerald-50/40 to-blue-50/50 border border-slate-200/80 flex items-center justify-center shrink-0 relative shadow-inner p-2 group-hover:scale-105 transition-transform duration-300">
                      <ItemProduceIcon
                        type={prod.iconType}
                        category={prod.category}
                        className="w-13 h-13 drop-shadow-xs"
                      />
                      <div className="absolute top-1 left-1">
                        <span className="text-[8px] font-black bg-emerald-700 text-white px-1.5 py-0.5 rounded-md shadow-2xs uppercase">
                          JAM
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          {prod.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1 line-clamp-1 leading-snug">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Gerai {prod.stallNumber} • {prod.sellerName.split(' ')[0]}
                      </p>

                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-sm font-black text-blue-600 font-mono">
                          {prod.pointsNeeded.toLocaleString()} Mata
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 font-mono">
                          (RM {prod.priceRM.toFixed(2)})
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          RM {prod.originalPriceRM.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Redeem CTA Pill */}
                    <div className="shrink-0 self-center">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full btn-gradient-blue text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gerai JAM Stalls List */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-blue-600" /> Gerai Peniaga Sedia Imbas ({filteredSellers.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredSellers.map((seller) => (
                  <div
                    key={seller.id}
                    onClick={() => {
                      if (!isMyIdVerified) {
                        setIsMyIdModalOpen(true);
                        return;
                      }
                      if (!hasClaimed) {
                        setIsClaimModalOpen(true);
                        return;
                      }
                      setSelectedSellerId(seller.id);
                      setIsScannerOpen(true);
                    }}
                    className="bg-white rounded-[24px] p-3.5 border border-white shadow-xs hover:shadow-md transition cursor-pointer relative group flex flex-col justify-between"
                  >
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Heart className="w-3.5 h-3.5 fill-blue-600" />
                    </div>

                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-50 to-blue-50 border border-emerald-200/80 flex items-center justify-center mb-2 shadow-2xs p-1.5">
                        <ItemProduceIcon category={seller.category} className="w-7 h-7" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {seller.stallNumber}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                          {seller.businessName}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {seller.category}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Guna Mata
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 group-hover:translate-x-0.5 transition">
                        Imbas ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions List */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" /> Aktiviti Mata Terkini
                </h3>
                <button
                  onClick={() => setActiveNav('HISTORY')}
                  className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Lihat Semua ({memberTransactions.length}) ➔
                </button>
              </div>

              <div className="space-y-2">
                {memberTransactions.length === 0 ? (
                  <div className="glass-card rounded-2xl p-6 text-center text-slate-400 text-xs">
                    Tiada rekod penggunaan mata lagi.
                  </div>
                ) : (
                  memberTransactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => tx.type === 'PAYMENT' && setLastReceipt(tx)}
                      className="bg-white/90 rounded-2xl p-3 border border-white shadow-xs flex items-center justify-between text-xs cursor-pointer hover:border-blue-200 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'OWNER_GRANT'
                              ? 'bg-amber-50 text-amber-600'
                              : tx.type === 'EXPIRY'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {tx.type === 'OWNER_GRANT' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'EXPIRY' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">
                            {tx.type === 'OWNER_GRANT'
                              ? 'Subsidi Penganjur JAM'
                              : tx.type === 'EXPIRY'
                              ? 'Mata Luput Had Masa'
                              : tx.sellerName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {tx.timestamp.split(' ')[0]} • {tx.note}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-black font-mono text-xs ${
                            tx.type === 'OWNER_GRANT'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'OWNER_GRANT' ? '+' : '-'}
                          {tx.amountPoints} Mata
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          (RM {tx.amountRM.toFixed(2)})
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </div>

      {/* 4. FLOATING BOTTOM DOCK */}
      <div className="absolute bottom-3 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-full py-2.5 px-6 shadow-xl border border-white flex items-center justify-around z-30">
        <button
          onClick={() => setActiveNav('HOME')}
          className="flex flex-col items-center gap-0.5 cursor-pointer relative"
        >
          <Home
            className={`w-5 h-5 transition ${
              activeNav === 'HOME' ? 'text-blue-600' : 'text-slate-400'
            }`}
          />
          {activeNav === 'HOME' && (
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => {
            if (!isMyIdVerified) {
              setIsMyIdModalOpen(true);
              return;
            }
            if (!hasClaimed) {
              setIsClaimModalOpen(true);
              return;
            }
            setPaymentError('');
            setCameraScanSuccessMsg('');
            setSelectedSellerId('');
            setScannerMode('CAMERA');
            setIsScannerOpen(true);
          }}
          className="w-11 h-11 -mt-4 rounded-full btn-gradient-blue text-white flex items-center justify-center shadow-md shadow-blue-500/30 cursor-pointer hover:scale-105 active:scale-95 transition"
        >
          <Scan className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setActiveNav('HISTORY');
            setSelectedCategory('Semua');
          }}
          className="flex flex-col items-center gap-0.5 cursor-pointer relative"
        >
          <ShoppingBag
            className={`w-5 h-5 transition ${
              activeNav === 'HISTORY' ? 'text-blue-600' : 'text-slate-400'
            }`}
          />
          {activeNav === 'HISTORY' && (
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* 5. FULLSCREEN BUYER QR MODAL (For seller to scan buyer phone) */}
      {isBuyerQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[36px] w-full max-w-sm overflow-hidden shadow-2xl border-4 border-white text-center p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-jam.png"
                  alt="JAM"
                  className="h-8 w-auto object-contain"
                />
                <span className="font-bold text-xs text-slate-800">Kad Loyaliti Ahli</span>
              </div>
              <button
                onClick={() => setIsBuyerQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Location Badge */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{activeEvent?.name || 'Jualan Agro MADANI'}</span>
            </div>

            {/* QR Code Big Container */}
            <div className="relative inline-block p-4 bg-white rounded-3xl border-4 border-blue-600/30 shadow-xl">
              <QRCodeSVG
                value={buyerQrPayload}
                size={200}
                level="H"
                fgColor={isEventEnded ? '#991b1b' : '#002f6c'}
              />
              {isEventEnded && (
                <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-3">
                  <Lock className="w-8 h-8 text-rose-300 mb-1" />
                  <span className="font-black text-xs uppercase tracking-wider">
                    Kod QR Tidak Sah
                  </span>
                  <span className="text-[10px] text-rose-200 mt-1">
                    Acara di lokasi ini telah selesai.
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="font-extrabold text-sm text-slate-900">{currentMember.name}</p>
              <p className="text-xs font-mono text-slate-500">
                No. Kad: <strong className="text-blue-700">{currentMember.cardId}</strong> • MyKad: {currentMember.icNumber || '850412-10-5432'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Baki Sah:</span>
              <span className="font-black font-mono text-emerald-600 text-sm">
                {isEventEnded ? '0 Mata (Luput)' : `${currentMember.points.toLocaleString()} Mata (RM ${(currentMember.points / 100).toFixed(2)})`}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Tunjukkan kod QR ini kepada mana-mana peniaga gerai JAM di lokasi ini untuk tolak mata belian.
            </p>

            <button
              onClick={() => setIsBuyerQrModalOpen(false)}
              className="w-full btn-gradient-blue text-white py-3 rounded-full font-bold text-xs uppercase cursor-pointer"
            >
              Tutup Paparan QR
            </button>
          </div>
        </div>
      )}

      {/* 6. MYDIGITAL ID AUTH MODAL */}
      <MyDigitalIdAuthModal
        isOpen={isMyIdModalOpen}
        onClose={() => setIsMyIdModalOpen(false)}
        onAuthenticate={(userData) => {
          if (onAuthenticateMyDigitalId) {
            onAuthenticateMyDigitalId(userData);
          }
        }}
      />

      {/* 7. CLAIM EVENT POINTS MODAL */}
      {onClaimEventPoints && (
        <ClaimPointsModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          currentMember={currentMember}
          events={events}
          onClaimEventPoints={onClaimEventPoints}
        />
      )}

      {/* 8. PAYMENT & CAMERA SCANNER MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-t-[36px] sm:rounded-[36px] w-full max-w-sm overflow-hidden shadow-2xl border border-white animate-in slide-in-from-bottom duration-200">
            {/* Header with Back Arrow */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
              <button
                onClick={() => setIsScannerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-blue-600" /> Imbas & Bayar QR Gerai
              </h3>
              <div className="w-8"></div>
            </div>

            {/* Mode Switcher Tabs (Camera vs NFC vs Manual) */}
            <div className="px-5 pt-3">
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setScannerMode('CAMERA')}
                  className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                    scannerMode === 'CAMERA'
                      ? 'btn-gradient-blue text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" /> Kamera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsScannerOpen(false);
                    setNfcMode('BUYER_TAP_MERCHANT');
                    setIsNfcModalOpen(true);
                  }}
                  className="py-2 px-1 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer text-emerald-700 hover:bg-emerald-50 font-black"
                >
                  <NfcContactlessIcon className="w-3.5 h-3.5 text-emerald-600" /> Sentuh NFC
                </button>
                <button
                  type="button"
                  onClick={() => setScannerMode('MANUAL')}
                  className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                    scannerMode === 'MANUAL'
                      ? 'btn-gradient-blue text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" /> Manual
                </button>
              </div>
            </div>

            {/* 1. CAMERA MODE: Opens device camera feed */}
            {scannerMode === 'CAMERA' ? (
              <div className="p-5 space-y-3.5">
                <CameraQrScanner
                  onScanSuccess={handleCameraQrSuccess}
                  onClose={() => setIsScannerOpen(false)}
                />

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  Halakan kamera peranti anda ke <strong>Kod QR Meja Gerai</strong> peniaga JAM. Kamera akan mengenal pasti gerai dan membuka borang tolak mata serta-merta.
                </p>

                {cameraScanSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{cameraScanSuccessMsg}</span>
                  </div>
                )}

                {paymentError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}
              </div>
            ) : (
              /* 2. MANUAL / POST-SCAN MODE: Payment Form */
              <form onSubmit={handleQuickPay} className="p-5 space-y-4">
                {cameraScanSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{cameraScanSuccessMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerMode('CAMERA');
                        setCameraScanSuccessMsg('');
                      }}
                      className="text-[10px] text-blue-700 hover:underline font-bold shrink-0"
                    >
                      Imbas Lain
                    </button>
                  </div>
                )}

                <div className="theme-gradient-wave rounded-2xl p-3.5 text-white shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-100">
                      Baki Semasa Ahli
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {currentMember.cardId}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black font-mono">
                      {currentMember.points.toLocaleString()}
                    </span>
                    <span className="text-xs">Mata (RM {(currentMember.points / 100).toFixed(2)})</span>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-3.5 border border-slate-200/80">
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Gerai Peniaga:
                  </label>
                  <select
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Gerai --</option>
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        Gerai {s.stallNumber}: {s.businessName}
                      </option>
                    ))}
                  </select>
                  {selectedSellerObj && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {selectedSellerObj.businessName} ({selectedSellerObj.ownerName})
                    </p>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-3.5 border border-slate-200/80">
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Jumlah Belian Yang Hendak Ditolak (RM):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      RM
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0.10"
                      placeholder="0.00"
                      value={amountRM}
                      onChange={(e) => setAmountRM(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {parsedAmountRM > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Mata Diperlukan:</span>
                      <span className="font-mono font-black text-rose-600">
                        -{pointsNeeded} Mata ({pointsNeeded} sen)
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Catatan barang (Cth: Ayam Segar 1 ekor)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />

                {paymentError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canAfford || !selectedSellerId}
                  className="w-full btn-gradient-blue disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed text-white py-4 rounded-full font-extrabold text-sm uppercase tracking-wider transition cursor-pointer"
                >
                  Bayar Sekarang (Tolak {pointsNeeded > 0 ? `${pointsNeeded} Mata` : 'Mata'})
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 9. RECEIPT MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] w-full max-w-sm overflow-hidden shadow-2xl border border-white p-6 text-center space-y-4">
            <div className="flex flex-col items-center justify-center">
              <img
                src="/logo-jam.png"
                alt="Jualan Agro MADANI"
                className="h-12 w-auto object-contain mb-2"
              />
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Resit Rasmi Bayaran Mata JAM
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                RM {lastReceipt.amountRM.toFixed(2)}
              </h3>
              <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">
                {lastReceipt.amountPoints} Mata Ditolak Otomatik
              </p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 text-left text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Peniaga:</span>
                <span className="font-bold text-slate-800">{lastReceipt.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Gerai:</span>
                <span className="font-mono font-bold text-slate-800">{lastReceipt.stallNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Transaksi:</span>
                <span className="font-mono text-slate-600">{lastReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa:</span>
                <span className="text-slate-600">{lastReceipt.timestamp}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                <span className="text-slate-700">Baki Mata Terkini:</span>
                <span className="text-emerald-600 font-mono">
                  {currentMember.points.toLocaleString()} Mata (RM {(currentMember.points / 100).toFixed(2)})
                </span>
              </div>
            </div>

            <button
              onClick={() => setLastReceipt(null)}
              className="w-full btn-gradient-blue text-white py-3 rounded-full font-bold text-xs uppercase cursor-pointer"
            >
              Tutup Resit
            </button>
          </div>
        </div>
      )}

      {/* 9. WEB NFC READER MODAL */}
      <NfcReaderModal
        isOpen={isNfcModalOpen}
        onClose={() => setIsNfcModalOpen(false)}
        mode={nfcMode}
        currentMember={currentMember}
        allMembers={allMembers}
        allSellers={sellers}
        events={events}
        onSelectStallFromNfc={(stall) => {
          setSelectedSellerId(stall.id);
          setCameraScanSuccessMsg(`Gerai Dikesan Melalui Web NFC: ${stall.businessName} (${stall.stallNumber})`);
          setScannerMode('MANUAL');
          setIsScannerOpen(true);
        }}
        onPaymentSuccess={(res) => {
          onMakePayment(
            res.member.id,
            res.seller.id,
            res.amountRM,
            `Bayaran Sentuh NFC (${res.seller.businessName})`
          );
        }}
      />

    </div>
  );
};
