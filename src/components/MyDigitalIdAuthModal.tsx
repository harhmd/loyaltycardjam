import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Smartphone,
  QrCode,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Lock,
  RefreshCw,
  UserCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCashierChime } from '../store';

interface MyDigitalIdAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (userData: {
    nama: string;
    nric: string;
    phone: string;
    memberId?: string;
  }) => void;
}

export const MyDigitalIdAuthModal: React.FC<MyDigitalIdAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
}) => {
  const [authMethod, setAuthMethod] = useState<'QR' | 'DEEP_LINK'>('QR');
  const [nonce, setNonce] = useState<string>(
    `NONCE-MYDID-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<string>('SITI');
  const [customNama, setCustomNama] = useState<string>('');
  const [customNric, setCustomNric] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('01');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Countdown timer for OIDC session nonce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleRefreshNonce = () => {
    setNonce(`NONCE-MYDID-${Math.floor(100000 + Math.random() * 900000)}`);
    setCountdown(300);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const personas = [
    {
      id: 'SITI',
      memberId: 'MEM-001',
      nama: 'Puan Siti Norhaliza binti Daud',
      nric: '850412-10-5432',
      phone: '012-3849102',
      tag: 'Pengguna Sedia Ada (Putrajaya)',
    },
    {
      id: 'SARAH',
      memberId: 'MEM-003',
      nama: 'Siti Sarah binti Razak',
      nric: '901103-08-6044',
      phone: '017-6421908',
      tag: 'Pengguna Baru (Belum Tuntut Mata)',
    },
    {
      id: 'SAMAD',
      memberId: 'MEM-002',
      nama: 'Encik Samad bin Hassan',
      nric: '780220-14-5123',
      phone: '019-8237194',
      tag: 'Pengguna Lokasi Selayang (Tamat Masa)',
    },
    {
      id: 'CUSTOM',
      memberId: undefined,
      nama: customNama || 'Warga MADANI Baru',
      nric: customNric || '950810-14-5544',
      phone: customPhone || '013-9988776',
      tag: 'Daftar Sendiri No. MyKad',
    },
  ];

  const currentProfile = personas.find((p) => p.id === selectedPersona) || personas[0];

  // Simulated 3-Way Handshake as documented in MyID Access Integration Guide
  const handleSimulateHandshake = () => {
    setErrorMsg('');
    if (selectedPersona === 'CUSTOM') {
      if (!customNama.trim()) {
        setErrorMsg('Sila masukkan Nama penuh mengikut MyKad.');
        return;
      }
      if (!customNric.trim() || customNric.length < 12) {
        setErrorMsg('Sila masukkan No. MyKad yang sah (12 digit).');
        return;
      }
    }

    setIsVerifying(true);
    setVerifyStep('Menyambung ke MyID Access Server (OIDC IdP)...');

    setTimeout(() => {
      setVerifyStep('Memeriksa sijil digital X.509 melalui penyedia OCSP...');
    }, 700);

    setTimeout(() => {
      setVerifyStep('Mengesahkan tandatangan kriptografi & biometrik peranti...');
    }, 1400);

    setTimeout(() => {
      setVerifyStep('Mengeluarkan token JWT & tuntutan NRIC/Nama sah...');
    }, 2000);

    setTimeout(() => {
      setIsVerifying(false);
      playCashierChime();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
      });

      onAuthenticate({
        nama: currentProfile.nama,
        nric: currentProfile.nric,
        phone: currentProfile.phone,
        memberId: currentProfile.memberId,
      });
      onClose();
    }, 2600);
  };

  if (!isOpen) return null;

  const oidcQrPayload = `mydigitalid://oidc/authorize?client_id=jam-loyalty-client&scope=openid+profile+nric&response_type=code&redirect_uri=https://loyaltycardjam.65-75-201-219.sslip.io/auth/callback&nonce=${nonce}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto relative">
        
        {/* Top Header with Official MyDigital ID Branding */}
        <div className="bg-gradient-to-r from-[#002f6c] via-[#004b99] to-[#0070ba] text-white p-5 sm:p-6 relative overflow-hidden">
          {/* Subtle geometric pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              {/* MyDigital ID Emulated Official Emblem */}
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                <span className="text-[#002f6c] font-black tracking-tight text-base leading-none">my</span>
                <span className="text-[#004b99] font-black tracking-tight text-base leading-none">digital</span>
                <span className="bg-cyan-500 text-white font-black px-1.5 py-0.5 rounded text-xs leading-none">ID</span>
              </div>
              <div className="border-l border-white/20 pl-2.5">
                <p className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider">
                  Identiti Digital Nasional Malaysia
                </p>
                <h3 className="text-sm font-extrabold text-white tracking-tight leading-tight">
                  Log Masuk Tunggal (SSO)
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

          <p className="text-xs text-blue-100/90 mt-3 relative z-10 leading-relaxed">
            Sistem pengesahan identiti rasmi berasaskan <strong>OpenID Connect (OIDC)</strong> dan sijil digital X.509 untuk warganegara Malaysia mengakses kad loyaliti subsidi JAM.
          </p>

          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[10px] text-cyan-200">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-300" /> Tahap Keselamatan: Kerajaan Malaysia (PP26400)
            </span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded">
              OCSP Verified
            </span>
          </div>
        </div>

        {/* Verification Animation Overlay (When Authenticating) */}
        {isVerifying ? (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-cyan-400 flex items-center justify-center text-blue-600 animate-pulse shadow-lg shadow-cyan-500/20">
                <Fingerprint className="w-10 h-10 text-cyan-600 animate-bounce" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-600 animate-spin"></div>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 tracking-tight">
                Pengesahan 3-Way Handshake
              </h4>
              <p className="text-xs text-blue-600 font-medium mt-1 font-mono">
                {verifyStep}
              </p>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full animate-[shimmer_1.5s_infinite] w-full"></div>
            </div>

            <p className="text-[11px] text-slate-400">
              Sila tunggu sebentar sementara identiti MyKad anda disahkan oleh pelayan MyDigital ID.
            </p>
          </div>
        ) : (
          /* Normal Flow: QR Handshake or Deep Link */
          <div className="p-5 sm:p-6 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMethod('QR')}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === 'QR'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-blue-600" /> Imbas Kod QR (Web)
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('DEEP_LINK')}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === 'DEEP_LINK'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4 text-cyan-600" /> Buka Aplikasi MyID
              </button>
            </div>

            {authMethod === 'QR' ? (
              /* QR Code Handshake for Desktop/Laptop/Tablet */
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 border border-slate-200/90 rounded-3xl p-4">
                <div className="relative p-3 bg-white rounded-2xl border-2 border-blue-600/30 shadow-md shrink-0">
                  <QRCodeSVG
                    value={oidcQrPayload}
                    size={140}
                    level="H"
                    fgColor="#002f6c"
                  />
                  <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-2xl pointer-events-none animate-ping opacity-25"></div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 bg-blue-100/70 text-blue-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    <RefreshCw className="w-3 h-3 text-blue-600" />
                    <span>Sesi Tamat: <strong className="font-mono text-blue-950">{formattedTime}</strong></span>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">
                    Imbas dengan Aplikasi Mudah Alih MyDigital ID
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Buka aplikasi <strong>MyDigital ID</strong> pada telefon pintar anda, tekan butang <strong>"Imbas Kod"</strong> dan halakan kamera ke kod QR ini.
                  </p>

                  <button
                    type="button"
                    onClick={handleRefreshNonce}
                    className="text-[10px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Jana Semula Kod Sesi
                  </button>
                </div>
              </div>
            ) : (
              /* Deep Link App Presence Option */
              <div className="space-y-3 bg-cyan-50/60 border border-cyan-200 rounded-3xl p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 leading-tight">
                      Pautan Terus Aplikasi (Mobile Deep-Link)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Sistem akan melancarkan aplikasi berdaftar melalui skema <code>mydigitalid://</code> untuk pengesahan biometrik segera pada telefon anda.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-cyan-200/80 text-[11px] text-slate-700">
                  <span className="font-bold text-cyan-900">Nota Keserasian:</span> Jika peranti anda belum memasang aplikasi, anda perlu memuat turun MyDigital ID daripada Google Play Store atau Apple App Store.
                </div>
              </div>
            )}

            {/* Persona Selector for Live Demo & Verification */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Pilih Profil Warganegara (Ujian SSO):
                </label>
                <span className="text-[10px] text-slate-400">Pilihan Simulasi Rasmi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersona(p.id)}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedPersona === p.id
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {p.nama}
                        </span>
                        {selectedPersona === p.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        MyKad: {p.nric}
                      </p>
                    </div>
                    <span className="text-[9px] font-semibold text-blue-700 mt-1">
                      {p.tag}
                    </span>
                  </button>
                ))}
              </div>

              {selectedPersona === 'CUSTOM' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 mt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Nama Penuh Mengikut MyKad:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ahmad bin Ismail"
                      value={customNama}
                      onChange={(e) => setCustomNama(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">No. MyKad (12 Digit):</label>
                      <input
                        type="text"
                        placeholder="890101-14-1234"
                        value={customNric}
                        onChange={(e) => setCustomNric(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700">No. Telefon Bimbit:</label>
                      <input
                        type="text"
                        placeholder="012-3456789"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CTA Trigger 3-Way Handshake */}
            <button
              type="button"
              onClick={handleSimulateHandshake}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#002f6c] via-[#004b99] to-[#0070ba] hover:from-[#002555] hover:to-[#005e9e] text-white rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-cyan-300" />
              <span>Sahkan Pengesahan MyDigital ID & Log Masuk</span>
              <ChevronRight className="w-4 h-4 ml-auto text-cyan-200" />
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>MIMOS Berhad • My Digital ID Sdn. Bhd.</span>
              <span className="font-mono">Client ID: jam-loyalty-app</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
