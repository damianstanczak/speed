import { SpeedFineResult, MandatEntry } from '../types';

/**
 * Oblicza mandat i punkty karne za przekroczenie prędkości
 * zgodnie z aktualnym taryfikatorem mandatów w Polsce.
 */
export function calculateSpeedFine(excessSpeed: number, isRecidivism = false): SpeedFineResult {
  const excess = Math.max(0, Math.round(excessSpeed));

  if (excess <= 0) {
    return {
      excessSpeed: 0,
      fineAmount: 0,
      recidivismAmount: 0,
      points: 0,
      lossOfLicense: false,
      lossOfLicenseWarning: '',
      description: 'Prędkość przepisowa. Bez mandatu.',
      category: 'Brak wykroczenia',
    };
  }

  let fine = 50;
  let recFine = 50;
  let points = 1;
  let loss = false;
  let desc = '';

  if (excess <= 10) {
    fine = 50;
    recFine = 50;
    points = 1;
    desc = 'Przekroczenie dopuszczalnej prędkości do 10 km/h';
  } else if (excess <= 15) {
    fine = 100;
    recFine = 100;
    points = 2;
    desc = 'Przekroczenie dopuszczalnej prędkości o 11–15 km/h';
  } else if (excess <= 20) {
    fine = 200;
    recFine = 200;
    points = 3;
    desc = 'Przekroczenie dopuszczalnej prędkości o 16–20 km/h';
  } else if (excess <= 25) {
    fine = 300;
    recFine = 300;
    points = 5;
    desc = 'Przekroczenie dopuszczalnej prędkości o 21–25 km/h';
  } else if (excess <= 30) {
    fine = 400;
    recFine = 400;
    points = 7;
    desc = 'Przekroczenie dopuszczalnej prędkości o 26–30 km/h';
  } else if (excess <= 40) {
    fine = 800;
    recFine = 1600;
    points = 9;
    desc = 'Przekroczenie dopuszczalnej prędkości o 31–40 km/h (recydywa: podwójna stawka)';
  } else if (excess <= 50) {
    fine = 1000;
    recFine = 2000;
    points = 11;
    desc = 'Przekroczenie dopuszczalnej prędkości o 41–50 km/h (recydywa: podwójna stawka)';
  } else if (excess <= 60) {
    fine = 1500;
    recFine = 3000;
    points = 13;
    loss = true;
    desc = 'Przekroczenie dopuszczalnej prędkości o 51–60 km/h. Utrata prawa jazdy na 3 miesiące!';
  } else if (excess <= 70) {
    fine = 2000;
    recFine = 4000;
    points = 14;
    loss = true;
    desc = 'Przekroczenie dopuszczalnej prędkości o 61–70 km/h. Utrata prawa jazdy na 3 miesiące!';
  } else {
    fine = 2500;
    recFine = 5000;
    points = 15;
    loss = true;
    desc = 'Przekroczenie dopuszczalnej prędkości o 71 km/h i więcej. Utrata prawa jazdy na 3 miesiące!';
  }

  // Wymóg: Po przekroczeniu 50km/h ponad aktualny limit (czyli od 50 km/h w górę)
  if (excess >= 50) {
    loss = true;
  }

  return {
    excessSpeed: excess,
    fineAmount: isRecidivism && recFine > fine ? recFine : fine,
    recidivismAmount: recFine,
    points,
    lossOfLicense: loss,
    lossOfLicenseWarning: loss ? 'UTRATA PRAWA JAZDY NA 3 MIESIĄCE' : '',
    description: desc,
    category: `Przekroczenie o ${excess} km/h`,
  };
}

/**
 * Baza danych najczęstszych i kluczowych pozycji taryfikatora mandatów w Polsce
 */
