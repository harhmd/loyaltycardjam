import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface CameraQrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const CameraQrScanner: React.FC<CameraQrScannerProps> = ({
  onScanSuccess,
  onClose,
}) => {
  const [cameraError, setCameraError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'interactive-camera-qr-reader';
  const hasScannedRef = useRef(false);

  useEffect(() => {
    hasScannedRef.current = false;
    let isMounted = true;

    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setCameraError('');

        // Create scanner instance with QR format
        const scanner = new Html5Qrcode(containerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrCodeRef.current = scanner;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrEdge = Math.floor(minEdge * 0.72);
            return { width: qrEdge, height: qrEdge };
          },
          aspectRatio: 1.0,
        };

        // Prefer back camera ('environment') on mobile devices
        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            // Trigger success callback
            onScanSuccess(decodedText);

            // Stop camera smoothly
            scanner
              .stop()
              .catch((err) => console.warn('Scanner stop error:', err));
          },
          () => {
            // Frame scan failure is normal while camera searches for QR
          }
        );

        if (isMounted) {
          setIsInitializing(false);
          setHasPermission(true);
        }
      } catch (err: unknown) {
        console.error('Camera QR start error:', err);
        if (isMounted) {
          setIsInitializing(false);
          setHasPermission(false);
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
            setCameraError(
              'Akses kamera tidak dibenarkan. Sila benarkan kebenaran kamera dalam pelayar anda.'
            );
          } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
            setCameraError(
              'Tiada peranti kamera dikesan pada peranti ini. Anda boleh gunakan mod simulasi di bawah.'
            );
          } else {
            setCameraError(
              'Tidak dapat memulakan kamera. Sila pastikan tiada aplikasi lain yang sedang menggunakan kamera.'
            );
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => html5QrCodeRef.current?.clear())
            .catch((err) => console.warn('Cleanup stop error:', err));
        } else {
          try {
            html5QrCodeRef.current.clear();
          } catch (e) {
            // Ignore clear error
          }
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border-2 border-blue-500/50 shadow-inner">
      {/* Container where HTML5-QRCode mounts video stream */}
      <div id={containerId} className="w-full min-h-[280px]" />

      {/* Target Scanning Crosshair Overlay */}
      {!cameraError && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-300 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-300 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-300 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-300 rounded-br-lg"></div>

            {/* Scanning Laser Line */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-1/2 -translate-y-1/2 animate-bounce"></div>
          </div>

          <div className="mt-3 bg-black/75 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Halakan kamera ke Kod QR Gerai</span>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {isInitializing && !cameraError && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-white p-4">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-2" />
          <p className="text-xs font-bold text-slate-200">
            Sedang mengaktifkan kamera peranti...
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Sila tekan "Allow / Benarkan" jika diminta kebenaran kamera.
          </p>
        </div>
      )}

      {/* Error / Fallback display */}
      {cameraError && (
        <div className="p-6 text-center text-white flex flex-col items-center justify-center min-h-[240px] space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
            <CameraOff className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-rose-300">{cameraError}</p>
            <p className="text-[11px] text-slate-400">
              Jangan risau, anda masih boleh memilih gerai peniaga di bawah untuk meneruskan ujian sistem!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
