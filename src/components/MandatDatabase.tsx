import React, { useState, useMemo } from 'react';
import { MANDATY_DATABASE, calculateSpeedFine } from '../data/taryfikator';
import { MandatEntry } from '../types';
import { Search, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export const MandatDatabase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [calcLimit, setCalcLimit] = useState<number>(50);
  const [calcSpeed, setCalcSpeed] = useState<number>(105);
  const [calcRecidivism, setCalcRecidivism] = useState<boolean>(false);

  const fineCalcResult = useMemo(() => {
    const excess = Math.max(0, calcSpeed - calcLimit);
    return calculateSpeedFine(excess, calcRecidivism);
  }, [calcLimit, calcSpeed, calcRecidivism]);

  const filteredEntries = useMemo(() => {
    return MANDATY_DATABASE.filter((entry: MandatEntry) => {
      const matchesCat =
        selectedCategory === 'all' || entry.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.article.toLowerCase().includes(q) ||
        entry.fineMin.toString().includes(q) ||
        entry.points.toString().includes(q);

      return matchesCat && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', label: 'WSZYSTKIE' },
    { id: 'speed', label: 'PRĘDKOŚĆ' },
    { id: 'overtaking', label: 'WYPRZEDZANIE' },
    { id: 'pedestrians', label: 'PIESI' },
    { id: 'junctions', label: 'SKRZYŻOWANIA' },
    { id: 'phone_belts', label: 'TELEFON / PASY' },
    { id: 'alcohol', label: 'TRZEŹWOŚĆ' },
  ];

  return (
    <div id="mandat-database-container" className="w-full max-w-md mx-auto p-4 space-y-3 pb-12 font-mono">
      {/* KALKULATOR PRĘDKOŚCI WPROST */}
      <div className="bg-black border border-[#1a1a1a] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-black border border-[#FF4F00] text-[#FF4F00]">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              KALKULATOR PRĘDKOŚCI
            </h3>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] text-[#FF4F00] font-bold cursor-pointer">
            <input
              id="calc-recidivism-check"
              type="checkbox"
              checked={calcRecidivism}
              onChange={(e) => setCalcRecidivism(e.target.checked)}
              className="rounded accent-[#FF4F00]"
            />
            <span>RECYDYWA (2 LATA)</span>
          </label>
        </div>

        {/* Wybór limitu i prędkości */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              LIMIT DROGI
            </label>
            <select
              id="calc-limit-select"
              value={calcLimit}
              onChange={(e) => setCalcLimit(parseInt(e.target.value, 10))}
              className="w-full bg-[#080808] border border-[#222] rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:border-[#FF4F00] focus:outline-none"
            >
              <option value={20}>20 KM/H (Strefa zamieszkania)</option>
              <option value={30}>30 KM/H (Tempo 30)</option>
              <option value={50}>50 KM/H (Teren zabudowany)</option>
              <option value={70}>70 KM/H (Podwyższony)</option>
              <option value={90}>90 KM/H (Droga krajowa)</option>
              <option value={100}>100 KM/H (Ekspresowa 1-j)</option>
              <option value={120}>120 KM/H (Droga ekspresowa)</option>
              <option value={140}>140 KM/H (Autostrada)</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              PRĘDKOŚĆ ({calcSpeed} KM/H)
            </label>
            <input
              id="calc-speed-slider"
              type="range"
              min={calcLimit - 10}
              max={calcLimit + 90}
              value={calcSpeed}
              onChange={(e) => setCalcSpeed(parseInt(e.target.value, 10))}
              className="w-full h-2 mt-3 bg-[#1c1c1c] rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
            />
          </div>
        </div>

        {/* Wynik kalkulatora */}
        <div
          id="calc-result-box"
          className={`p-3 rounded-xl border transition ${
            fineCalcResult.lossOfLicense
              ? 'bg-black border-[#FF4F00] shadow-[0_0_20px_rgba(255,79,0,0.3)]'
              : fineCalcResult.excessSpeed > 0
              ? 'bg-[#080808] border-[#222]'
              : 'bg-black border-[#141414]'
          }`}
        >
          {fineCalcResult.excessSpeed > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[10px]">
                <span className="font-bold text-[#FF4F00]">
                  PRZEKROCZENIE O +{fineCalcResult.excessSpeed} KM/H
                </span>
                <span className="font-mono text-zinc-400">
                  {calcSpeed} / {calcLimit} KM/H
                </span>
              </div>

              {fineCalcResult.lossOfLicense && (
                <div className="bg-[#FF4F00] text-black font-black text-[11px] px-2.5 py-1.5 rounded-lg mb-2 flex items-center justify-center gap-1.5 animate-pulse tracking-wider uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>UTRATA PRAWA JAZDY NA 3 MIESIĄCE</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#050505] p-2 rounded-lg border border-[#191919]">
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500">MANDAT</div>
                  <div className="text-xl font-black text-[#FF4F00]">
                    {fineCalcResult.fineAmount} PLN
                  </div>
                </div>
                <div className="bg-[#050505] p-2 rounded-lg border border-[#191919]">
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500">PUNKTY</div>
                  <div className="text-xl font-black text-white">
                    {fineCalcResult.points} PKT
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-center py-1 text-zinc-500 flex items-center justify-center gap-1.5 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4F00]" />
              <span>Prędkość przepisowa — brak mandatu</span>
            </div>
          )}
        </div>
      </div>

      {/* WYSZUKIWARKA I KATEGORIE */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-600" />
          <input
            id="search-mandat-input"
            type="text"
            placeholder="SZUKAJ: TELEFON, WYPRZEDZANIE, 15 PKT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-[#1a1a1a] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4F00] uppercase"
          />
        </div>

        {/* Pigułki kategorii */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[9px] no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full uppercase tracking-wider transition ${
                selectedCategory === cat.id
                  ? 'bg-[#FF4F00] text-black font-bold'
                  : 'bg-black border border-[#1a1a1a] text-zinc-500 hover:border-[#333]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA MANDATÓW */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1">
          <span>POZYCJI: {filteredEntries.length}</span>
          <span>TARYFIKATOR 2024–2026</span>
        </div>

        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            id={`mandat-card-${entry.id}`}
            className="bg-black border border-[#1a1a1a] rounded-2xl p-3 space-y-2 hover:border-[#2a2a2a] transition"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-bold text-xs text-zinc-200 uppercase leading-snug">
                {entry.title}
              </h4>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded bg-black border border-[#FF4F00] text-[#FF4F00] font-bold text-[10px]">
                  {entry.points} PKT
                </span>
                {entry.lossOfLicense && (
                  <span className="text-[8px] uppercase font-black bg-[#FF4F00] text-black px-1.5 py-0.2 rounded">
                    UTRATA PRAWKA
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{entry.description}</p>

            <div className="pt-2 border-t border-[#141414] flex items-center justify-between text-[10px]">
              <div>
                <span className="text-zinc-500 uppercase">MANDAT: </span>
                <span className="font-bold text-[#FF4F00]">
                  {entry.fineMin === entry.fineMax
                    ? `${entry.fineMin} PLN`
                    : `${entry.fineMin} – ${entry.fineMax} PLN`}
                </span>
                {entry.recidivismFine && (
                  <span className="text-zinc-500 ml-1.5">
                    (RECYDYWA: {entry.recidivismFine} PLN)
                  </span>
                )}
              </div>

              <span className="text-[9px] text-zinc-600 font-mono">{entry.article}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
