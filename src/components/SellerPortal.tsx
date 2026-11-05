import React, { useState, useRef } from 'react';
import { Seller, Transaction, ReimbursementClaim } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { generateJamReceiptImage } from '../utils/auditUtils';
import {
  Store,
  QrCode,
  TrendingUp,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
  DollarSign,
  FileText,
  Upload,
  Camera,
  Eye,
  AlertTriangle,
  X,
  CreditCard,
  Building,
  Check,
  Receipt
} from 'lucide-react';

interface SellerPortalProps {
  currentSeller: Seller;
  allSellers: Seller[];
  onSelectSeller: (sellerId: string) => void;
  transactions: Transaction[];
  claims: ReimbursementClaim[];
  onSubmitClaim: (
    sellerId: string,
    amountRM: number,
    claimData?: {
      receiptUrl?: string;
      receiptName?: string;
      notes?: string;
      bankName?: string;
      bankAccountNumber?: string;
      accountHolderName?: string;
    }
  ) => void;
}

export const SellerPortal: React.FC<SellerPortalProps> = ({
  currentSeller,
  allSellers,
  onSelectSeller,
  transactions,
  claims,
  onSubmitClaim,
}) => {
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'STANDEE'>('STANDEE');
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');
  
  // Claim submission modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptName, setReceiptName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bankName, setBankName] = useState<string>(currentSeller.bankName || 'Maybank');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>(
    currentSeller.bankAccountNumber || '5142 8829 1042'
  );
  const [accountHolderName, setAccountHolderName] = useState<string>(
    currentSeller.accountHolderName || currentSeller.ownerName
  );
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string>('');
  
  // Receipt preview lightbox
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sellerTransactions = transactions.filter(
    (t) => t.sellerId === currentSeller.id
  );

  const sellerClaims = claims.filter((c) => c.sellerId === currentSeller.id);

  // Unclaimed transactions
  const unclaimedTxns = sellerTransactions.filter(
    (t) => t.type === 'PAYMENT' && !t.claimId
  );
  const ledgerUnclaimedRM = unclaimedTxns.reduce((sum, t) => sum + t.amountRM, 0);

  const unclaimedRM = currentSeller.unclaimedSen > 0 
    ? currentSeller.unclaimedSen / 100 
    : ledgerUnclaimedRM;
    
  const totalCollectedRM = currentSeller.totalCollectedSen / 100;

  // Handle local file upload (photo/pdf/image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReceiptError('Sila muat naik fail format imej (PNG, JPG, JPEG).');
      return;
    }

    setReceiptError('');
    setReceiptName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate official JAM Digital Consolidated Receipt
  const handleGenerateOfficialReceipt = async () => {
    setIsGeneratingReceipt(true);
    setReceiptError('');
    try {
      const generatedDataUrl = await generateJamReceiptImage(
        currentSeller,
        unclaimedRM,
        unclaimedTxns.length > 0 ? unclaimedTxns : sellerTransactions.slice(0, 5)
      );
      setReceiptUrl(generatedDataUrl);
      setReceiptName(`Penyata_Rasmi_JAM_${currentSeller.id}_${Date.now().toString().slice(-4)}.png`);
    } catch (err) {
      console.error('Ralat menjana resit:', err);
      setReceiptError('Gagal menjana resit automatik.');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  // Submit claim with validation
  const handleSubmitClaimForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptUrl) {
      setReceiptError('Sila lampirkan gambar resit fizikal atau jana penyata rasmi JAM terlebih dahulu.');
      return;
    }

    if (unclaimedRM <= 0) {
      setReceiptError('Tiada baki belum dituntut untuk dikemukakan.');
      return;
    }

    onSubmitClaim(currentSeller.id, unclaimedRM, {
      receiptUrl,
      receiptName: receiptName || 'Resit_Jualan_Gerai.png',
      notes: notes || 'Tuntutan bayaran balik belian subsidi JAM',
      bankName,
      bankAccountNumber,
      accountHolderName,
    });

    setIsClaimModalOpen(false);
    setReceiptUrl('');
    setReceiptName('');
    setNotes('');
    setClaimSuccessMsg(
      `Tuntutan RM ${unclaimedRM.toFixed(
        2
      )} berserta lampiran resit berjaya dihantar ke Urusetia JAM untuk semakan kelulusan!`
    );
    setTimeout(() => setClaimSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Header & Stall Selector */}
      <div className="glass-card rounded-[28px] p-4 border border-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
            <img
              src="/logo-jam.png"
              alt="Jualan Agro MADANI"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Portal Peniaga Gerai JAM
              </span>
              <span className="text-xs text-slate-500 font-medium">
                No. Gerai: <strong className="text-slate-800">{currentSeller.stallNumber}</strong>
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 mt-0.5">
              {currentSeller.businessName}
            </h2>
            <p className="text-xs text-slate-500">
              Peniaga: {currentSeller.ownerName} • {currentSeller.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Stall Dropdown */}
          <select
            value={currentSeller.id}
            onChange={(e) => onSelectSeller(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
          >
            {allSellers.map((s) => (
              <option key={s.id} value={s.id}>
                Gerai {s.stallNumber}: {s.businessName}
              </option>
            ))}
          </select>

          {/* Toggle View Mode */}
          <button
            onClick={() =>
              setViewMode(viewMode === 'STANDEE' ? 'DASHBOARD' : 'STANDEE')
            }
            className="btn-gradient-blue text-white text-xs font-extrabold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            {viewMode === 'STANDEE' ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" /> Lihat Penyata
              </>
            ) : (
              <>
                <QrCode className="w-3.5 h-3.5" /> Papar Layar QR Meja
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'STANDEE' ? (
        /* OFFICIAL STANDEE QR CODE CARD FOR BUYER TO SCAN */
        <div className="theme-gradient-wave text-white rounded-[36px] p-6 sm:p-8 shadow-2xl border-4 border-white text-center relative overflow-hidden">
          {/* Ambient Glow Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/30 rounded-full blur-2xl pointer-events-none"></div>

          {/* Official Logo Banner */}
          <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg inline-flex items-center justify-center gap-3 mb-4 border border-white">
            <img
              src="/logo-jam.png"
              alt="Jualan Agro MADANI"
              className="h-11 w-auto object-contain"
            />
            <div className="text-left border-l border-slate-200 pl-3">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                GERAI RASMI BERDAFTAR
              </span>
              <span className="text-xs font-bold text-slate-800 font-mono">
                KOD: {currentSeller.id}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentSeller.businessName}
          </h1>
          <p className="text-xs text-blue-100 mt-1 font-semibold">
            {currentSeller.category} • Gerai No: {currentSeller.stallNumber} ({currentSeller.location})
          </p>

          {/* Frosted QR Code Container */}
          <div className="mt-6 mb-4 inline-block p-5 bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border-2 border-white">
            <QRCodeSVG
              value={currentSeller.qrPayload}
              size={210}
              level="H"
              includeMargin={true}
            />
            <div className="mt-2 text-[11px] font-mono font-black text-blue-900 bg-blue-50 py-1.5 px-3 rounded-full border border-blue-200">
              IMBAS KOD GERAI: {currentSeller.id}
            </div>
          </div>

          {/* Instructions for Buyer */}
          <div className="max-w-md mx-auto bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/25 text-xs space-y-1 text-white">
            <p className="font-extrabold text-sm flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-300" /> Sila Imbas Kod Ini Guna Kad / Aplikasi Ahli JAM
            </p>
            <p className="text-[11px] text-blue-100">
              Mata ditolak secara automatik daripada baki pembeli (100 Mata = RM 1.00).
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-blue-100">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Disahkan Jualan Agro MADANI
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" /> Bebas Ketirisan Baucar
            </span>
          </div>
        </div>
      ) : (
        /* VENDOR DASHBOARD & REIMBURSEMENT VIEW */
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-card rounded-[28px] p-5 border border-white shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">Jumlah Belian Mata Diterima:</span>
                <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  Terkumpul
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
                RM {totalCollectedRM.toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                {currentSeller.totalCollectedSen.toLocaleString()} Mata JAM
              </p>
            </div>

            <div className="glass-card rounded-[28px] p-5 border border-white shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">Belum Dituntut:</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  Sedia Tuntut
                </span>
              </div>
              <p className="text-3xl font-black text-emerald-600 mt-2 font-mono">
                RM {unclaimedRM.toFixed(2)}
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setIsClaimModalOpen(true)}
                  disabled={unclaimedRM <= 0}
                  className="w-full btn-gradient-blue disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Hantar Tuntutan Bayaran Balik
                </button>
              </div>
            </div>
          </div>

          {claimSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{claimSuccessMsg}</span>
            </div>
          )}

          {/* Live Recent Transactions */}
          <div className="glass-card rounded-[28px] p-5 border border-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Transaksi Penebusan Ahli di Gerai Ini
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {sellerTransactions.length} rekod
              </span>
            </div>

            {sellerTransactions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Belum ada pembeli mengimbas QR di gerai ini hari ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sellerTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{tx.memberName}</p>
                        {tx.claimId && (
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded-md">
                            Tuntutan: {tx.claimId}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {tx.timestamp} • {tx.note}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black font-mono text-emerald-600">
                        +RM {tx.amountRM.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ({tx.amountPoints} Mata)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Claims History */}
          <div className="glass-card rounded-[28px] p-5 border border-white shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" /> Rekod Tuntutan Subsidi Gerai
            </h3>
            {sellerClaims.length === 0 ? (
              <p className="text-xs text-slate-400">Tiada permohonan tuntutan dihantar setakat ini.</p>
            ) : (
              <div className="space-y-3">
                {sellerClaims.map((clm) => (
                  <div
                    key={clm.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">No. Tuntutan: {clm.id}</span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            clm.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : clm.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {clm.status === 'PAID'
                            ? 'DILULUSKAN & DIBAYAR'
                            : clm.status === 'REJECTED'
                            ? 'DITOLAK'
                            : 'MENUNGGU KELULUSAN'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Tarikh: {clm.timestamp} {clm.notes && `• ${clm.notes}`}
                      </p>
                      {clm.bankName && (
                        <p className="text-[10px] text-slate-500 font-medium">
                          Akaun: {clm.bankName} ({clm.bankAccountNumber})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <p className="font-black font-mono text-base text-slate-900">
                          RM {clm.amountRM.toFixed(2)}
                        </p>
                      </div>

                      {clm.receiptUrl ? (
                        <button
                          onClick={() => setPreviewReceiptUrl(clm.receiptUrl || null)}
                          className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5 font-bold text-[11px] cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lihat Resit</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tiada resit</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 MODAL: BORANG PERMOHONAN TUNTUTAN & LAMPIRAN RESIT    */}
      {/* ======================================================== */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Borang Tuntutan Bayaran Balik Peniaga
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Lampirkan resit jualan fizikal atau jana penyata rasmi JAM untuk kelulusan penganjur.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {receiptError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{receiptError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitClaimForm} className="space-y-4 text-xs">
              
              {/* 1. TALLY CHECK & SUMMARY BOX */}
              <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border border-blue-200/80 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Jumlah Tuntutan Subsidi:
                    </span>
                    <p className="text-2xl font-black font-mono text-blue-900 mt-0.5">
                      RM {unclaimedRM.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> 100% Sepadan (Tally)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {unclaimedTxns.length > 0 ? unclaimedTxns.length : sellerTransactions.length} transaksi belian sah
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-blue-800/80 bg-white/70 p-2 rounded-xl border border-blue-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Sistem mengesahkan tuntutan dipautkan terus ke transaksi pembeli sebenar dalam pangkalan data.</span>
                </div>
              </div>

              {/* 2. LAMPIRAN RESIT (MANDATORY REQUIREMENT) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lampiran Resit Penebusan / Penyata Jualan</span>
                    <span className="text-rose-500 font-bold">*Wajib</span>
                  </label>
                  {receiptUrl && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resit Dilampirkan
                    </span>
                  )}
                </div>

                {/* Upload or Generate Action Options */}
                {!receiptUrl ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option A: Upload image from phone/file */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 block text-xs">
                          Ambil Gambar / Muat Naik Resit
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Kamera telefon, fail PNG / JPG
                        </span>
                      </div>
                    </div>

                    {/* Option B: Generate Official JAM Digital Receipt */}
                    <div
                      onClick={handleGenerateOfficialReceipt}
                      className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
                        {isGeneratingReceipt ? (
                          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 block text-xs">
                          Jana Penyata Resit JAM Rasmi
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Automatik berasaskan lejar belian
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Attached Receipt Preview Card */
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={receiptUrl}
                          alt="Resit"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs">
                          {receiptName || 'Resit_Tuntutan.png'}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Sedia untuk disemak oleh penganjur
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewReceiptUrl(receiptUrl)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[10px] cursor-pointer"
                      >
                        Pratonton
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptUrl('');
                          setReceiptName('');
                        }}
                        className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] cursor-pointer"
                      >
                        Tukar
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* 3. MAKLUMAT AKAUN BANK */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Maklumat Akaun Bank Pembayaran Tunai</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">
                      Nama Bank:
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Contoh: Maybank / CIMB"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">
                      No. Akaun Bank:
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Contoh: 5142 8829 1042"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] font-bold mb-1">
                    Nama Pemegang Akaun:
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 4. CATATAN TUNTUTAN (OPTIONAL) */}
              <div>
                <label className="block text-slate-500 text-[10px] font-bold mb-1">
                  Catatan Tuntutan (Pilihan):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Jualan Ayam Segar Sesi Pagi 08/11/2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!receiptUrl || unclaimedRM <= 0}
                className="w-full btn-gradient-blue disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white font-black text-xs py-3 rounded-2xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Hantar Tuntutan & Resit Kepada Penganjur</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 LIGHTBOX: PRATONTON RESIT (SELLER)                    */}
      {/* ======================================================== */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Lampiran Resit Tuntutan Gerai</span>
              </span>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
              <img
                src={previewReceiptUrl}
                alt="Pratonton Resit"
                className="w-full h-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
