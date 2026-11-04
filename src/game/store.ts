import { create } from "zustand";
import { assessHand, chooseCard } from "./ai.ts";
import {
  bindAudioLifecycle,
  setSoundEnabled,
  sfxBid,
  sfxDeal,
  sfxLose,
  sfxMiss,
  sfxPlay,
  sfxTake,
  sfxWin,
  sfxYouTake,
  unlockAudio,
} from "./audio.ts";
import {
  type MatchState,
  type Phase,
  type Seat,
  MAX_BID,
  MIN_BID,
  ROUNDS,
  SEATS,
  actionPrompt,
  closeTrick,
  dealMatch,
  legalCards,
  nextSeat,
  styleFor,
  tableResult,
  totalsOf,
  winningPlay,
} from "./logic.ts";
import { type Stats, emptyStats, loadSave, writeSave } from "./persist.ts";

export { unlockAudio, bindAudioLifecycle };

type Store = {
  hydrated: boolean;
  phase: Phase;
  match: MatchState | null;
  playerName: string;
  sound: boolean;
  stats: Stats;
  selectedCardId: string | null;
  hint: string;
  hydrate: () => void;
  setName: (name: string) => void;
  toggleSound: () => void;
  newMatch: () => void;
  placeBid: (seat: Seat, bid: number) => void;
  selectCard: (id: string | null) => void;
  playCard: (seat: Seat, cardId: string) => void;
  setHint: (hint: string) => void;
  botBid: () => void;
  botPlay: () => void;
  finishTrick: () => void;
  nextHand: () => void;
  showFinal: () => void;
  leave: () => void;
};

let token = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

export function invalidateTimers() {
  token += 1;
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

function delayFor(ms: number): number {
  if (typeof window === "undefined") return ms;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return Math.min(ms, 70);
  return ms;
}

function later(ms: number, fn: () => void) {
  if (timer !== null) clearTimeout(timer);
  const mine = ++token;
  timer = setTimeout(() => {
    if (mine !== token) return;
    timer = null;
    fn();
  }, delayFor(ms));
}

function buzz(ms: number) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(ms);
    } catch {
      /* unsupported */
    }
  }
}