export const MANDATY_DATABASE: MandatEntry[] = [
  // PRĘDKOŚĆ
  {
    id: 'spd-1',
    category: 'speed',
    title: 'Przekroczenie prędkości do 10 km/h',
    description: 'Naruszenie dopuszczalnej prędkości na danym odcinku drogi',
    fineMin: 50,
    fineMax: 50,
    points: 1,
    article: 'Art. 92a § 1 lub § 2 KW',
  },
  {
    id: 'spd-2',
    category: 'speed',
    title: 'Przekroczenie prędkości o 11–15 km/h',
    description: 'Naruszenie dopuszczalnej prędkości o 11 do 15 km/h',
    fineMin: 100,
    fineMax: 100,
    points: 2,
    article: 'Art. 92a § 2 KW',
  },
  {
    id: 'spd-3',
    category: 'speed',
    title: 'Przekroczenie prędkości o 16–20 km/h',
    description: 'Naruszenie dopuszczalnej prędkości o 16 do 20 km/h',
    fineMin: 200,
    fineMax: 200,
    points: 3,
    article: 'Art. 92a § 2 KW',
  },
  {
    id: 'spd-4',
    category: 'speed',
    title: 'Przekroczenie prędkości o 21–25 km/h',
    description: 'Naruszenie dopuszczalnej prędkości o 21 do 25 km/h',
    fineMin: 300,
    fineMax: 300,
    points: 5,
    article: 'Art. 92a § 2 KW',
  },
  {
    id: 'spd-5',
    category: 'speed',
    title: 'Przekroczenie prędkości o 26–30 km/h',
    description: 'Naruszenie dopuszczalnej prędkości o 26 do 30 km/h',
    fineMin: 400,
    fineMax: 400,
    points: 7,
    article: 'Art. 92a § 2 KW',
  },
  {
    id: 'spd-6',
    category: 'speed',
    title: 'Przekroczenie prędkości o 31–40 km/h',
    description: 'Przekroczenie prędkości podlegające zasadzie recydywy (w ciągu 2 lat)',
    fineMin: 800,
    fineMax: 800,
    recidivismFine: 1600,
    points: 9,
    article: 'Art. 92a § 2 KW',
  },
  {
    id: 'spd-7',
    category: 'speed',
    title: 'Przekroczenie prędkości o 41–50 km/h',
    description: 'Poważne przekroczenie prędkości podlegające recydywie',
    fineMin: 1000,
    fineMax: 1000,
    recidivismFine: 2000,
    points: 11,
    article: 'Art. 92a § 2 KW',
  },
  {
    id: 'spd-8',
    category: 'speed',
    title: 'Przekroczenie prędkości o 51–60 km/h',
    description: 'Przekroczenie o ponad 50 km/h skutkuje zatrzymaniem prawa jazdy na 3 miesiące w terenie zabudowanym',
    fineMin: 1500,
    fineMax: 1500,
    recidivismFine: 3000,
    points: 13,
    lossOfLicense: true,
    article: 'Art. 92a § 2 KW + Art. 135 PRD',
  },
  {
    id: 'spd-9',
    category: 'speed',
    title: 'Przekroczenie prędkości o 61–70 km/h',
    description: 'Drastyczne przekroczenie prędkości, natychmiastowe zatrzymanie prawa jazdy',
    fineMin: 2000,
    fineMax: 2000,
    recidivismFine: 4000,
    points: 14,
    lossOfLicense: true,
    article: 'Art. 92a § 2 KW + Art. 135 PRD',
  },
  {
    id: 'spd-10',
    category: 'speed',
    title: 'Przekroczenie prędkości o 71 km/h i więcej',
    description: 'Maksymalny wymiar mandatu karnego za prędkość, zatrzymanie prawa jazdy',
    fineMin: 2500,
    fineMax: 2500,
    recidivismFine: 5000,
    points: 15,
    lossOfLicense: true,
    article: 'Art. 92a § 2 KW + Art. 135 PRD',
  },

  // WYPRZEDZANIE
  {
    id: 'ovt-1',
    category: 'overtaking',
    title: 'Wyprzedzanie na przejściu dla pieszych lub bezpośrednio przed nim',
    description: 'Jedno z najsurowiej karanych wykroczeń drogowych w Polsce',
    fineMin: 1500,
    fineMax: 1500,
    recidivismFine: 3000,
    points: 15,
    article: 'Art. 86b § 1 pkt 3 KW',
  },
  {
    id: 'ovt-2',
    category: 'overtaking',
    title: 'Wyprzedzanie pojazdu na zakazie wyprzedzania (znak B-25)',
    description: 'Złamanie zakazu wyrażonego znakiem drogowym B-25',
    fineMin: 1000,
    fineMax: 1000,
    recidivismFine: 2000,
    points: 15,
    article: 'Art. 92 § 1 KW',
  },
  {
    id: 'ovt-3',
    category: 'overtaking',
    title: 'Wyprzedzanie na przejeździe kolejowym i bezpośrednio przed nim',
    description: 'Naruszenie zakazu wyprzedzania w strefie torowiska',
    fineMin: 1000,
    fineMax: 1000,
    recidivismFine: 2000,
    points: 10,
    article: 'Art. 97b KW',
  },

  // PIESI I PRZEJŚCIA
  {
    id: 'ped-1',
    category: 'pedestrians',
    title: 'Nieustąpienie pierwszeństwa pieszemu znajdującemu się na przejściu lub wchodzącemu',
    description: 'Obowiązek ustąpienia pierwszeństwa pieszemu wchodzącemu na jezdnię',
    fineMin: 1500,
    fineMax: 1500,
    recidivismFine: 3000,
    points: 15,
    article: 'Art. 86b § 1 pkt 1 KW',
  },
  {
    id: 'ped-2',
    category: 'pedestrians',
    title: 'Omijanie pojazdu, który jechał w tym samym kierunku i zatrzymał się, by ustąpić pieszemu',
    description: 'Ekstremalnie niebezpieczne naruszenie zasad bezpieczeństwa pieszych',
    fineMin: 1500,
    fineMax: 1500,
    recidivismFine: 3000,
    points: 15,
    article: 'Art. 86b § 1 pkt 2 KW',
  },

  // SKRZYŻOWANIA I SYGNALIZACJA
  {
    id: 'junc-1',
    category: 'junctions',
    title: 'Niezastosowanie się do sygnału świetlnego (wjazd na czerwonym świetle)',
    description: 'Przejechanie linii zatrzymania przy nadawanym świetle czerwonym',
    fineMin: 500,
    fineMax: 500,
    points: 15,
    article: 'Art. 92 § 1 KW',
  },
  {
    id: 'junc-2',
    category: 'junctions',
    title: 'Wjazd na przejazd kolejowy przy opuszczonych zapaporach lub czerwonym świetle',
    description: 'Zignorowanie sygnalizatora na przejeździe lub omijanie półrogatek',
    fineMin: 2000,
    fineMax: 2000,
    recidivismFine: 4000,
    points: 15,
    article: 'Art. 97b § 1 KW',
  },

  // PASY, TELEFON I SPRZĘT
  {
    id: 'ph-1',
    category: 'phone_belts',
    title: 'Korzystanie z telefonu komórkowego wymagające trzymania słuchawki lub mikrofonu w ręku',
    description: 'Prowadzenie rozmów, pisanie wiadomości, trzymanie smartfona podczas jazdy',
    fineMin: 500,
    fineMax: 500,
    points: 12,
    article: 'Art. 97 KW w zw. z art. 45 ust. 2 pkt 1 PRD',
  },
  {
    id: 'ph-2',
    category: 'phone_belts',
    title: 'Kierowanie pojazdem bez zapiętych pasów bezpieczeństwa',
    description: 'Jazda kierowcy bez użycia pasów',
    fineMin: 100,
    fineMax: 100,
    points: 5,
    article: 'Art. 97 KW',
  },
  {
    id: 'ph-3',
    category: 'phone_belts',
    title: 'Przewożenie dziecka poza fotelikiem bezpieczeństwa lub innym urządzeniem',
    description: 'Naruszenie przepisów o bezpiecznym przewozie dzieci',
    fineMin: 300,
    fineMax: 300,
    points: 6,
    article: 'Art. 97 KW',
  },

  // ALKOHOL I BEZPIECZEŃSTWO
  {
    id: 'alc-1',
    category: 'alcohol',
    title: 'Kierowanie pojazdem w stanie po użyciu alkoholu (od 0,2 do 0,5 promila)',
    description: 'Wykroczenie: grzywna w sądzie min. 2500 zł do 30 000 zł, zakaz prowadzenia od 6 miesięcy do 3 lat',
    fineMin: 2500,
    fineMax: 5000,
    points: 15,
    lossOfLicense: true,
    article: 'Art. 87 § 1 KW',
  },
  {
    id: 'gen-1',
    category: 'general',
    title: 'Jazda autostradą lub drogą ekspresową w kierunku przeciwnym do dozwolonego (pod prąd)',
    description: 'Śmiertelne zagrożenie dla ruchu drogowego',
    fineMin: 2000,
    fineMax: 2000,
    points: 15,
    article: 'Art. 97 KW',
  },
  {
    id: 'gen-2',
    category: 'general',
    title: 'Niezachowanie bezpiecznej odległości między pojazdami na autostradzie / drodze ekspresowej',
    description: 'Zasada połowy prędkości (jazda na zderzaku)',
    fineMin: 300,
    fineMax: 500,
    points: 5,
    article: 'Art. 97 KW',
  },
];
