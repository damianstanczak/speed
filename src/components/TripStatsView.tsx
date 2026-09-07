import React from 'react';
import { DrivingStats } from '../types';
import { RotateCcw, Award, AlertTriangle, ShieldAlert, Timer, Gauge, MapPin } from 'lucide-react';

interface TripStatsViewProps {
  stats: DrivingStats;
  onResetStats: () => void;
}

export const TripStatsView: React.FC<TripStatsViewProps> = ({ stats, onResetStats }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}M ${secs < 10 ? '0' : ''}${secs}S`;
  };

  return (
    <div id="trip-stats-container" className="w-full max-w-md mx-auto p-4 space-y-3 font-mono">
      <div className="bg-black border border-[#1a1a1a] rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-white">
            TELEMETRIA TRASY
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase">Rejestr prędkości i dystansu</p>
        </div>
        <button
          id="reset-stats-btn"
          onClick={onResetStats}
          className="p-2 bg-black hover:bg-[#0c0c0c] active:bg-[#141414] rounded-xl text-zinc-400 hover:text-white flex items-center gap-1.5 text-[10px] font-bold border border-[#1f1f1f] transition uppercase"
        >
          <RotateCcw className="w-3 h-3 text-[#FF4F00]" />
          <span>RESET</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-black border border-[#1a1a1a] rounded-2xl p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-500 mb-1 uppercase">
            <Gauge className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>PRĘDKOŚĆ MAX</span>
          </div>
          <div className="text-3xl font-black font-mono-num text-white">
            {Math.round(stats.maxSpeed)} <span className="text-xs text-[#FF4F00]">KM/H</span>
          </div>
        </div>

        <div className="bg-black border border-[#1a1a1a] rounded-2xl p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-500 mb-1 uppercase">
            <Award className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>ŚREDNIA</span>
          </div>
          <div className="text-3xl font-black font-mono-num text-white">
            {Math.round(stats.avgSpeed)} <span className="text-xs text-[#FF4F00]">KM/H</span>
          </div>
        </div>

        <div className="bg-black border border-[#1a1a1a] rounded-2xl p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-500 mb-1 uppercase">
            <MapPin className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>DYSTANS</span>
          </div>
          <div className="text-3xl font-black font-mono-num text-white">
            {stats.distanceKm.toFixed(2)} <span className="text-xs text-[#FF4F00]">KM</span>
          </div>
        </div>

        <div className="bg-black border border-[#1a1a1a] rounded-2xl p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-500 mb-1 uppercase">
            <Timer className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>CZAS JAZDY</span>
          </div>
          <div className="text-2xl font-black font-mono-num text-white pt-1">
            {formatTime(stats.timeMovingSec)}
          </div>
        </div>
      </div>

      <div className="bg-black border border-[#1a1a1a] rounded-2xl p-4 shadow-lg space-y-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
          BEZPIECZEŃSTWO I REJESTR WYKROCZEŃ
        </h4>

        <div className="flex items-center justify-between p-3 bg-[#050505] rounded-xl border border-[#161616]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span className="text-[11px] text-zinc-400 uppercase">PRZEKROCZENIA LIMITU</span>
          </div>
          <span className="font-mono font-bold text-sm text-[#FF4F00]">
            {stats.overspeedCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#050505] rounded-xl border border-[#161616]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span className="text-[11px] text-zinc-400 uppercase">NAJWIĘKSZE PRZEKROCZENIE</span>
          </div>
          <span className="font-mono font-bold text-sm text-[#FF4F00]">
            +{Math.round(stats.maxOverspeed)} KM/H
          </span>
        </div>
      </div>

      {/* Wskazówka HUD */}
      <div className="p-3.5 rounded-2xl bg-black border border-[#1a1a1a] text-[10px] text-zinc-500 space-y-1">
        <p className="font-bold text-[#FF4F00] uppercase tracking-wider">HUD WINDSHIELD REFLECTION:</p>
        <p className="leading-relaxed">
          Włącz przycisk HUD na głównym ekranie, aby uzyskać lustrzane odbicie na przednią szybę
          samochodu podczas jazdy nocnej.
        </p>
      </div>
    </div>
  );
};
