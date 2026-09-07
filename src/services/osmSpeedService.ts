import { OsmRoadInfo } from '../types';

interface CachedOsmResult {
  lat: number;
  lon: number;
  roadInfo: OsmRoadInfo;
  timestamp: number;
}

let lastCache: CachedOsmResult | null = null;
let lastRequestTime = 0;

/**
 * Oblicza dystans w metrach między dwoma punktami GPS
 */
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Parsuje tag maxspeed z OpenStreetMap zgodnie z polskimi przepisami
 */
function parseOsmMaxSpeed(rawMaxSpeed?: string, highwayType?: string): { speed: number; isExplicit: boolean } {
  if (rawMaxSpeed) {
    const clean = rawMaxSpeed.trim().toLowerCase();
    
    // Liczba wprost (np. "50", "70", "120")
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 0 && num <= 200) {
      return { speed: num, isExplicit: true };
    }

    // Oznaczenia stref w OSM dla Polski
    if (clean.includes('urban') || clean.includes('pl:urban')) return { speed: 50, isExplicit: true };
    if (clean.includes('rural') || clean.includes('pl:rural')) return { speed: 90, isExplicit: true };
    if (clean.includes('motorway') || clean.includes('pl:motorway')) return { speed: 140, isExplicit: true };
    if (clean.includes('trunk') || clean.includes('pl:trunk')) return { speed: 120, isExplicit: true };
    if (clean.includes('living_street') || clean.includes('zone:20')) return { speed: 20, isExplicit: true };
    if (clean.includes('zone:30') || clean.includes('30')) return { speed: 30, isExplicit: true };
  }

  // Domyślne prędkości ustawowe w Polsce na podstawie typu drogi w OSM
  switch (highwayType) {
    case 'motorway':
    case 'motorway_link':
      return { speed: 140, isExplicit: false };
    case 'trunk':
    case 'trunk_link':
      return { speed: 120, isExplicit: false };
    case 'primary':
    case 'primary_link':
      return { speed: 90, isExplicit: false };
    case 'secondary':
    case 'secondary_link':
    case 'tertiary':
    case 'tertiary_link':
    case 'unclassified':
      return { speed: 90, isExplicit: false };
    case 'residential':
      return { speed: 50, isExplicit: false };
    case 'living_street':
      return { speed: 20, isExplicit: false };
    case 'service':
      return { speed: 30, isExplicit: false };
    default:
      return { speed: 50, isExplicit: false };
  }
}

/**
 * Tłumaczy techniczny typ drogi OSM na czytelną nazwę w języku polskim
 */
export function formatHighwayType(highway?: string): string {
  switch (highway) {
    case 'motorway':
      return 'Autostrada';
    case 'trunk':
      return 'Droga ekspresowa';
    case 'primary':
      return 'Droga krajowa';
    case 'secondary':
      return 'Droga wojewódzka';
    case 'tertiary':
      return 'Droga powiatowa';
    case 'residential':
      return 'Teren zabudowany / Ulica miejska';
    case 'living_street':
      return 'Strefa zamieszkania';
    case 'service':
      return 'Droga wewnętrzna / dojazdowa';
    case 'unclassified':
      return 'Droga lokalna';
    default:
      return 'Droga publiczna';
  }
}

/**
 * Pobiera informację o drodze i ograniczeniu prędkości z OpenStreetMap Overpass API
 */
export async function fetchOsmSpeedLimit(lat: number, lon: number): Promise<OsmRoadInfo> {
  const now = Date.now();

  // Sprawdź pamięć podręczną (jeśli użytkownik przemieścił się mniej niż 25 metrów i minęło mniej niż 12s)
  if (lastCache) {
    const dist = getDistanceMeters(lat, lon, lastCache.lat, lastCache.lon);
    if (dist < 25 && now - lastCache.timestamp < 15000) {
      return lastCache.roadInfo;
    }
  }

  // Ochrona przed zbyt częstym odpytywaniem API (min. 1.2 sekundy między żądaniami)
  if (now - lastRequestTime < 1200 && lastCache) {
    return lastCache.roadInfo;
  }
  lastRequestTime = now;

  try {
    // 1. Próba zapytania do OpenStreetMap Overpass API
    const overpassQuery = `[out:json][timeout:4];way(around:45,${lat.toFixed(6)},${lon.toFixed(6)})[highway];out tags 5;`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.elements && data.elements.length > 0) {
        // Znajdź drogę o najwyższym priorytecie lub z tagiem maxspeed
        const ways = data.elements.filter((el: any) => el.tags && el.tags.highway);
        
        // Szukamy drogi z jawnym maxspeed lub najważniejszej
        let bestWay = ways.find((w: any) => w.tags.maxspeed) || ways[0];

        const tags = bestWay.tags || {};
        const parsed = parseOsmMaxSpeed(tags.maxspeed, tags.highway);
        const roadName = tags.name || tags.ref || formatHighwayType(tags.highway);

        const result: OsmRoadInfo = {
          name: roadName,
          ref: tags.ref,
          highwayType: tags.highway || 'residential',
          maxspeed: parsed.speed,
          source: parsed.isExplicit ? 'osm-tag' : 'osm-classification',
          isUrban: parsed.speed <= 50,
          rawOsmSpeed: tags.maxspeed,
        };

        lastCache = {
          lat,
          lon,
          roadInfo: result,
          timestamp: now,
        };

        return result;
      }
    }
  } catch (err) {
    // Jeśli Overpass zawiedzie (timeout/błąd sieci), przechodzimy do Nominatim
  }

  // 2. Fallback: Odpytanie OpenStreetMap Nominatim Reverse Geocoding
  try {
    const nomController = new AbortController();
    const nomTimeout = setTimeout(() => nomController.abort(), 3500);

    const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=17&addressdetails=1`;
    const nomRes = await fetch(nomUrl, {
      headers: {
        'Accept-Language': 'pl,en',
        'User-Agent': 'IOSSpeedometerGPS/1.0',
      },
      signal: nomController.signal,
    });
    clearTimeout(nomTimeout);

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const roadName = addr.road || addr.pedestrian || addr.street || nomData.display_name?.split(',')[0] || 'Droga publiczna';
      const city = addr.city || addr.town || addr.village || addr.municipality;

      // Wyznacz domyślny limit (teren zabudowany w Polsce = 50 km/h)
      const isUrban = !!city;
      const speed = isUrban ? 50 : 90;

      const result: OsmRoadInfo = {
        name: roadName,
        city: city,
        highwayType: isUrban ? 'residential' : 'primary',
        maxspeed: speed,
        source: 'osm-classification',
        isUrban: isUrban,
      };

      lastCache = {
        lat,
        lon,
        roadInfo: result,
        timestamp: now,
      };

      return result;
    }
  } catch (e) {
    // błąd nominatim
  }

  // 3. Ostateczny domyślny limit (teren zabudowany 50 km/h)
  const defaultResult: OsmRoadInfo = {
    name: 'Droga publiczna (Teren zabudowany)',
    highwayType: 'residential',
    maxspeed: 50,
    source: 'default',
    isUrban: true,
  };

  return defaultResult;
}
