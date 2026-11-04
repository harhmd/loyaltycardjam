import React, { useState } from 'react';
import { Member, Seller, Transaction, ReimbursementClaim } from '../types';
import confetti from 'canvas-confetti';
import {
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
  RotateCcw
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
}) => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner with Vibrant Gradient Wave */}
      <div className="theme-gradient-wave text-white rounded-[36px] p-6 sm:p-8 shadow-xl border-4 border-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white p-2.5 rounded-[24px] shadow-lg border border-white shrink-0">
            <img
              src="/logo-jam.png"
              alt="Jualan Agro MADANI"
              className="h-14 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md text-white font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider border border-white/30">
                PANEL PENGURUSAN UTAMA
              </span>
              <span className="text-xs text-blue-100">
                Penganjur Jualan Agro MADANI (JAM)
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1">
              Kawalan Mata Ganjaran & Subsidi
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              Agih mata tunai (1 Mata = 1 Sen) terus ke kad ahli dan semak tuntutan peniaga.
            </p>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md px-5 py-3.5 rounded-[24px] border border-white/30 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold">
            <Coins className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-[10px] text-blue-100 uppercase font-black tracking-wider">
              Formula Tetap
            </p>
            <p className="text-sm font-black text-white font-mono">
              1 MATA = 1 SEN
            </p>
            <p className="text-[10px] text-emerald-200 font-semibold">
              100 Mata = RM 1.00
            </p>
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="glass-card p-5 rounded-[28px] border border-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Jumlah Diagih</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            RM {totalGrantedRM.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">
            {totalGrantedPoints.toLocaleString()} Mata
          </p>
        </div>

        <div className="glass-card p-5 rounded-[28px] border border-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Ditebus di Gerai</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            RM {totalRedeemedRM.toFixed(2)}
          </p>
          <p className="text-xs text-rose-600 font-semibold mt-0.5">
            {totalRedeemedPoints.toLocaleString()} Mata Ditolak
          </p>
        </div>

        <div className="glass-card p-5 rounded-[28px] border border-white shadow-sm bg-rose-50/50">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold text-rose-800">Luput Dipulangkan</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2 font-mono">
            RM {totalExpiredRM.toFixed(2)}
          </p>
          <p className="text-xs text-rose-700 font-semibold mt-0.5">
            {totalExpiredPoints.toLocaleString()} Mata Luput
          </p>
        </div>

        <div className="glass-card p-5 rounded-[28px] border border-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Baki Belum Ditebus</span>
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2 font-mono">
            RM {unredeemedRM.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Dalam dompet ahli
          </p>
        </div>

        <div className="glass-card p-5 rounded-[28px] border border-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Ahli Berdaftar</span>
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

      {/* CORE FUNCTION: GIVE POINTS TO MEMBERS */}
      <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Agih Mata Kepada Ahli (Bantuan / Promosi Jualan)
            </h2>
            <p className="text-xs text-slate-500">
              Penganjur boleh memberikan mata setara nilai Ringgit Malaysia secara pukal kepada semua ahli atau ahli terpilih.
            </p>
          </div>
        </div>

        {/* Quick Campaign Presets */}
        <div className="mt-4 mb-4">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Templat Kempen Pantas:
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <button
              type="button"
              onClick={() =>
                setPreset(
                  10.0,
                  'Subsidi Khas Jualan Agro MADANI (RM10 = 1,000 Mata)',
                  '2026-11-08 18:00'
                )
              }
              className="text-xs bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 px-3.5 py-1.5 rounded-full font-bold transition shadow-2xs cursor-pointer"
            >
              🎉 RM 10 (1,000 Mata) - Sah Ahad Ini (18:00)
            </button>
            <button
              type="button"
              onClick={() =>
                setPreset(
                  5.0,
                  'Ganjaran Pagi Pasar Tani (RM5 = 500 Mata)',
                  '2026-11-07 14:00'
                )
              }
              className="text-xs bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full font-bold transition shadow-2xs cursor-pointer"
            >
              🥬 RM 5 (500 Mata) - Sah 1 Hari (Sabtu Sahaja)
            </button>
            <button
              type="button"
              onClick={() =>
                setPreset(
                  3.0,
                  'Rebat Musim Buah Tempatan (RM3 = 300 Mata)',
                  '2026-11-30 23:59'
                )
              }
              className="text-xs bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 px-3.5 py-1.5 rounded-full font-bold transition shadow-2xs cursor-pointer"
            >
              🍍 RM 3 (300 Mata) - Sah Hujung Bulan (30 Nov)
            </button>
          </div>
        </div>

        <form onSubmit={handleGrant} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Target Audience */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Sasaran Agihan:
              </label>
              <select
                value={grantTarget}
                onChange={(e) => setGrantTarget(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">
                  📢 SEMUA Ahli Berdaftar ({members.length} Orang)
                </option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    👤 {m.name} ({m.cardId})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount in RM */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Nilai Ringgit Malaysia (RM):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                  RM
                </span>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  value={amountRM}
                  onChange={(e) => setAmountRM(e.target.value)}
                  className="w-full pl-11 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-base font-black font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Nama Kempen / Catatan:
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Contoh: Subsidi Mingguan JAM"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Expiry Date Setting */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 flex items-center justify-between">
                <span>Had Masa Tamat Tempoh:</span>
                <span className="text-[10px] text-rose-600 font-bold">Auto-Expire</span>
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="2026-11-08 18:00"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Quick Expiry Date selector chips */}
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="text-slate-400 font-bold uppercase">Pilihan Tarikh:</span>
            <button
              type="button"
              onClick={() => setExpiryDate('2026-11-08 18:00')}
              className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono transition cursor-pointer"
            >
              Ahad Ini (08 Nov 2026, 18:00)
            </button>
            <button
              type="button"
              onClick={() => setExpiryDate('2026-11-15 18:00')}
              className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono transition cursor-pointer"
            >
              Minggu Depan (15 Nov 2026, 18:00)
            </button>
            <button
              type="button"
              onClick={() => setExpiryDate('2026-11-30 23:59')}
              className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono transition cursor-pointer"
            >
              Hujung Bulan (30 Nov 2026, 23:59)
            </button>
          </div>

          {/* Calculation summary box */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 font-medium">
                Setiap ahli menerima: <strong>{pointsPerPerson.toLocaleString()} Mata</strong>{' '}
                (Setara RM {parsedAmountRM.toFixed(2)}) • Sah hingga:{' '}
                <strong className="font-mono text-rose-600">{expiryDate}</strong>
              </span>
            </div>
            <div className="font-mono text-blue-900 font-black">
              Jumlah Peruntukan: RM {totalRMToDistribute.toFixed(2)} ({totalPointsToDistribute.toLocaleString()} Mata)
            </div>
          </div>

          {grantSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {grantSuccessMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-gradient-blue text-white py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4" /> Sahkan & Agihkan Mata dengan Had Masa
          </button>
        </form>
      </div>

      {/* 🌟 DEDICATED SECTION: POINTS EXPIRY MANAGEMENT & RECONCILIATION */}
      <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-4">
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

      {/* SELLER REIMBURSEMENT CLAIMS TABLE */}
      <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-4">
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

      {/* ANTI-FRAUD & AUDIT LOG */}
      <div className="glass-card rounded-[32px] p-6 sm:p-7 border border-white shadow-sm space-y-3">
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

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                    tx.type === 'OWNER_GRANT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {tx.type === 'OWNER_GRANT' ? 'AGIH' : 'IMBAS'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {tx.type === 'OWNER_GRANT'
                      ? `Agihan Subsidi ke ${tx.memberName}`
                      : `${tx.memberName} ➔ ${tx.sellerName} (Gerai ${tx.stallNumber})`}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    ID: {tx.id} • {tx.timestamp} • {tx.note}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-slate-900">
                  RM {tx.amountRM.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {tx.amountPoints} Mata
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
