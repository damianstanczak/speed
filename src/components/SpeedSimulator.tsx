import React, { useRef, useEffect } from 'react';
import { OsmRoadInfo } from '../types';
import { Gauge, Play, ShieldAlert, AlertTriangle, Sparkles } from 'lucide-react';

interface SpeedSimulatorProps {
  currentSpeed: number;
  setCurrentSpeed: (speed: number | ((prev: number) => number)) => void;
  isSimulated: boolean;
  setIsSimulated: (val: boolean) => void;
  roadInfo: OsmRoadInfo;
  setRoadInfo: (info: OsmRoadInfo) => void;
}

const PRESET_ROADS: { name: string; ref?: string; limit: number; type: string; isUrban: boolean }[] = [
  { name: 'Warszawa, Marszałkowska', ref: 'DW634', limit: 50, type: 'residential', isUrban: true },
  { name: 'Autostrada A2 (Warszawa - Łódź)', ref: 'A2', limit: 140, type: 'motorway', isUrban: false },
  { name: 'Trasa Toruńska S8', ref: 'S8', limit: 120, type: 'trunk', isUrban: false },
  { name: 'Droga Krajowa nr 7', ref: 'DK7', limit: 90, type: 'primary', isUrban: false },
  { name: 'Warszawa, Stare Miasto (Strefa zamieszkania)', limit: 20, type: 'living_street', isUrban: true },
  { name: 'Strefa Tempo 30 (Centrum)', limit: 30, type: 'residential', isUrban: true },
  { name: 'Wisłostrada (odcinek podwyższony)', ref: 'DW637', limit: 70, type: 'primary', isUrban: true },
];

