export interface Athlete {
  id: string;
  name: string;
  class: string;
  house: string;
  gender: 'L' | 'P';
  category: string;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  points: number;
  displayStats?: {
    gold: number;
    silver: number;
    bronze: number;
    points: number;
    trackGold: number;
  };
}

export interface Event {
  id: string;
  code: string;
  name: string;
  category: string;
  gender: 'L' | 'P';
  type: 'track' | 'field';
  status: 'upcoming' | 'completed';
  result: {
    winners: Winner[];
  } | null;
  participants: string[]; // Athlete IDs
  laneAssignment: Record<string, number>; // Athlete ID -> Lane Number
}

export interface Winner {
  id?: string;
  name: string;
  house: string;
  rank: string;
  value: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  event: string;
  category: string;
  venue: string;
}

export interface ResultLog {
  id?: string;
  eventId: string;
  eventName: string;
  stage: 'Saringan' | 'Akhir';
  winners: Winner[];
  timestamp: string;
}

export interface House {
  id: string;
  name: string;
  active: boolean;
}

export interface ChampionConfig {
  cats: string[];
  years: string[];
  mode: 'AND' | 'OR';
}

export interface AppConfig {
  schoolName: string;
  year: string;
  enableEventLimit: boolean;
  maxInd: number;
  maxTeam: number;
  championConfig: {
    main: ChampionConfig;
    hope: ChampionConfig;
  };
}

export interface ExternalPoints {
  merentasDesa: {
    enabled: boolean;
    scores: Record<string, number>;
  };
  sukantara: {
    enabled: boolean;
    scores: Record<string, number>;
  };
}

export interface PointsConfig {
  gold: number;
  silver: number;
  bronze: number;
  fourth: number;
}

export interface AppData {
  config: AppConfig;
  houses: House[];
  athletes: Athlete[];
  events: Event[];
  scheduleItems: ScheduleItem[];
  resultsLog: ResultLog[];
  pointsConfig: PointsConfig;
  externalPoints: ExternalPoints;
}
