import React, { useState } from 'react';
import { EventLocation, Member } from '../types';
import {
  MapPin,
  Clock,
  Sparkles,
  Gift,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Users,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCashierChime } from '../store';

interface ClaimPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: Member;
  events: EventLocation[];
  onClaimEventPoints: (
    eventId: string,
    event: EventLocation
  ) => { success: boolean; message: string };
}

export const ClaimPointsModal: React.FC<ClaimPointsModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  events,
  onClaimEventPoints,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events.find((e) => e.status === 'ACTIVE')?.id || events[0]?.id || ''
  );
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'SUCCESS' | 'ERROR';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Check if member already claimed for this event
  const isAlreadyClaimed = currentMember.claimedEvents?.some(
    (ce) => ce.eventId === selectedEvent?.id
  );

  // Check if quota has been fully exhausted on first-come, first-served basis
  const isSelectedQuotaExhausted =
    selectedEvent && selectedEvent.claimedCount >= selectedEvent.totalQuota;
  const selectedRemainingQuota = selectedEvent
    ? Math.max(0, selectedEvent.totalQuota - selectedEvent.claimedCount)
    : 0;

  const handleClaim = () => {
    if (!selectedEvent) return;
    setFeedbackMsg(null);

    if (isSelectedQuotaExhausted) {
      setFeedbackMsg({
        type: 'ERROR',
        text: `Maaf, kuota subsidi (${selectedEvent.totalQuota.toLocaleString()} penerima) bagi lokasi "${selectedEvent.name}" telah habis ditebus sepenuhnya berdasarkan giliran terawal (First-Come, First-Served).`,
      });
      return;
    }

    const res = onClaimEventPoints(selectedEvent.id, selectedEvent);
    if (res.success) {
      playCashierChime();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 },
      });
      setFeedbackMsg({ type: 'SUCCESS', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setFeedbackMsg({ type: 'ERROR', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto relative">
        
        {/* Header with Luxury Agro MADANI Green & Gold Gradient */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-md">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-black/30 px-2 py-0.5 rounded-full border border-amber-300/30">
                  Subsidi Khas Pembeli MADANI
                </span>
                <h3 className="text-base font-black text-white tracking-tight leading-tight mt-1">
                  Tuntut Mata Subsidi Jualan Agro MADANI
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-slate-300 uppercase font-medium">Ahli Penerima (MyDigital ID):</p>
              <p className="font-extrabold text-white text-xs">{currentMember.name}</p>
              <p className="text-[10px] font-mono text-amber-300">MyKad: {currentMember.icNumber || '850412-10-5432'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 font-bold block">Nilai Bantuan:</span>
              <span className="text-lg font-black text-amber-300 font-mono">RM 10.00</span>
              <span className="text-[10px] text-slate-300 block">(1,000 Mata)</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" /> Pilih Lokasi Acara Yang Diluluskan:
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                1 Tuntutan per MyKad per Lokasi
              </span>
            </div>

            {/* List of Approved Event Locations */}
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {events.map((evt) => {
                const isSelected = selectedEventId === evt.id;
                const isClaimedByMe = currentMember.claimedEvents?.some(
                  (ce) => ce.eventId === evt.id
                );
                const remaining = Math.max(0, evt.totalQuota - evt.claimedCount);
                const isExhausted = remaining === 0;
                const percent = Math.min(
                  100,
                  Math.round((evt.claimedCount / evt.totalQuota) * 100)
                );

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? isExhausted
                          ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/20'
                          : 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                        : isExhausted
                        ? 'bg-slate-50/90 border-slate-200 opacity-90'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {evt.name}
                          </h4>
                          {evt.status === 'ENDED' ? (
                            <span className="text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full uppercase">
                              Acara Selesai (Luput)
                            </span>
                          ) : isExhausted ? (
                            <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase shadow-2xs">
                              Kuota Habis (Penuh)
                            </span>
                          ) : evt.status === 'ACTIVE' ? (
                            <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full uppercase animate-pulse">
                              Sedang Berlangsung
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full uppercase">
                              Akan Datang
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{evt.venue}</span>
                        </p>

                        {/* Quota Progress Bar & Remaining Counter */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1 font-mono text-slate-500">
                              <Clock className="w-3 h-3 text-emerald-600" /> {evt.dateStr} • {evt.startTime} - {evt.endTime}
                            </span>
                            <span
                              className={`font-black font-mono ${
                                isExhausted
                                  ? 'text-rose-600'
                                  : remaining <= 50
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {isExhausted
                                ? `Kuota Penuh: ${evt.claimedCount}/${evt.totalQuota}`
                                : `Baki: ${remaining.toLocaleString()} Kuota (${percent}%)`}
                            </span>
                          </div>

                          {/* Linear visual bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isExhausted
                                  ? 'bg-rose-600'
                                  : remaining <= 50
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Selection radio / checkmark */}
                      <div className="shrink-0 self-center">
                        {isClaimedByMe ? (
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Dituntut
                          </span>
                        ) : isSelected ? (
                          <div
                            className={`w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs ${
                              isExhausted ? 'bg-rose-600' : 'bg-emerald-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Rule Callout Note (Explicit First-Come, First-Served & Expiry) */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Timer className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Prinsip Giliran Terawal (First-Come, First-Served):</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              1. Setiap lokasi acara mempunyai <strong>kuota subsidi terhad</strong>. Sekiranya kuota telah habis ditebus sepenuhnya, pengguna seterusnya <strong>tidak dapat lagi menuntut mata</strong> di lokasi tersebut.
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              2. Mata hanya sah digunakan semasa acara di lokasi ini sedang berlangsung. Sebaik waktu acara tamat ({selectedEvent?.endTime || '18:00'}), sebarang baki mata akan <strong>dilupuskan secara automatik</strong>.
            </p>
          </div>

          {feedbackMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedbackMsg.type === 'SUCCESS'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border border-rose-300 text-rose-900'
              }`}
            >
              {feedbackMsg.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleClaim}
              disabled={
                selectedEvent?.status !== 'ACTIVE' ||
                isAlreadyClaimed ||
                isSelectedQuotaExhausted
              }
              className={`w-full py-4 px-5 rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                selectedEvent?.status === 'ACTIVE' &&
                !isAlreadyClaimed &&
                !isSelectedQuotaExhausted
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-600/30 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isAlreadyClaimed
                  ? 'Mata Telah Dituntut Bagi Lokasi Ini'
                  : isSelectedQuotaExhausted
                  ? 'Kuota Subsidi Telah Habis Ditebus (First-Come, First-Served)'
                  : selectedEvent?.status === 'ENDED'
                  ? 'Acara Telah Tamat (Tuntutan Ditutup)'
                  : selectedEvent?.status === 'UPCOMING'
                  ? 'Acara Belum Bermula'
                  : `Tuntut 1,000 Mata (RM ${selectedEvent.subsidyAmountRM.toFixed(
                      2
                    )}) Sekarang • Baki ${selectedRemainingQuota} Kuota`}
              </span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
