import { Athlete, Event, ResultLog, PointsConfig, House, ExternalPoints } from '../types';

export const getNormalizedHouseId = (rawHouse: string, houses: House[]): string => {
  const raw = (rawHouse || "").toString().trim().toLowerCase();
  if (raw.includes('merah')) return 'Merah';
  if (raw.includes('biru')) return 'Biru';
  if (raw.includes('kuning')) return 'Kuning';
  if (raw.includes('hijau')) return 'Hijau';
  const houseByName = houses.find(h => h.name.toLowerCase() === raw);
  return houseByName ? houseByName.id : (rawHouse || "Tidak Diketahui");
};

export const getDisplayHouseName = (houseIdOrName: string, houses: House[]): string => {
  const normalizedId = getNormalizedHouseId(houseIdOrName, houses);
  const h = houses.find(x => x.id === normalizedId);
  return h ? h.name : houseIdOrName;
};

export const isFieldEvent = (eventOrName: string | Event): boolean => {
  let nameToCheck = eventOrName;
  if (typeof eventOrName === 'object' && eventOrName !== null) {
    nameToCheck = eventOrName.name || "";
  }

  if (!nameToCheck) return false;

  const n = String(nameToCheck).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s{2,}/g, " ").trim();

  const fieldKeywords = [
    'lompat', 'high jump', 'long jump', 'triple jump', 'pole vault', 'kijang', 'galah',
    'lontar', 'shot', 'put', 'peluru',
    'rejam', 'javelin', 'lembing',
    'lempar', 'discus', 'cakera', 'tukul', 'hammer',
    'baling',
    'besi',
    'l jauh', 'l tinggi', 'l kijang', 'l galah',
    'ljauh', 'ltinggi', 'lkijang', 'lgalah',
    'r lembing', 'm lembing'
  ];

  if (fieldKeywords.some(keyword => n.includes(keyword))) {
    return true;
  }

  if (typeof eventOrName === 'object' && eventOrName !== null) {
    if (eventOrName.type === 'field') return true;
  }

  return false;
};

export const calculateHouseStats = (
  resultsLog: ResultLog[],
  events: Event[],
  houses: House[],
  pointsConfig: PointsConfig,
  externalPoints: ExternalPoints
) => {
  const houseStats: Record<string, { id: string; name: string; gold: number; silver: number; bronze: number; points: number }> = {};
  
  houses.filter(h => h.active !== false).forEach(h => {
    houseStats[h.id] = { id: h.id, name: h.name, gold: 0, silver: 0, bronze: 0, points: 0 };
  });

  if (resultsLog) {
    resultsLog.forEach(log => {
      if (log.stage !== 'Akhir' || !log.winners) return;

      const isRelay = /4x|kuartet|relay|berpasukan/i.test(log.eventName);
      const houseRankTracker = new Set();

      log.winners.forEach(w => {
        const hId = getNormalizedHouseId(w.house, houses);
        if (!houseStats[hId]) return;

        const rank = parseInt(w.rank);
        const rankKey = `${hId}-${rank}`;

        if (isRelay) {
          if (houseRankTracker.has(rankKey)) return;
          houseRankTracker.add(rankKey);
        }

        if (rank === 1) houseStats[hId].gold += 1;
        else if (rank === 2) houseStats[hId].silver += 1;
        else if (rank === 3) houseStats[hId].bronze += 1;

        if (rank === 1) houseStats[hId].points += pointsConfig.gold;
        else if (rank === 2) houseStats[hId].points += pointsConfig.silver;
        else if (rank === 3) houseStats[hId].points += pointsConfig.bronze;
        else if (rank === 4) houseStats[hId].points += pointsConfig.fourth;
      });
    });
  }

  const ext = externalPoints;
  const houseIds = ['Merah', 'Biru', 'Kuning', 'Hijau'];
  if (ext.merentasDesa.enabled) houseIds.forEach(id => { if (houseStats[id]) houseStats[id].points += parseInt(String(ext.merentasDesa.scores[id] || 0)); });
  if (ext.sukantara.enabled) houseIds.forEach(id => { if (houseStats[id]) houseStats[id].points += parseInt(String(ext.sukantara.scores[id] || 0)); });

  return Object.values(houseStats).sort((a, b) => b.points - a.points);
};

