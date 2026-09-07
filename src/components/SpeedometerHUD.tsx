import React, { useEffect } from 'react';
import { OsmRoadInfo, SpeedFineResult } from '../types';
import { SpeedSign } from './SpeedSign';
import { playOverspeedWarning, playLicenseLossAlarm } from '../services/audioAlert';
import { MapPin, AlertTriangle, ShieldAlert, Volume2, VolumeX, Eye, RefreshCw } from 'lucide-react';

interface SpeedometerHUDProps {
  currentSpeed: number;
  roadInfo: OsmRoadInfo;
  fineResult: SpeedFineResult;
  isRecidivism: boolean;
  setIsRecidivism: (val: boolean) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  isHudMirrored: boolean;
  setIsHudMirrored: (val: boolean) => void;
  isGpsActive: boolean;
  onRefreshOsm: () => void;
  isOsmLoading: boolean;
}

export const SpeedometerHUD: React.FC<SpeedometerHUDProps> = ({
  currentSpeed,
  roadInfo,
  fineResult,
  isRecidivism,
  setIsRecidivism,
  isMuted,
  setIsMuted,
  isHudMirrored,
  setIsHudMirrored,
  isGpsActive,
  onRefreshOsm,
  isOsmLoading,
}) => {
  const roundedSpeed = Math.max(0, Math.round(currentSpeed));
  const limit = roadInfo.maxspeed;
  const excess = roundedSpeed - limit;
  const isOverLimit = excess > 0;
  const isLicenseLoss = excess >= 50;

  // Dźwiękowe powiadomienia
  useEffect(() => {
    if (isLicenseLoss) {
      playLicenseLossAlarm();
    } else if (isOverLimit) {
      playOverspeedWarning();
    }
  }, [isLicenseLoss, isOverLimit, roundedSpeed]);

  // Generowanie kresek tarczy instrumentu (barometer / precision dial marks)
  const totalTicks = 48;
  const speedPercentage = Math.min(roundedSpeed / 200, 1);
  const activeTicksCount = Math.round(speedPercentage * totalTicks);

  return (
    <div
      id="speedometer-screen"
      className={`relative w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-130px)] px-4 py-2 transition-all duration-300 bg-black text-white ${
        isHudMirrored ? 'scale-x-[-1]' : ''
      }`}
    >
      {/* GÓRNY PASEK KONTROLNY INSTRUMENTU (Pascal minimalist telemetry) */}
      <div className="w-full flex items-center justify-between gap-2 py-1 text-[11px] font-mono tracking-wider">
        {/* Status GPS / Sensor */}
        <div className="flex items-center gap-2 bg-black border border-[#1f1f1f] px-3 py-1.5 rounded-full">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isGpsActive
                ? 'bg-[#FF4F00] shadow-[0_0_8px_#FF4F00]'
                : 'bg-zinc-600'
            }`}
          />
          <span className="text-zinc-400 uppercase text-[10px]">
            {isGpsActive ? 'GPS ONLINE' : 'SYMULACJA'}
          </span>
        </div>

        {/* Przyciski HUD, Audio, Recydywa */}
        <div className="flex items-center gap-1.5">
          <button
            id="hud-mirror-btn"
            onClick={() => setIsHudMirrored(!isHudMirrored)}
            title="Tryb HUD (odbicie lustrzane na szybę w nocy)"
            className={`px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider transition ${
              isHudMirrored
                ? 'bg-[#FF4F00] text-black border-[#FF4F00] font-bold'
                : 'bg-black text-zinc-400 border-[#1f1f1f] hover:border-[#333]'
            }`}
          >
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>HUD</span>
            </span>
          </button>

          <button
            id="audio-toggle-btn"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Włącz dźwięk' : 'Wycisz dźwięk'}
            className="p-1.5 rounded-full bg-black border border-[#1f1f1f] text-zinc-400 hover:text-white transition"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-600" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#FF4F00]" />
            )}
          </button>

          <button
            id="recidivism-toggle-btn"
            onClick={() => setIsRecidivism(!isRecidivism)}
            className={`px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-wider transition ${
              isRecidivism
                ? 'bg-[#FF4F00]/20 text-[#FF4F00] border-[#FF4F00]'
                : 'bg-black text-zinc-500 border-[#1f1f1f] hover:border-[#333]'
            }`}
          >
            RECYDYWA: {isRecidivism ? 'WŁ' : 'WYŁ'}
          </button>
        </div>
      </div>

      {/* KLUCZOWE OSTRZEŻENIE: MIGAJĄCY NAPIS UTRATA PRAWA JAZDY (gdy excess >= 50) */}
      {isLicenseLoss && (
        <div
          id="flashing-license-loss-warning"
          className="w-full my-2 py-3 px-4 rounded-xl text-center border-2 border-white animate-license-flash"
        >
          <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black tracking-widest uppercase font-mono">
            <ShieldAlert className="w-6 h-6 animate-spin" />
            <span>UTRATA PRAWA JAZDY</span>
            <ShieldAlert className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-xs font-mono font-bold tracking-wider mt-1 uppercase">
            ZATRZYMANIE NA 3 MIESIĄCE • PRZEKROCZENIE +{excess} KM/H!
          </div>
        </div>
      )}

      {/* GŁÓWNA TARCZA BAROMETRU / INSTRUMENTU PASCAL */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-auto">
        {/* Okrąg z kreskami precyzyjnego instrumentu (tick marks) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 200"
        >
          {/* Tarcza z kreskami */}
          {Array.from({ length: totalTicks }).map((_, i) => {
            const angle = (i / totalTicks) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const isMajor = i % 4 === 0;
            const r1 = 88;
            const r2 = isMajor ? 78 : 82;
            const x1 = 100 + r1 * Math.cos(rad);
            const y1 = 100 + r1 * Math.sin(rad);
            const x2 = 100 + r2 * Math.cos(rad);
            const y2 = 100 + r2 * Math.sin(rad);
            const isActive = i <= activeTicksCount;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isActive
                    ? isLicenseLoss
                      ? '#FFFFFF'
                      : '#FF4F00'
                    : '#1c1c1c'
                }
                strokeWidth={isMajor ? (isActive ? 2.5 : 1.8) : 1}
                strokeLinecap="round"
                className="transition-colors duration-150"
              />
            );
          })}

          {/* Wewnętrzny okrąg podziałki */}
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="transparent"
            stroke="#141414"
            strokeWidth="1"
          />

          {/* Pomarańczowy wskaźnik limitu prędkości na obwodzie tarczy */}
          {(() => {
            const limitPercentage = Math.min(limit / 200, 1);
            const limitAngle = limitPercentage * 360 - 90;
            const rad = (limitAngle * Math.PI) / 180;
            const markerX = 100 + 75 * Math.cos(rad);
            const markerY = 100 + 75 * Math.sin(rad);
            return (
              <circle
                cx={markerX}
                cy={markerY}
                r="3.5"
                fill="#FF4F00"
                stroke="#000000"
                strokeWidth="1"
              />
            );
          })()}
        </svg>

        {/* Centrum tarczy: Wskazanie cyfrowe w stylu Pascal Barometer */}
        <div className="flex flex-col items-center justify-center text-center z-10 select-none">
          {/* Etykieta telemetryczna */}
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#777777] uppercase mb-1">
            VELOCITY / PRĘDKOŚĆ
          </span>

          {/* Duże cyfry prędkości */}
          <div className="flex items-baseline justify-center">
            <span
              id="current-speed-value"
              className={`text-8xl sm:text-9xl font-black font-mono-num tracking-tighter ${
                isLicenseLoss
                  ? 'text-[#FF4F00] drop-shadow-[0_0_25px_rgba(255,79,0,0.8)] animate-pulse'
                  : isOverLimit
                  ? 'text-white'
                  : 'text-white'
              }`}
            >
              {roundedSpeed}
            </span>
          </div>

          {/* Jednostka w pomarańczowym kolorze Pascal */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#FF4F00]">
              KM/H
            </span>
          </div>

          {/* Różnica telemetryczna względem limitu */}
          <div className="mt-3 font-mono text-[11px] px-3 py-0.5 rounded-full border border-[#1f1f1f] bg-black">
            {isOverLimit ? (
              <span className="text-[#FF4F00] font-bold">
                +{excess} KM/H EXCEEDED
              </span>
            ) : (
              <span className="text-zinc-500">
                DELTA: {excess} KM/H (OK)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KARTA DROGI Z OPENSTREETMAP I LIMITU PRĘDKOŚCI */}
      <div className="w-full my-2 bg-black border border-[#1a1a1a] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#FF4F00] shrink-0" />
            <span className="font-mono text-zinc-200 truncate uppercase text-[11px] font-semibold">
              {roadInfo.name || 'DROGA PUBLICZNA'}
            </span>
            {roadInfo.ref && (
              <span className="bg-[#FF4F00]/20 text-[#FF4F00] border border-[#FF4F00]/40 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded">
                {roadInfo.ref}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <span>
              {roadInfo.highwayType === 'motorway'
                ? 'AUTOSTRADA'
                : roadInfo.highwayType === 'trunk'
                ? 'DROGA EKSPRESOWA'
                : roadInfo.isUrban
                ? 'TEREN ZABUDOWANY'
                : 'TEREN NIEZABUDOWANY'}
            </span>
            <span>•</span>
            <button
              id="osm-refresh-btn"
              onClick={onRefreshOsm}
              disabled={isOsmLoading}
              className="text-[#FF4F00] hover:text-[#ff7433] flex items-center gap-1 uppercase transition"
            >
              <RefreshCw
                className={`w-2.5 h-2.5 ${isOsmLoading ? 'animate-spin' : ''}`}
              />
              <span>OSM</span>
            </button>
          </div>
        </div>

        {/* Okrągły znak drogowy */}
        <div className="shrink-0">
          <SpeedSign limit={limit} size="md" isExceeded={isOverLimit} />
        </div>
      </div>

      {/* DOLNA KARTA TELEMETRYCZNA: MANDAT I PUNKTY W CZASIE RZECZYWISTYM */}
      <div
        id="fine-status-card"
        className={`w-full rounded-2xl p-3.5 border transition-all duration-200 ${
          isLicenseLoss
            ? 'bg-black border-[#FF4F00] shadow-[0_0_25px_rgba(255,79,0,0.4)]'
            : isOverLimit
            ? 'bg-black border-[#FF4F00]/60'
            : 'bg-black border-[#1a1a1a]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2 mb-2 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            {isLicenseLoss ? (
              <ShieldAlert className="w-4 h-4 text-[#FF4F00] animate-pulse" />
            ) : isOverLimit ? (
              <AlertTriangle className="w-4 h-4 text-[#FF4F00]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#FF4F00]/50" />
            )}
            <span className="font-bold uppercase tracking-wider text-zinc-300">
              {isOverLimit ? 'TARYFIKATOR W CZASIE RZECZYWISTYM' : 'STATUS TELEMETRYCZNY'}
            </span>
          </div>

          {isOverLimit && (
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                isLicenseLoss
                  ? 'bg-[#FF4F00] text-black font-extrabold'
                  : 'bg-[#FF4F00]/20 text-[#FF4F00] border border-[#FF4F00]/40'
              }`}
            >
              +{excess} KM/H
            </span>
          )}
        </div>

        {isOverLimit ? (
          <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
            <div className="bg-[#080808] border border-[#1c1c1c] p-2.5 rounded-xl">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 block mb-0.5">
                MANDAT {isRecidivism && excess >= 31 ? '(RECYDYWA)' : ''}
              </span>
              <span
                id="fine-amount-display"
                className="text-2xl font-black font-mono-num text-[#FF4F00]"
              >
                {fineResult.fineAmount} <span className="text-xs font-normal">PLN</span>
              </span>
            </div>

            <div className="bg-[#080808] border border-[#1c1c1c] p-2.5 rounded-xl">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 block mb-0.5">
                PUNKTY KARNE
              </span>
              <span
                id="fine-points-display"
                className="text-2xl font-black font-mono-num text-white"
              >
                {fineResult.points} <span className="text-xs font-normal text-zinc-400">PKT</span>
              </span>
            </div>

            <div className="col-span-2 text-left mt-1 text-[11px] font-mono text-zinc-400 bg-[#050505] p-2 rounded-lg border border-[#191919]">
              <span className="text-[#FF4F00] font-bold">KWALIFIKACJA: </span>
              {fineResult.description}
            </div>
          </div>
        ) : (
          <div className="py-1.5 text-center text-[11px] font-mono text-zinc-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F00]" />
            <span>PRĘDKOŚĆ PRZEPISOWA • LIMIT {limit} KM/H • 0 PLN • 0 PKT</span>
          </div>
        )}
      </div>
    </div>
  );
};
