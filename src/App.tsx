import { useState, useEffect, useRef, useMemo } from 'react';
import { OsmRoadInfo, DrivingStats, AppTab } from './types';
import { calculateSpeedFine } from './data/taryfikator';
import { fetchOsmSpeedLimit } from './services/osmSpeedService';
import { setSoundMuted } from './services/audioAlert';
import { SpeedometerHUD } from './components/SpeedometerHUD';
import { SpeedSimulator } from './components/SpeedSimulator';
import { MandatDatabase } from './components/MandatDatabase';
import { TripStatsView } from './components/TripStatsView';
import { IosHeader } from './components/IosHeader';
import { IosTabBar } from './components/IosTabBar';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('speedometer');
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [isSimulated, setIsSimulated] = useState<boolean>(true); // default true so user can test right away in browser
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [isRecidivism, setIsRecidivism] = useState<boolean>(false);
  const [isMuted, setIsMutedState] = useState<boolean>(false);
  const [isHudMirrored, setIsHudMirrored] = useState<boolean>(false);
  const [isOsmLoading, setIsOsmLoading] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Informacja o aktualnej drodze i limicie prędkości (początkowo domyślna ulica miejska w Polsce: 50 km/h)
  const [roadInfo, setRoadInfo] = useState<OsmRoadInfo>({
    name: 'Warszawa, Marszałkowska',
    ref: 'DW634',
    highwayType: 'residential',
    maxspeed: 50,
    source: 'default',
    isUrban: true,
  });

  // Statystyki jazdy
  const [stats, setStats] = useState<DrivingStats>({
    maxSpeed: 0,
    avgSpeed: 0,
    distanceKm: 0,
    timeMovingSec: 0,
    overspeedCount: 0,
    maxOverspeed: 0,
  });

  // Referencje do śledzenia pozycji GPS i dystansu
  const lastPositionRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const speedSamplesRef = useRef<number[]>([]);
  const lastSpeedRef = useRef<number>(0);
  const currentCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // Wyciszanie audio
  const handleSetMuted = (muted: boolean) => {
    setIsMutedState(muted);
    setSoundMuted(muted);
  };

  // Obliczenie aktualnego mandatu w czasie rzeczywistym
  const excessSpeed = Math.max(0, Math.round(currentSpeed) - roadInfo.maxspeed);
  const fineResult = useMemo(() => {
    return calculateSpeedFine(excessSpeed, isRecidivism);
  }, [excessSpeed, isRecidivism]);

  // Śledzenie statystyk trasy co 1 sekundę
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (currentSpeed > 2) {
        setStats((prev) => {
          const newTimeMoving = prev.timeMovingSec + 1;
          const newMaxSpeed = Math.max(prev.maxSpeed, currentSpeed);
          
          speedSamplesRef.current.push(currentSpeed);
          if (speedSamplesRef.current.length > 500) speedSamplesRef.current.shift();
          const sum = speedSamplesRef.current.reduce((a, b) => a + b, 0);
          const newAvgSpeed = sum / speedSamplesRef.current.length;

          // Szacunkowy dystans z prędkości: (km/h) / 3600 h = km na sekundę
          const addedDistance = currentSpeed / 3600;
          const newDistance = prev.distanceKm + addedDistance;

          const currentExcess = Math.max(0, Math.round(currentSpeed) - roadInfo.maxspeed);
          const hadOverspeedBefore = lastSpeedRef.current > roadInfo.maxspeed;
          const isOverspeedNow = currentExcess > 0;
          const newOverspeedCount = isOverspeedNow && !hadOverspeedBefore ? prev.overspeedCount + 1 : prev.overspeedCount;
          const newMaxOverspeed = Math.max(prev.maxOverspeed, currentExcess);

          lastSpeedRef.current = currentSpeed;

          return {
            maxSpeed: newMaxSpeed,
            avgSpeed: newAvgSpeed,
            distanceKm: newDistance,
            timeMovingSec: newTimeMoving,
            overspeedCount: newOverspeedCount,
            maxOverspeed: newMaxOverspeed,
          };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSpeed, roadInfo.maxspeed]);

  // Pobieranie limitu prędkości z OpenStreetMap dla danych współrzędnych
  const updateOsmFromCoords = async (lat: number, lon: number) => {
    setIsOsmLoading(true);
    try {
      const data = await fetchOsmSpeedLimit(lat, lon);
      if (data) {
        setRoadInfo(data);
      }
    } catch (e) {
      console.warn('Błąd pobierania OSM:', e);
    } finally {
      setIsOsmLoading(false);
    }
  };

  // Ręczne odświeżenie danych OpenStreetMap
  const handleRefreshOsm = () => {
    if (currentCoordsRef.current) {
      updateOsmFromCoords(currentCoordsRef.current.lat, currentCoordsRef.current.lon);
    } else {
      // Domyślna lokalizacja (Warszawa, centrum) do testów
      updateOsmFromCoords(52.2297, 21.0122);
    }
  };

  // Nasłuchiwanie prawdziwego modułu GPS urządzenia (HTML5 Geolocation API)
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    let watchId: number | null = null;

    const handleSuccess = (pos: GeolocationPosition) => {
      const coords = pos.coords;
      currentCoordsRef.current = { lat: coords.latitude, lon: coords.longitude };
      setGpsAccuracy(coords.accuracy);
      setIsGpsActive(true);

      // Jeśli nie jesteśmy w trybie symulacji, używamy prawdziwej prędkości z GPS
      if (!isSimulated) {
        let speed = 0;
        if (coords.speed !== null && coords.speed !== undefined && !isNaN(coords.speed)) {
          // coords.speed jest w m/s, przeliczamy na km/h (m/s * 3.6)
          speed = Math.max(0, coords.speed * 3.6);
        } else if (lastPositionRef.current) {
          // Fallback: obliczenie prędkości z odległości i czasu między odczytami
          const now = Date.now();
          const dt = (now - lastPositionRef.current.time) / 1000;
          if (dt > 0.8 && dt < 15) {
            // Oblicz przemieszczenie
            const R = 6371e3;
            const φ1 = (lastPositionRef.current.lat * Math.PI) / 180;
            const φ2 = (coords.latitude * Math.PI) / 180;
            const Δφ = ((coords.latitude - lastPositionRef.current.lat) * Math.PI) / 180;
            const Δλ = ((coords.longitude - lastPositionRef.current.lon) * Math.PI) / 180;
            const a =
              Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;

            // Filtruj zakłócenia GPS przy postoju (jeśli dist < 3m, prędkość = 0)
            if (dist > 3) {
              speed = (dist / dt) * 3.6;
            }
          }
        }

        setCurrentSpeed(Math.round(speed * 10) / 10);
      }

      lastPositionRef.current = {
        lat: coords.latitude,
        lon: coords.longitude,
        time: Date.now(),
      };

      // Sprawdź OpenStreetMap dla nowej pozycji
      updateOsmFromCoords(coords.latitude, coords.longitude);
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('GPS niedostępny lub odmowa uprawnień:', err.message);
      setIsGpsActive(false);
    };

    try {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1500,
      });
    } catch (e) {
      console.warn('Błąd inicjalizacji watchPosition', e);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isSimulated]);

  const resetStats = () => {
    setStats({
      maxSpeed: 0,
      avgSpeed: 0,
      distanceKm: 0,
      timeMovingSec: 0,
      overspeedCount: 0,
      maxOverspeed: 0,
    });
    speedSamplesRef.current = [];
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-[#FF4F00] selection:text-black">
      {/* Nagłówek iOS z dynamiczną wyspą / statusem */}
      <IosHeader
        isGpsActive={isGpsActive && !isSimulated}
        accuracy={gpsAccuracy}
        currentRoadName={roadInfo.name}
      />

      {/* Główna zawartość zależna od wybranej zakładki */}
      <main className="flex-1 w-full pb-20 pt-1">
        {currentTab === 'speedometer' && (
          <SpeedometerHUD
            currentSpeed={currentSpeed}
            roadInfo={roadInfo}
            fineResult={fineResult}
            isRecidivism={isRecidivism}
            setIsRecidivism={setIsRecidivism}
            isMuted={isMuted}
            setIsMuted={handleSetMuted}
            isHudMirrored={isHudMirrored}
            setIsHudMirrored={setIsHudMirrored}
            isGpsActive={isGpsActive && !isSimulated}
            onRefreshOsm={handleRefreshOsm}
            isOsmLoading={isOsmLoading}
          />
        )}

        {currentTab === 'database' && <MandatDatabase />}

        {currentTab === 'simulator' && (
          <SpeedSimulator
            currentSpeed={currentSpeed}
            setCurrentSpeed={setCurrentSpeed}
            isSimulated={isSimulated}
            setIsSimulated={setIsSimulated}
            roadInfo={roadInfo}
            setRoadInfo={setRoadInfo}
          />
        )}

        {currentTab === 'stats' && (
          <TripStatsView stats={stats} onResetStats={resetStats} />
        )}
      </main>

      {/* Dolny pasek nawigacji iOS */}
      <IosTabBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isLicenseLoss={fineResult.lossOfLicense}
      />
    </div>
  );
}