export const SpeedSimulator: React.FC<SpeedSimulatorProps> = ({
  currentSpeed,
  setCurrentSpeed,
  isSimulated,
  setIsSimulated,
  roadInfo,
  setRoadInfo,
}) => {
  const pedalIntervalRef = useRef<number | null>(null);

  const startPedal = (delta: number) => {
    if (!isSimulated) setIsSimulated(true);
    if (pedalIntervalRef.current) clearInterval(pedalIntervalRef.current);

    pedalIntervalRef.current = window.setInterval(() => {
      setCurrentSpeed((prev) => {
        const next = Math.max(0, Math.min(230, prev + delta));
        return Math.round(next * 10) / 10;
      });
    }, 60);
  };

  const stopPedal = () => {
    if (pedalIntervalRef.current) {
      clearInterval(pedalIntervalRef.current);
      pedalIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPedal();
  }, []);

  const setTestScenario = (speed: number, roadIndex: number) => {
    setIsSimulated(true);
    setCurrentSpeed(speed);
    const targetRoad = PRESET_ROADS[roadIndex];
    if (targetRoad) {
      setRoadInfo({
        name: targetRoad.name,
        ref: targetRoad.ref,
        highwayType: targetRoad.type,
        maxspeed: targetRoad.limit,
        source: 'manual-override',
        isUrban: targetRoad.isUrban,
      });
    }
  };

  return (
    <div id="simulator-container" className="w-full max-w-md mx-auto p-4 space-y-3 font-mono">
      {/* Przełącznik trybu telemetrycznego */}
      <div className="bg-black border border-[#1a1a1a] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black border border-[#FF4F00] text-[#FF4F00]">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                SIMULATION / KALIBRACJA
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-tight">
                Tryb testu wskaźnika i sygnałów alarmowych
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="toggle-simulator-switch"
              type="checkbox"
              checked={isSimulated}
              onChange={(e) => setIsSimulated(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-[#1a1a1a] border border-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF4F00] peer-checked:border-[#FF4F00]"></div>
          </label>
        </div>
      </div>

      {/* Szybkie testy scenariuszy */}
      <div className="bg-black border border-[#1a1a1a] rounded-2xl p-4 shadow-lg space-y-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
          <Play className="w-3 h-3 text-[#FF4F00]" /> SCENARIUSZE TESTOWE
        </h4>

        <div className="grid grid-cols-1 gap-2 text-left">
          {/* Test Utraty Prawka: 105 km/h przy limicie 50 */}
          <button
            id="preset-loss-urban"
            onClick={() => setTestScenario(105, 0)}
            className="p-3 rounded-xl border border-[#FF4F00]/50 bg-black hover:bg-[#FF4F00]/10 transition text-left flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#FF4F00]">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <span>TEST: UTRATA PRAWA JAZDY (+55 KM/H)</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Limit 50 km/h → Prędkość 105 km/h (1500 PLN, 13 PKT)
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF4F00] bg-black px-2 py-1 rounded border border-[#FF4F00]">
              105 KM/H
            </span>
          </button>

          {/* Test Utraty Prawka na Autostradzie: 195 km/h przy limicie 140 */}
          <button
            id="preset-loss-motorway"
            onClick={() => setTestScenario(195, 1)}
            className="p-3 rounded-xl border border-[#1f1f1f] bg-black hover:border-[#FF4F00] transition text-left flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF4F00]" />
                <span>AUTOSTRADA A2: +55 KM/H PONAD LIMIT</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Limit 140 km/h → Prędkość 195 km/h (1500 PLN, 13 PKT)
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-300 bg-[#0c0c0c] px-2 py-1 rounded border border-[#222]">
              195 KM/H
            </span>
          </button>

          {/* Umiarkowane przekroczenie: 68 km/h przy limicie 50 */}
          <button
            id="preset-moderate-speeding"
            onClick={() => setTestScenario(68, 0)}
            className="p-3 rounded-xl border border-[#1f1f1f] bg-black hover:border-[#333] transition text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-xs text-zinc-300">
                PRZEKROCZENIE O +18 KM/H (200 PLN, 3 PKT)
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Limit 50 km/h → Prędkość 68 km/h
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF4F00] bg-[#0c0c0c] px-2 py-1 rounded border border-[#222]">
              68 KM/H
            </span>
          </button>

          {/* Jazda przepisowa */}
          <button
            id="preset-legal-speed"
            onClick={() => setTestScenario(48, 0)}
            className="p-3 rounded-xl border border-[#1f1f1f] bg-black hover:border-[#333] transition text-left flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                <span>JAZDA PRZEPISOWA (BRAK MANDATU)</span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Limit 50 km/h → Prędkość 48 km/h
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400 bg-[#0c0c0c] px-2 py-1 rounded border border-[#222]">
              48 KM/H
            </span>
          </button>
        </div>
      </div>

      {/* Suwak regulacji prędkości */}
      <div className="bg-black border border-[#1a1a1a] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
            SUWAK PRĘDKOŚCI
          </span>
          <span className="text-xl font-mono font-black text-[#FF4F00]">
            {Math.round(currentSpeed)} <span className="text-xs">KM/H</span>
          </span>
        </div>

        <input
          id="manual-speed-slider"
          type="range"
          min="0"
          max="220"
          value={Math.round(currentSpeed)}
          onChange={(e) => {
            if (!isSimulated) setIsSimulated(true);
            setCurrentSpeed(parseInt(e.target.value, 10));
          }}
          className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
        />

        <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
          <span>0</span>
          <span>50</span>
          <span>90</span>
          <span>120</span>
          <span>140</span>
          <span>200+ KM/H</span>
        </div>

        {/* Pedały Gazu i Hamulca */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            id="pedal-brake-btn"
            onMouseDown={() => startPedal(-3.5)}
            onMouseUp={stopPedal}
            onMouseLeave={stopPedal}
            onTouchStart={() => startPedal(-3.5)}
            onTouchEnd={stopPedal}
            className="py-3 px-3 bg-black hover:bg-[#0d0d0d] active:bg-[#141414] rounded-xl font-mono font-bold text-xs text-zinc-300 flex items-center justify-center gap-1.5 border border-[#222] select-none"
          >
            🛑 HAMULEC
          </button>

          <button
            id="pedal-gas-btn"
            onMouseDown={() => startPedal(3)}
            onMouseUp={stopPedal}
            onMouseLeave={stopPedal}
            onTouchStart={() => startPedal(3)}
            onTouchEnd={stopPedal}
            className="py-3 px-3 bg-[#FF4F00] hover:bg-[#ff631c] active:bg-[#e04500] rounded-xl font-mono font-bold text-xs text-black flex items-center justify-center gap-1.5 select-none shadow-[0_0_15px_rgba(255,79,0,0.4)]"
          >
            ⚡ PEDAŁ GAZU
          </button>
        </div>
      </div>

      {/* Wybór drogi testowej */}
      <div className="bg-black border border-[#1a1a1a] rounded-2xl p-4 shadow-lg space-y-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
          WYBIERZ DROGĘ (LIMIT)
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_ROADS.map((road, idx) => (
            <button
              key={idx}
              id={`road-preset-${idx}`}
              onClick={() => {
                setRoadInfo({
                  name: road.name,
                  ref: road.ref,
                  highwayType: road.type,
                  maxspeed: road.limit,
                  source: 'manual-override',
                  isUrban: road.isUrban,
                });
              }}
              className={`p-2.5 rounded-xl border text-left text-xs transition ${
                roadInfo.maxspeed === road.limit && roadInfo.name === road.name
                  ? 'border-[#FF4F00] bg-black text-[#FF4F00]'
                  : 'border-[#1a1a1a] bg-black text-zinc-400 hover:border-[#333]'
              }`}
            >
              <div className="font-bold flex items-center justify-between font-mono">
                <span>{road.limit} KM/H</span>
                {road.ref && (
                  <span className="text-[9px] bg-[#111] px-1 rounded text-zinc-500 border border-[#222]">
                    {road.ref}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 truncate mt-0.5">{road.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