export const getTopAthletes = (
  athletes: Athlete[],
  resultsLog: ResultLog[],
  events: Event[],
  pointsConfig: PointsConfig,
  gender: 'L' | 'P' | null,
  criteria: { cats: string[]; years: string[]; mode: 'AND' | 'OR' } | null = null,
  excludeTeamEvents: boolean = false
) => {
  let filteredAthletes = [...athletes];
  if (gender) filteredAthletes = filteredAthletes.filter(a => a.gender === gender);

  if (criteria) {
    filteredAthletes = filteredAthletes.filter(a => {
      const catMatch = criteria.cats.length === 0 || criteria.cats.includes(String(a.category).toUpperCase());
      const studentYear = a.class ? a.class.trim().charAt(0) : '';
      const yearMatch = criteria.years.length === 0 || criteria.years.includes(studentYear);
      if (criteria.mode === 'AND') return catMatch && yearMatch;
      return catMatch || yearMatch;
    });
  }

  if (excludeTeamEvents) {
    const indStats: Record<string, { gold: number; silver: number; bronze: number; points: number; trackGold: number }> = {};

    filteredAthletes.forEach(a => {
      indStats[a.id] = { gold: 0, silver: 0, bronze: 0, points: 0, trackGold: 0 };
    });

    if (resultsLog) {
      resultsLog.forEach(log => {
        const event = events.find(e => e.id.toString() === log.eventId.toString());
        if (!event) return;

        const eventNameLower = event.name.toLowerCase();
        if (eventNameLower.includes('4x') || eventNameLower.includes('kuartet') || eventNameLower.includes('pasukan')) {
          return;
        }

        const isTrack = (event.type === 'track') || (!event.type && !isFieldEvent(event.name));

        if (log.winners && log.stage === 'Akhir') {
          log.winners.forEach(w => {
            let athleteId = w.id;
            if (!athleteId) {
              const a = filteredAthletes.find(ath => ath.name === w.name);
              if (a) athleteId = a.id;
            }

            if (athleteId && indStats[athleteId]) {
              const rank = parseInt(w.rank);
              if (rank === 1) {
                indStats[athleteId].gold++;
                if (isTrack) indStats[athleteId].trackGold++;
                indStats[athleteId].points += pointsConfig.gold;
              } else if (rank === 2) {
                indStats[athleteId].silver++;
                indStats[athleteId].points += pointsConfig.silver;
              } else if (rank === 3) {
                indStats[athleteId].bronze++;
                indStats[athleteId].points += pointsConfig.bronze;
              } else if (rank === 4) {
                indStats[athleteId].points += pointsConfig.fourth;
              }
            }
          });
        }
      });
    }

    filteredAthletes.sort((a, b) => {
      const sA = indStats[a.id];
      const sB = indStats[b.id];

      if (sB.gold !== sA.gold) return sB.gold - sA.gold;
      if (sB.silver !== sA.silver) return sB.silver - sA.silver;
      if (sB.bronze !== sA.bronze) return sB.bronze - sA.bronze;
      if (sB.trackGold !== sA.trackGold) return sB.trackGold - sA.trackGold;
      return sB.points - sA.points;
    });

    filteredAthletes.forEach(a => {
      a.displayStats = indStats[a.id];
    });

    return filteredAthletes;
  }

  return filteredAthletes.sort((a, b) => {
    if ((b.medals.gold || 0) !== (a.medals.gold || 0)) return (b.medals.gold || 0) - (a.medals.gold || 0);
    if ((b.medals.silver || 0) !== (a.medals.silver || 0)) return (b.medals.silver || 0) - (a.medals.silver || 0);
    return b.points - a.points;
  });
};
