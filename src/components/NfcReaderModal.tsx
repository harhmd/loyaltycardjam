import React, { useState, useEffect, useRef } from 'react';
import { Member, Seller, EventLocation } from '../types';
import {
  isWebNfcSupported,
  startWebNfcScan,
  writeWebNfcTag,
  triggerNfcHaptic,
  ParsedNfcPayload,
} from '../utils/nfcUtils';
import { NfcContactlessIcon } from './AgroIcons';
import confetti from 'canvas-confetti';
import { playCashierChime } from '../store';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Radio,
  CreditCard,
  Store,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export type NfcModalMode =
  | 'SELLER_TAP_TO_PAY' // Seller scans buyer card to collect payment
  | 'BUYER_TAP_MERCHANT' // Buyer scans stall tag to buy
  | 'DIAGNOSTICS_AND_WRITE'; // Organiser/Member writes or reads card details

interface NfcReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: NfcModalMode;
  // Contextual data
  currentSeller?: Seller;
  currentMember?: Member;
  allMembers?: Member[];
  allSellers?: Seller[];
  events?: EventLocation[];
  presetAmountRM?: number;
  presetNote?: string;
  onPaymentSuccess?: (result: {
    member: Member;
    seller: Seller;
    amountRM: number;
    points: number;
    txnId: string;
  }) => void;
  onSelectStallFromNfc?: (seller: Seller) => void;
  onCardLinked?: (member: Member, cardSerial: string) => void;
}

