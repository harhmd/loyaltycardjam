import React, { useState } from 'react';
import { Seller, Transaction, ReimbursementClaim } from '../types';
import { QRCodeSVG } from 'qrcode.react';
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
  DollarSign
} from 'lucide-react';

interface SellerPortalProps {
  currentSeller: Seller;
  allSellers: Seller[];
  onSelectSeller: (sellerId: string) => void;
  transactions: Transaction[];
  claims: ReimbursementClaim[];
  onSubmitClaim: (sellerId: string, amountRM: number) => void;
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

  const sellerTransactions = transactions.filter(
    (t) => t.sellerId === currentSeller.id
  );

  const sellerClaims = claims.filter((c) => c.sellerId === currentSeller.id);

  const unclaimedRM = currentSeller.unclaimedSen / 100;
  const totalCollectedRM = currentSeller.totalCollectedSen / 100;

  const handleClaim = () => {
    if (unclaimedRM <= 0) return;
    onSubmitClaim(currentSeller.id, unclaimedRM);
    setClaimSuccessMsg(`Tuntutan RM ${unclaimedRM.toFixed(2)} berjaya dihantar kepada Penganjur JAM!`);
    setTimeout(() => setClaimSuccessMsg(''), 4000);
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
        /* OFFICIAL STANDEE QR CODE CARD FOR BUYER TO SCAN (Matching Vibrant Blue-Green Organic Gradient Wave) */
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
                  onClick={handleClaim}
                  disabled={unclaimedRM <= 0}
                  className="w-full btn-gradient-blue disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Hantar Tuntutan Bayaran Balik
                </button>
              </div>
            </div>
          </div>

          {claimSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {claimSuccessMsg}
            </div>
          )}

          {/* Live Recent Transactions */}
          <div className="glass-card rounded-[28px] p-5 border border-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Transaksi Terbaru di Gerai Ini
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
                      <p className="text-xs font-bold text-slate-800">
                        {tx.memberName}
                      </p>
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
              <Clock className="w-4 h-4 text-slate-400" /> Rekod Tuntutan Subsidi
            </h3>
            {sellerClaims.length === 0 ? (
              <p className="text-xs text-slate-400">Tiada tuntutan dihantar.</p>
            ) : (
              <div className="space-y-2">
                {sellerClaims.map((clm) => (
                  <div
                    key={clm.id}
                    className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">No. Tuntutan: {clm.id}</p>
                      <p className="text-[10px] text-slate-400">{clm.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black font-mono text-slate-900">
                        RM {clm.amountRM.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          clm.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {clm.status === 'PAID' ? 'SUDAH DIBAYAR' : 'MENUNGGU KELULUSAN'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
