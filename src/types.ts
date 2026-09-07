export interface OsmRoadInfo {
  name: string;
  ref?: string;
  highwayType: string;
  maxspeed: number;
  source: 'osm-tag' | 'osm-classification' | 'manual-override' | 'default';
  isUrban: boolean;
  city?: string;
  rawOsmSpeed?: string;
}

export interface SpeedFineResult {
  excessSpeed: number;
  fineAmount: number;
  recidivismAmount: number;
  points: number;
  lossOfLicense: boolean;
  lossOfLicenseWarning: string;
  description: string;
  category: string;
}

export interface MandatEntry {
  id: string;
  category: 'speed' | 'overtaking' | 'pedestrians' | 'junctions' | 'phone_belts' | 'alcohol' | 'general';
  title: string;
  description: string;
  fineMin: number;
  fineMax: number;
  points: number;
  recidivismFine?: number;
  lossOfLicense?: boolean;
  article: string;
}

export interface GPSPositionData {
  latitude: number;
  longitude: number;
  speedKmh: number;
  accuracy: number | null;
  heading: number | null;
  altitude: number | null;
  timestamp: number;
}

export interface DrivingStats {
  maxSpeed: number;
  avgSpeed: number;
  distanceKm: number;
  timeMovingSec: number;
  overspeedCount: number;
  maxOverspeed: number;
}

export type AppTab = 'speedometer' | 'database' | 'simulator' | 'stats';