export const NfcReaderModal: React.FC<NfcReaderModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentSeller,
  currentMember,
  allMembers = [],
  allSellers = [],
  events = [],
  presetAmountRM = 10.0,
  presetNote = 'Pembayaran Barangan Segar MADANI (Sentuh NFC)',
  onPaymentSuccess,
  onSelectStallFromNfc,
  onCardLinked,
}) => {
  const [hardwareSupported, setHardwareSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successData, setSuccessData] = useState<{
    title: string;
    description: string;
    serial?: string;
    points?: number;
    memberName?: string;
    sellerName?: string;
  } | null>(null);

  // For SELLER_TAP_TO_PAY custom amount input
  const [chargeAmountRM, setChargeAmountRM] = useState<number>(presetAmountRM);
  const [chargeNote, setChargeNote] = useState<string>(presetNote);

  // For DIAGNOSTICS_AND_WRITE
  const [targetWriteMemberId, setTargetWriteMemberId] = useState<string>(
    currentMember?.id || allMembers[0]?.id || 'MEM-001'
  );
  const [lastScannedPayload, setLastScannedPayload] = useState<ParsedNfcPayload | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHardwareSupported(isWebNfcSupported());
  }, []);

  // Start Web NFC hardware scan when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopScan();
      setSuccessData(null);
      setErrorMessage('');
      setStatusMessage('');
      return;
    }

    setChargeAmountRM(presetAmountRM);
    setChargeNote(presetNote);

    if (mode === 'SELLER_TAP_TO_PAY' || mode === 'BUYER_TAP_MERCHANT') {
      startHardwareScan();
    }

    return () => {
      stopScan();
    };
  }, [isOpen, mode]);

  const stopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
  };

  const startHardwareScan = async () => {
    stopScan();
    setErrorMessage('');
    if (!isWebNfcSupported()) {
      setStatusMessage(
        'Pelayar ini berada dalam mod Simulasi Web NFC. Anda boleh menguji sentuhan kad secara interaktif menggunakan pilihan di bawah.'
      );
      return;
    }

    setIsScanning(true);
    setStatusMessage('Sedia mengimbas. Sila sentuh kad NFC atau peranti...');

    const controller = await startWebNfcScan(
      (parsed, event) => {
        handleNfcPayloadReceived(parsed, event.serialNumber);
      },
      (err) => {
        console.warn('NFC Scan Notice:', err.message);
        setErrorMessage(err.message);
        setIsScanning(false);
      }
    );

    if (controller) {
      abortControllerRef.current = controller;
    }
  };

  // Handler for NFC payload (from real NFC tap or interactive simulation tap)
  const handleNfcPayloadReceived = (
    parsed: ParsedNfcPayload,
    serialNumber = '04:7B:A2:8E:91:20:80'
  ) => {
    triggerNfcHaptic('success');
    setLastScannedPayload({ ...parsed, serialNumber });

    if (mode === 'SELLER_TAP_TO_PAY') {
      // 1. Process Seller Tap-to-Pay
      let targetMem = allMembers.find(
        (m) =>
          m.id === parsed.memberId ||
          (parsed.cardId && m.cardId === parsed.cardId)
      );

      // Fallback if raw text matched an IC or Card ID
      if (!targetMem && parsed.raw) {
        targetMem = allMembers.find(
          (m) =>
            m.id === parsed.raw ||
            m.cardId === parsed.raw ||
            (m.icNumber && parsed.raw.includes(m.icNumber))
        );
      }

      if (!targetMem) {
        triggerNfcHaptic('error');
        setErrorMessage(
          `Kad NFC dikesan (UID: ${serialNumber}), tetapi ID Ahli ("${parsed.raw}") tidak berdaftar dalam sistem JAM.`
        );
        return;
      }

      // Check MyDigital ID requirement
      if (!targetMem.isMyDigitalIdVerified) {
        triggerNfcHaptic('error');
        setErrorMessage(
          `Kad Ahli ${targetMem.name} belum disahkan melalui MyDigital ID. Pengesahan identiti diperlukan terlebih dahulu.`
        );
        return;
      }

      // Check points balance
      const requiredPoints = Math.round(chargeAmountRM * 100);
      if (targetMem.points < requiredPoints) {
        triggerNfcHaptic('error');
        setErrorMessage(
          `Baki mata ${targetMem.name} (${targetMem.points} mata) tidak mencukupi untuk tolak bayaran ${requiredPoints} mata (RM ${chargeAmountRM.toFixed(
            2
          )}).`
        );
        return;
      }

      // Check active event expiry
      const activeEvt = events.find((e) => e.id === targetMem?.activeEventId);
      if (activeEvt && activeEvt.status === 'ENDED') {
        triggerNfcHaptic('error');
        setErrorMessage(
          `Acara bagi lokasi "${activeEvt.name}" telah tamat. Mata subsidi telah luput secara automatik.`
        );
        return;
      }

      // Execute payment callback
      const targetSeller = currentSeller || allSellers[0];
      const genTxnId = `TXN-NFC-${Math.floor(1000 + Math.random() * 9000)}`;

      if (onPaymentSuccess && targetSeller) {
        onPaymentSuccess({
          member: targetMem,
          seller: targetSeller,
          amountRM: chargeAmountRM,
          points: requiredPoints,
          txnId: genTxnId,
        });
      }

      playCashierChime();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setSuccessData({
        title: 'Pembayaran NFC Berjaya!',
        description: `Mata sebanyak ${requiredPoints} (RM ${chargeAmountRM.toFixed(
          2
        )}) telah berjaya ditolak daripada akaun kad ahli ${targetMem.name}.`,
        serial: serialNumber,
        points: requiredPoints,
        memberName: targetMem.name,
        sellerName: targetSeller?.businessName,
      });
    } else if (mode === 'BUYER_TAP_MERCHANT') {
      // 2. Buyer tapped a stall NFC puck / standee
      let targetStall = allSellers.find(
        (s) =>
          s.id === parsed.sellerId ||
          s.stallNumber === parsed.sellerId ||
          parsed.raw.includes(s.id)
      );

      if (!targetStall && parsed.raw) {
        targetStall = allSellers.find(
          (s) =>
            parsed.raw.includes(s.stallNumber) ||
            parsed.raw.includes(s.id) ||
            parsed.raw.includes(s.businessName)
        );
      }

      if (!targetStall) {
        triggerNfcHaptic('error');
        setErrorMessage(
          `Tag NFC dikesan (UID: ${serialNumber}), tetapi maklumat gerai ("${parsed.raw}") tidak sah.`
        );
        return;
      }

      if (onSelectStallFromNfc) {
        onSelectStallFromNfc(targetStall);
      }

      playCashierChime();
      setSuccessData({
        title: 'Gerai Berjaya Dikesan Melalui NFC!',
        description: `Telefon bersambung ke Gerai No: ${targetStall.stallNumber} (${targetStall.businessName}).`,
        serial: serialNumber,
        sellerName: targetStall.businessName,
      });

      setTimeout(() => {
        onClose();
      }, 1600);
    } else if (mode === 'DIAGNOSTICS_AND_WRITE') {
      // 3. Diagnostics scan
      playCashierChime();
      setStatusMessage(
        `Kad NFC Berjaya Dibaca! UID Kad: ${serialNumber} • Kandungan: ${parsed.raw || '(Kosong)'}`
      );
    }
  };

  // Write selected member credentials to a blank physical NFC card
  const handleWriteToNfcCard = async () => {
    const mem = allMembers.find((m) => m.id === targetWriteMemberId);
    if (!mem) return;

    const payload = `JAM-CARD:${mem.id}:${mem.cardId}`;
    setErrorMessage('');
    setIsWriting(true);
    setStatusMessage(
      'Sila sentuhkan kad NFC fizikal kosong ke belakang peranti sekarang...'
    );

    if (!isWebNfcSupported()) {
      // Simulate NFC write for desktop/iOS
      setTimeout(() => {
        setIsWriting(false);
        triggerNfcHaptic('success');
        playCashierChime();
        setStatusMessage(
          `[Mod Simulasi] Berjaya merakap payload "${payload}" ke Kad Fizikal NFC (Simulasi UID: 04:9A:88:F1:40:22:80).`
        );
        if (onCardLinked) {
          onCardLinked(mem, '04:9A:88:F1:40:22:80');
        }
      }, 1400);
      return;
    }

    const res = await writeWebNfcTag(payload);
    setIsWriting(false);
    if (res.success) {
      playCashierChime();
      confetti({ particleCount: 70, spread: 60 });
      setStatusMessage(res.message);
      if (onCardLinked) {
        onCardLinked(mem, 'PHYSICAL-NFC-TAG');
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto relative">
        
        {/* Header with High-Impact Gradient & NFC Pulse */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-blue-950 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center p-2 shadow-inner">
                <NfcContactlessIcon className="w-8 h-8 drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-black/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Web NFC Contactless
                  </span>
                  {hardwareSupported ? (
                    <span className="text-[9px] font-extrabold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/40">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> Perkakasan Aktif
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-400/40">
                      Mod Simulasi Aktif
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white tracking-tight mt-1">
                  {mode === 'SELLER_TAP_TO_PAY'
                    ? 'Terminal Sentuh Kad NFC (Tap to Pay)'
                    : mode === 'BUYER_TAP_MERCHANT'
                    ? 'Imbas Tag NFC Gerai Jualan'
                    : 'Stesen Pautan & Rakap Kad NFC JAM'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* SUCCESS SCREEN */}
          {successData ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  {successData.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {successData.description}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-1.5 font-mono">
                {successData.memberName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ahli Pembeli:</span>
                    <span className="font-bold text-slate-900">{successData.memberName}</span>
                  </div>
                )}
                {successData.sellerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gerai Penerima:</span>
                    <span className="font-bold text-slate-900">{successData.sellerName}</span>
                  </div>
                )}
                {successData.points && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mata Ditolak:</span>
                    <span className="font-bold text-emerald-600">{successData.points} Mata (RM {(successData.points / 100).toFixed(2)})</span>
                  </div>
                )}
                {successData.serial && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">UID Tag NFC:</span>
                    <span className="text-slate-600">{successData.serial}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSuccessData(null);
                  if (mode === 'BUYER_TAP_MERCHANT') {
                    onClose();
                  }
                }}
                className="w-full btn-gradient-blue text-white py-3.5 px-6 rounded-full font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Selesai / Imbas Kad Seterusnya
              </button>
            </div>
          ) : (
            <>
              {/* RADAR NFC SCANNER ANIMATION */}
              <div className="relative py-4 flex flex-col items-center justify-center">
                {/* Concentric Pulsing NFC Wave Rings */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-60"></div>
                  <div className="absolute w-28 h-28 rounded-full bg-teal-500/15 animate-pulse"></div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl flex items-center justify-center border-2 border-white relative z-10">
                    <NfcContactlessIcon className="w-10 h-10 text-white drop-shadow" />
                  </div>
                </div>

                <p className="mt-3 text-xs font-bold text-slate-700 text-center flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Sedia Mengimbas Kad Fizikal NFC JAM</span>
                </p>
                <p className="text-[11px] text-slate-500 text-center max-w-xs mt-0.5">
                  Rapatkan kad fizikal atau bahagian antena NFC telefon pintar di kawasan pengimbas peranti anda.
                </p>
              </div>

              {/* SELLER MODE: SET AMOUNT TO CHARGE */}
              {mode === 'SELLER_TAP_TO_PAY' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-blue-900">Jumlah Bayaran (RM):</span>
                    <span className="font-mono font-bold text-blue-700">
                      = {Math.round(chargeAmountRM * 100)} Mata Subsidi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        RM
                      </span>
                      <input
                        type="number"
                        step="0.50"
                        min="1"
                        value={chargeAmountRM}
                        onChange={(e) => setChargeAmountRM(parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-3 py-2 bg-white rounded-xl border border-blue-300 font-mono font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* Quick amount pills */}
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 20].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setChargeAmountRM(amt)}
                          className={`text-[10px] font-black px-2.5 py-2 rounded-xl transition cursor-pointer ${
                            chargeAmountRM === amt
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          RM{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={chargeNote}
                    onChange={(e) => setChargeNote(e.target.value)}
                    placeholder="Catatan jualan (contoh: Ayam Segar 1 Ekor)"
                    className="w-full px-3 py-1.5 text-[11px] bg-white rounded-xl border border-blue-200 text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              )}

              {/* MESSAGES / ALERTS */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{errorMessage}</span>
                </div>
              )}

              {statusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{statusMessage}</span>
                </div>
              )}

              {/* INTERACTIVE TAP SIMULATION (Works everywhere for testing and desktop/iOS) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {mode === 'BUYER_TAP_MERCHANT'
                      ? 'Simulasi Sentuhan Tag Gerai (Tap Stall Tag)'
                      : 'Simulasi Sentuhan Kad Ahli Fizikal (Tap Card)'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    1-Klik Ujian
                  </span>
                </div>

                {mode === 'BUYER_TAP_MERCHANT' ? (
                  /* Buyer taps stall tags */
                  <div className="grid grid-cols-2 gap-2">
                    {allSellers.map((seller) => (
                      <button
                        key={seller.id}
                        type="button"
                        onClick={() =>
                          handleNfcPayloadReceived(
                            {
                              raw: `JAM-MERCHANT:${seller.id}`,
                              type: 'STALL_TAG',
                              sellerId: seller.id,
                            },
                            `04:88:B1:${seller.stallNumber}:A1`
                          )
                        }
                        className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition cursor-pointer group shadow-2xs"
                      >
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          Gerai {seller.stallNumber}
                        </span>
                        <span className="text-xs font-black text-slate-900 block truncate group-hover:text-emerald-900">
                          {seller.businessName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                          [Sentuh Tag NFC]
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Seller scans member card */
                  <div className="space-y-1.5">
                    {allMembers.slice(0, 3).map((mem) => {
                      const isExpired = mem.points === 0 && mem.expiredPointsTotal! > 0;
                      return (
                        <button
                          key={mem.id}
                          type="button"
                          onClick={() =>
                            handleNfcPayloadReceived(
                              {
                                raw: `JAM-CARD:${mem.id}:${mem.cardId}`,
                                type: 'MEMBER_CARD',
                                memberId: mem.id,
                                cardId: mem.cardId,
                              },
                              `04:5A:CC:${mem.id}:E4`
                            )
                          }
                          className="w-full p-2.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition cursor-pointer flex items-center justify-between shadow-2xs group"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                            <div>
                              <span className="text-xs font-black text-slate-900 block">
                                {mem.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                No Kad: {mem.cardId} • {mem.phone}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs font-black font-mono block ${
                                isExpired
                                  ? 'text-rose-600'
                                  : mem.points > 0
                                  ? 'text-emerald-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {mem.points.toLocaleString()} Mata
                            </span>
                            <span className="text-[9px] text-slate-400">
                              (RM {(mem.points / 100).toFixed(2)})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* WRITE TO CARD OPTION (If in DIAGNOSTICS mode or allowed) */}
              {mode === 'DIAGNOSTICS_AND_WRITE' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-black text-amber-900">
                      Rakap / Tulis Akaun Ahli ke Kad Fizikal NFC Kosong
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Pilih profil ahli untuk dirakap ke cip kad NFC fizikal (NXP Mifare Ultralight / NTAG213/215/216) bagi kegunaan pembeli tanpa telefon pintar:
                  </p>
                  <select
                    value={targetWriteMemberId}
                    onChange={(e) => setTargetWriteMemberId(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    {allMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.cardId} - {m.points} Mata)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isWriting}
                    onClick={handleWriteToNfcCard}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isWriting ? 'animate-spin' : ''}`} />
                    <span>{isWriting ? 'Menulis ke Kad...' : 'Tulis / Format Kad Fizikal NFC'}</span>
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Layers className="w-3.5 h-3.5 text-emerald-600" /> W3C Web NFC API Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 rounded-full font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
