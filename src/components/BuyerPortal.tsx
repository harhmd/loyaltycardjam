import React, { useState } from 'react';
import { Member, Seller, Transaction, ProductItem } from '../types';
import { INITIAL_PRODUCTS, playCashierChime } from '../store';
import { CameraQrScanner } from './CameraQrScanner';
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
  Tag,
  Zap,
  Flame,
  Clock,
  AlertTriangle,
  Calendar
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
}

export const BuyerPortal: React.FC<BuyerPortalProps> = ({
  currentMember,
  allMembers,
  onSelectMember,
  sellers,
  products = INITIAL_PRODUCTS,
  onMakePayment,
  transactions,
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

  const parsedAmountRM = parseFloat(amountRM) || 0;
  const pointsNeeded = Math.round(parsedAmountRM * 100);
  const canAfford = currentMember.points >= pointsNeeded && pointsNeeded > 0;

  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PAYMENT' | 'OWNER_GRANT' | 'EXPIRY'>('ALL');

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
      setCameraScanSuccessMsg(`Kod QR Dikesan: Gerai ${matched.stallNumber} - ${matched.businessName}`);
      setPaymentError('');
      playCashierChime();
      setScannerMode('MANUAL');
    } else {
      setPaymentError(`Kod QR diimbas ("${decodedText}") tidak sah di bawah sistem rasmi JAM.`);
    }
  };

  // One-click quick redeem from product card
  const handleSelectProduct = (product: ProductItem) => {
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
      note || 'Belian barangan di Jualan Agro MADANI'
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

  return (
    <div className="max-w-[420px] mx-auto bg-[#f0f7ff] min-h-[760px] rounded-[44px] shadow-2xl border-4 border-white overflow-hidden flex flex-col relative select-none">
      
      {/* 1. TOP HEADER WITH ORGANIC BLUE-TO-GREEN GRADIENT WAVE */}
      <div className="relative pt-6 pb-12 px-6 theme-gradient-wave text-white rounded-b-[42px] shadow-lg overflow-hidden">
        {/* Soft radial glow overlays */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/30 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-400/30 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Navbar Row */}
        <div className="flex items-center justify-between relative z-10 mb-4">
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

        {/* Search Bar Pill */}
        <div className="relative z-10">
          <div className="flex items-center bg-white/95 rounded-full px-4 py-2.5 shadow-md shadow-blue-900/10 border border-white">
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
          className="rounded-[36px] border-2 border-amber-300/70 shadow-2xl relative overflow-hidden text-white transition-all duration-300 hover:shadow-emerald-900/30"
          style={{
            backgroundImage: "url('/jam-card-luxury.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Multi-layered Glassmorphic Scrim for High Contrast & Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-950/30 pointer-events-none"></div>
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

              {/* QR Code Plaque with Golden Border */}
              <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-amber-300 shadow-lg shrink-0">
                <QRCodeSVG
                  value={currentMember.cardId}
                  size={38}
                  bgColor="transparent"
                  fgColor="#0f172a"
                />
              </div>
            </div>

            {/* Middle Section: Smart Chip Motif + Balance */}
            <div className="my-3">
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

              {/* Points & RM */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-md">
                  {currentMember.points.toLocaleString()}
                </span>
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest drop-shadow">
                  Mata
                </span>
              </div>

              {/* Cash Equivalent in Ringgit Malaysia */}
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

            {/* Real Product Picture Pills (NO FREE ICONS, REAL PICTURES) */}
            <div className="flex items-center gap-1.5 flex-wrap my-1">
              <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25 shadow-xs">
                <img
                  src="/ayam_segar.png"
                  alt="Ayam Segar"
                  className="w-4 h-4 rounded-full object-cover border border-amber-300 shrink-0"
                />
                <span className="text-[9px] font-extrabold text-white tracking-wide">
                  Ayam Segar
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25 shadow-xs">
                <img
                  src="/telur_ayam.png"
                  alt="Telur Ayam"
                  className="w-4 h-4 rounded-full object-cover border border-amber-300 shrink-0"
                />
                <span className="text-[9px] font-extrabold text-white tracking-wide">
                  Telur Gred A
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25 shadow-xs">
                <img
                  src="/buah_tempatan.png"
                  alt="Buah Tempatan"
                  className="w-4 h-4 rounded-full object-cover border border-amber-300 shrink-0"
                />
                <span className="text-[9px] font-extrabold text-white tracking-wide">
                  Buah Tempatan
                </span>
              </div>
            </div>

            {/* EXPIRY DATE BADGE ON CARD */}
            <div className="flex items-center justify-between text-[10px] mt-1 pt-1.5 border-t border-white/10">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-md border ${
                  currentMember.points === 0 && (currentMember.expiredPointsTotal || 0) > 0
                    ? 'bg-rose-950/80 text-rose-300 border-rose-400/40'
                    : 'bg-black/60 text-amber-200 border-amber-300/40'
                }`}
              >
                <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="font-bold text-[9px] tracking-tight">
                  {currentMember.points === 0 && (currentMember.expiredPointsTotal || 0) > 0
                    ? `Status: Telah Luput`
                    : `Sah Sehingga: ${currentMember.pointsExpiryDate || '08 Nov 2026, 18:00'}`}
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
                  Nama Ahli
                </p>
                <p className="font-extrabold text-white text-xs truncate max-w-[180px] drop-shadow-xs">
                  {currentMember.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">
                  No. Kad
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
        
        {/* Had Tempoh Mata Kad Status Banner */}
        {currentMember.points === 0 && (currentMember.expiredPointsTotal || 0) > 0 ? (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 flex items-start gap-2.5 shadow-sm text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-rose-900 leading-tight">
                Mata Telah Tamat Tempoh & Dilupuskan
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Sebanyak <strong className="font-black text-rose-950 font-mono">{(currentMember.expiredPointsTotal || 0).toLocaleString()} Mata (RM {((currentMember.expiredPointsTotal || 0) / 100).toFixed(2)})</strong> telah melepasi had masa kempen dan dilupuskan secara automatik.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card bg-amber-50/80 border border-amber-200/90 rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                  Had Masa Mata Subsidi
                </p>
                <p className="text-xs font-black text-slate-800 font-mono">
                  {currentMember.pointsExpiryDate || '08 Nov 2026, 18:00'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Aktif
            </span>
          </div>
        )}

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
            {/* Quick Action: BIG GLOSSY BLUE "IMBAS & BAYAR" BUTTON */}
            <button
              onClick={() => {
                setPaymentError('');
                setCameraScanSuccessMsg('');
                setSelectedSellerId('');
                setScannerMode('CAMERA');
                setIsScannerOpen(true);
              }}
              className="w-full btn-gradient-blue text-white py-3.5 px-5 rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Scan className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Imbas & Bayar QR Gerai</span>
              <ChevronRight className="w-4 h-4 ml-auto text-blue-200" />
            </button>

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

        {/* 🌟 DEDICATED VISUAL CARDS: PRODUK SEGAR UTAMA (Chicken, Eggs, Fruits) */}
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
                {/* 3D Product Image / Visual Frame */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-50 to-blue-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner p-1">
                  <img
                    src={prod.imageUrl || '/card-produce-banner.png'}
                    alt={prod.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-108 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-md shadow-2xs uppercase">
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
                  setSelectedSellerId(seller.id);
                  setIsScannerOpen(true);
                }}
                className="bg-white rounded-[24px] p-3.5 border border-white shadow-xs hover:shadow-md transition cursor-pointer relative group flex flex-col justify-between"
              >
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Heart className="w-3.5 h-3.5 fill-blue-600" />
                </div>

                <div>
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2 font-bold text-xs">
                    {seller.stallNumber}
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                    {seller.businessName}
                  </h4>
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

      {/* PAYMENT & CAMERA SCANNER MODAL */}
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

            {/* Mode Switcher Tabs (Camera vs Manual) */}
            <div className="px-5 pt-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setScannerMode('CAMERA')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    scannerMode === 'CAMERA'
                      ? 'btn-gradient-blue text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-4 h-4" /> Kamera Langsung
                </button>
                <button
                  type="button"
                  onClick={() => setScannerMode('MANUAL')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    scannerMode === 'MANUAL'
                      ? 'btn-gradient-blue text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Store className="w-4 h-4" /> Pilih Gerai Manual
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

      {/* RECEIPT MODAL */}
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

    </div>
  );
};