export const useGame = create<Store>((set, get) => {
  function persist() {
    const state = get();
    writeSave({
      version: 1,
      playerName: state.playerName,
      sound: state.sound,
      stats: state.stats,
      phase: state.phase,
      match: state.match,
    });
  }

  function pump() {
    const state = get();
    if (!state.hydrated || !state.match) {
      invalidateTimers();
      return;
    }
    if (state.phase === "bidding" && state.match.turn !== 0) later(460, () => get().botBid());
    else if (state.phase === "playing" && state.match.turn !== 0) later(540, () => get().botPlay());
    else if (state.phase === "resolving") later(760, () => get().finishTrick());
    else invalidateTimers();
  }

  function openMatch(match: MatchState) {
    const name = get().playerName;
    set({
      phase: "bidding",
      match,
      selectedCardId: null,
      hint: actionPrompt(match, "bidding", name),
    });
    sfxDeal();
    persist();
    pump();
  }

  return {
    hydrated: false,
    phase: "lobby",
    match: null,
    playerName: "You",
    sound: true,
    stats: emptyStats(),
    selectedCardId: null,
    hint: "",

    hydrate: () => {
      invalidateTimers();
      const save = loadSave();
      if (!save) {
        set({ hydrated: true });
        return;
      }
      let phase = save.phase;
      let match = save.match;
      if (phase !== "lobby" && !match) phase = "lobby";
      if (phase === "resolving" && match) {
        const settled = closeTrick(match);
        phase = settled.phase;
        match = settled.match;
      }
      if (phase === "gameOver" && (!match || match.records.length === 0)) {
        phase = "lobby";
        match = null;
      }
      setSoundEnabled(save.sound);
      const playerName = save.playerName.trim() ? save.playerName : "You";
      set({
        hydrated: true,
        playerName,
        sound: save.sound,
        stats: save.stats,
        phase,
        match,
        selectedCardId: null,
        hint: match ? actionPrompt(match, phase, playerName) : "",
      });
      persist();
      pump();
    },

    setName: (playerName) => {
      set({ playerName: playerName.slice(0, 16) });
      persist();
    },

    toggleSound: () => {
      const sound = !get().sound;
      setSoundEnabled(sound);
      if (sound) {
        unlockAudio();
        sfxBid();
      }
      set({ sound });
      persist();
    },

    newMatch: () => {
      unlockAudio();
      invalidateTimers();
      openMatch(dealMatch(3, 1, []));
    },

    placeBid: (seat, bid) => {
      const state = get();
      const match = state.match;
      if (!match || state.phase !== "bidding" || match.turn !== seat) return;
      if (!Number.isInteger(bid) || bid < MIN_BID || bid > MAX_BID) return;
      const bids = match.bids.slice() as MatchState["bids"];
      bids[seat] = bid;
      const finished = bids.every((value) => value !== null);
      let phase: Phase = "bidding";
      let next: MatchState;
      if (!finished) {
        next = { ...match, bids, turn: nextSeat(seat) };
      } else {
        const leader = nextSeat(match.dealer);
        next = { ...match, bids, turn: leader, leader, trick: [], trickWinner: null };
        phase = "playing";
      }
      sfxBid();
      set({
        phase,
        match: next,
        hint: actionPrompt(next, phase, state.playerName),
      });
      persist();
      pump();
    },

    selectCard: (selectedCardId) => set({ selectedCardId }),

    setHint: (hint) => set({ hint }),

    playCard: (seat, cardId) => {
      const state = get();
      const match = state.match;
      if (!match || state.phase !== "playing" || match.turn !== seat) return;
      const card = match.hands[seat].find((held) => held.id === cardId);
      if (!card) return;
      if (!legalCards(match.hands[seat], match.trick).some((legal) => legal.id === card.id)) return;
      const hands = match.hands.map((hand, index) =>
        index === seat ? hand.filter((held) => held.id !== card.id) : hand,
      ) as MatchState["hands"];
      const trick = match.trick.concat([{ seat, card }]);
      const seen = match.seen.concat([card]);
      sfxPlay();
      if (seat === 0) buzz(8);
      if (trick.length < 4) {
        const turn = nextSeat(seat);
        const next: MatchState = { ...match, hands, trick, seen, turn };
        set({
          phase: "playing",
          match: next,
          selectedCardId: null,
          hint: actionPrompt(next, "playing", state.playerName),
        });
        persist();
        pump();
        return;
      }
      const winner = winningPlay(trick).seat;
      const tricksWon = match.tricksWon.slice() as MatchState["tricksWon"];
      tricksWon[winner] += 1;
      const next: MatchState = {
        ...match,
        hands,
        trick,
        seen,
        tricksWon,
        trickWinner: winner,
        turn: winner,
      };
      if (winner === 0) {
        sfxYouTake();
        buzz(14);
      } else sfxTake();
      set({
        phase: "resolving",
        match: next,
        selectedCardId: null,
        hint: actionPrompt(next, "resolving", state.playerName),
      });
      persist();
      pump();
    },

    botBid: () => {
      const state = get();
      const match = state.match;
      if (!match || state.phase !== "bidding" || match.turn === 0) return;
      const seat = match.turn;
      const bid = assessHand(match.hands[seat], styleFor(seat)).bid;
      get().placeBid(seat, bid);
    },

    botPlay: () => {
      const state = get();
      const match = state.match;
      if (!match || state.phase !== "playing" || match.turn === 0) return;
      const seat = match.turn;
      try {
        const completed =
          match.tricksWon[0] + match.tricksWon[1] + match.tricksWon[2] + match.tricksWon[3];
        const card = chooseCard({
          hand: match.hands[seat],
          trick: match.trick,
          bid: match.bids[seat] ?? MIN_BID,
          tricksWon: match.tricksWon[seat],
          tricksPlayed: completed,
          seen: match.seen,
        });
        get().playCard(seat, card.id);
      } catch {
        set({ hint: "The hand stalled. Leave the table and deal again." });
      }
    },

    finishTrick: () => {
      const state = get();
      const match = state.match;
      if (!match || state.phase !== "resolving") return;
      const settled = closeTrick(match);
      if (settled.phase === "handSummary") {
        const record = settled.match.records[settled.match.records.length - 1];
        if (record && record.points[0] < 0) sfxMiss();
        else sfxTake();
      }
      set({
        phase: settled.phase,
        match: settled.match,
        selectedCardId: null,
        hint: actionPrompt(settled.match, settled.phase, state.playerName),
      });
      persist();
      pump();
    },

    nextHand: () => {
      const state = get();
      const match = state.match;
      if (!match || state.phase !== "handSummary") return;
      if (match.records.length >= ROUNDS) {
        get().showFinal();
        return;
      }
      invalidateTimers();
      openMatch(dealMatch(nextSeat(match.dealer), match.round + 1, match.records));
    },

    showFinal: () => {
      const state = get();
      const match = state.match;
      if (!match || state.phase !== "handSummary") return;
      const totals = totalsOf(match.records);
      const best = Math.max(...totals);
      const winners = SEATS.filter((seat) => totals[seat] === best);
      const stats: Stats = {
        games: state.stats.games + 1,
        wins: state.stats.wins + (winners.length === 1 && winners[0] === 0 ? 1 : 0),
        bestTenths:
          state.stats.bestTenths === null || totals[0] > state.stats.bestTenths
            ? totals[0]
            : state.stats.bestTenths,
      };
      if (winners.length === 1 && winners[0] === 0) sfxWin();
      else if (!winners.includes(0)) sfxLose();
      else sfxTake();
      set({
        phase: "gameOver",
        stats,
        hint: tableResult(totals, state.playerName),
      });
      persist();
      invalidateTimers();
    },

    leave: () => {
      invalidateTimers();
      set({ phase: "lobby", match: null, selectedCardId: null, hint: "" });
      persist();
    },
  };
});
