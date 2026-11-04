import type { MatchState, Phase } from "./logic.ts";

export type Stats = {
  games: number;
  wins: number;
  bestTenths: number | null;
};

export type SaveData = {
  version: 1;
  playerName: string;
  sound: boolean;
  stats: Stats;
  phase: Phase;
  match: MatchState | null;
};

const KEY = "callbreak.v1";

const PHASES: Phase[] = ["lobby", "bidding", "playing", "resolving", "handSummary", "gameOver"];

export function emptyStats(): Stats {
  return { games: 0, wins: 0, bestTenths: null };
}

export function isMatch(value: unknown): value is MatchState {
  if (!value || typeof value !== "object") return false;
  const match = value as MatchState;
  if (typeof match.round !== "number" || match.round < 1 || match.round > 5) return false;
  if (!Array.isArray(match.hands) || match.hands.length !== 4) return false;
  if (!match.hands.every((hand) => Array.isArray(hand))) return false;
  if (!Array.isArray(match.bids) || match.bids.length !== 4) return false;
  if (!Array.isArray(match.tricksWon) || match.tricksWon.length !== 4) return false;
  if (!Array.isArray(match.trick) || !Array.isArray(match.seen) || !Array.isArray(match.records)) return false;
  return match.turn === 0 || match.turn === 1 || match.turn === 2 || match.turn === 3;
}

export function loadSave(): SaveData | null {
  if (typeof localStorage === "undefined") return null;
  const parsed = read(KEY) ?? read(`${KEY}.bak`);
  return parsed;
}

function read(key: string): SaveData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (!data || data.version !== 1) return null;
    const phase = PHASES.includes(data.phase as Phase) ? (data.phase as Phase) : "lobby";
    const statsIn = data.stats;
    return {
      version: 1,
      playerName: typeof data.playerName === "string" ? data.playerName.slice(0, 16) : "You",
      sound: data.sound !== false,
      stats: {
        games: finite(statsIn?.games),
        wins: finite(statsIn?.wins),
        bestTenths: statsIn?.bestTenths == null ? null : finite(statsIn.bestTenths),
      },
      phase,
      match: isMatch(data.match) ? data.match : null,
    };
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData) {
  if (typeof localStorage === "undefined") return;
  try {
    const prev = localStorage.getItem(KEY);
    if (prev) localStorage.setItem(`${KEY}.bak`, prev);
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode or quota */
  }
}

function finite(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
