import React, { useState } from 'react';
import { Smartphone, X, Gauge } from 'lucide-react';

interface IosHeaderProps {
  isGpsActive: boolean;
  accuracy: number | null;
  currentRoadName?: string;
}

export const IosHeader: React.FC<IosHeaderProps> = ({
  isGpsActive,
  accuracy,
}) => {
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);

  return (
    <header
      id="ios-status-header"
      className="sticky top-0 z-30 w-full bg-black/95 backdrop-blur border-b border-[#141414] px-4 pt-[max(env(safe-area-inset-top),0.5rem)] pb-2.5 select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Pascal-inspired minimalist instrument header */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black border border-[#FF4F00] flex items-center justify-center text-[#FF4F00] shadow-[0_0_10px_rgba(255,79,0,0.3)]">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-mono font-bold tracking-[0.15em] text-white uppercase flex items-center gap-1.5">
              <span>VELOCITY</span>
              <span className="text-[9px] font-mono font-black text-[#FF4F00] px-1.5 py-0.2 rounded bg-[#FF4F00]/10 border border-[#FF4F00]/30">
                INSTRUMENT
              </span>
            </h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              {isGpsActive
                ? accuracy
                  ? `GPS ±${Math.round(accuracy)}M`
                  : 'GPS ACTIVE'
                : 'DEMO TELEMETRY'}
            </p>
          </div>
        </div>

        {/* Instrukcja instalacji na iOS */}
        <button
          id="ios-install-guide-btn"
          onClick={() => setShowIosInstallGuide(true)}
          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-300 bg-black border border-[#1f1f1f] hover:border-[#FF4F00] px-2.5 py-1.5 rounded-full transition"
        >
          <Smartphone className="w-3 h-3 text-[#FF4F00]" />
          <span>iOS INSTALL</span>
        </button>
      </div>

      {/* MODAL INSTRUKCJI INSTALACJI NA IPHONE */}
      {showIosInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-black border border-[#222222] rounded-3xl p-5 shadow-[0_0_50px_rgba(255,79,0,0.15)] text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#FF4F00]" />
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-white">
                  Instalacja na iOS (Safari PWA)
                </h3>
              </div>
              <button
                onClick={() => setShowIosInstallGuide(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white bg-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Zainstaluj jako pełnoekranową natywną aplikację z czarnym interfejsem OLED i
              pomarańczowymi akcentami:
            </p>

            <ol className="space-y-2.5 text-xs font-mono text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF4F00] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>Otwórz w <strong>Safari</strong> na swoim iPhone.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF4F00] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>Dotknij ikony <strong>Udostępnij</strong> (kwadrat ze strzałką w górę).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF4F00] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>Wybierz <strong>„Do ekranu początkowego”</strong> (Add to Home Screen).</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#FF4F00] hover:bg-[#ff631c] font-mono font-bold text-xs text-black uppercase tracking-wider transition"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
