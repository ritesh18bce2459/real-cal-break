export const SUITS = ["S", "H", "D", "C"] as const;
export type Suit = (typeof SUITS)[number];

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type Card = { id: string; suit: Suit; rank: Rank };

export type Seat = 0 | 1 | 2 | 3;
export const SEATS: Seat[] = [0, 1, 2, 3];

export type Played = { seat: Seat; card: Card };

export type BidStyle = "cautious" | "even" | "bold";

export type Phase =
  | "lobby"
  | "bidding"
  | "playing"
  | "resolving"
  | "handSummary"
  | "gameOver";

export type HandRecord = {
  bids: [number, number, number, number];
  tricks: [number, number, number, number];
  points: [number, number, number, number];
};

export type MatchState = {
  round: number;
  dealer: Seat;
  hands: [Card[], Card[], Card[], Card[]];
  bids: [number | null, number | null, number | null, number | null];
  tricksWon: [number, number, number, number];
  trick: Played[];
  turn: Seat;
  leader: Seat;
  seen: Card[];
  records: HandRecord[];
  trickWinner: Seat | null;
};

export const ROUNDS = 5;
export const MIN_BID = 1;
export const MAX_BID = 8;

export const BOTS: Record<Exclude<Seat, 0>, { name: string; style: BidStyle }> = {
  1: { name: "Maya", style: "cautious" },
  2: { name: "Kabir", style: "even" },
  3: { name: "Meera", style: "bold" },
};

const SUIT_ORDER: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 };

export function nextSeat(seat: Seat): Seat {
  return ((seat + 1) % 4) as Seat;
}

export function seatName(seat: Seat, playerName: string): string {
  if (seat === 0) {
    const name = playerName.trim();
    return name.length ? name : "You";
  }
  return BOTS[seat].name;
}

export function styleFor(seat: Seat): BidStyle {
  return seat === 0 ? "even" : BOTS[seat].style;
}

export function suitName(suit: Suit): string {
  switch (suit) {
    case "S":
      return "spades";
    case "H":
      return "hearts";
    case "D":
      return "diamonds";
    case "C":
      return "clubs";
  }
}

export function rankLabel(rank: number): string {
  switch (rank) {
    case 14:
      return "A";
    case 13:
      return "K";
    case 12:
      return "Q";
    case 11:
      return "J";
    default:
      return String(rank);
  }
}

export function rankName(rank: number): string {
  switch (rank) {
    case 14:
      return "Ace";
    case 13:
      return "King";
    case 12:
      return "Queen";
    case 11:
      return "Jack";
    default:
      return String(rank);
  }
}

export function cardLabel(card: Card): string {
  return `${rankName(card.rank)} of ${suitName(card.suit)}`;
}

export function isRed(suit: Suit): boolean {
  return suit === "H" || suit === "D";
}

export function createDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 2; rank <= 14; rank++) {
      cards.push({ id: `${suit}${rank}`, suit, rank: rank as Rank });
    }
  }
  return cards;
}

export function shuffle<T>(list: readonly T[], rng: () => number = Math.random): T[] {
  const cards = list.slice();
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = cards[i];
    cards[i] = cards[j];
    cards[j] = swap;
  }
  return cards;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sortHand(hand: Card[]): Card[] {
  return hand.slice().sort((a, b) => SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit] || b.rank - a.rank);
}

export function dealMatch(
  dealer: Seat,
  round: number,
  records: HandRecord[],
  rng: () => number = Math.random,
): MatchState {
  const deck = shuffle(createDeck(), rng);
  const hands: [Card[], Card[], Card[], Card[]] = [[], [], [], []];
  const start = nextSeat(dealer);
  for (let i = 0; i < deck.length; i++) {
    hands[nextSeatIndex(start, i)].push(deck[i]);
  }
  return {
    round,
    dealer,
    hands: [sortHand(hands[0]), sortHand(hands[1]), sortHand(hands[2]), sortHand(hands[3])],
    bids: [null, null, null, null],
    tricksWon: [0, 0, 0, 0],
    trick: [],
    turn: start,
    leader: start,
    seen: [],
    records: records.slice(),
    trickWinner: null,
  };
}

function nextSeatIndex(start: Seat, step: number): Seat {
  return ((start + step) % 4) as Seat;
}

export function legalCards(hand: Card[], trick: Played[]): Card[] {
  if (trick.length === 0) return hand;
  const lead = trick[0].card.suit;
  const follow = hand.filter((card) => card.suit === lead);
  return follow.length > 0 ? follow : hand;
}

export function beats(card: Card, other: Card, lead: Suit): boolean {
  const cardTrump = card.suit === "S";
  const otherTrump = other.suit === "S";
  if (cardTrump && !otherTrump) return true;
  if (!cardTrump && otherTrump) return false;
  if (cardTrump && otherTrump) return card.rank > other.rank;
  if (card.suit !== lead) return false;
  if (other.suit !== lead) return true;
  return card.rank > other.rank;
}

export function winningPlay(trick: Played[]): Played {
  const lead = trick[0].card.suit;
  let best = trick[0];
  for (let i = 1; i < trick.length; i++) {
    if (beats(trick[i].card, best.card, lead)) best = trick[i];
  }
  return best;
}

export function scoreTenths(bid: number, tricks: number): number {
  if (tricks >= bid) return bid * 10 + (tricks - bid);
  return -bid * 10;
}

export function formatTenths(tenths: number): string {
  const negative = tenths < 0;
  const abs = Math.abs(tenths);
  const text = `${Math.floor(abs / 10)}.${abs % 10}`;
  return negative ? `−${text}` : text;
}

export function totalsOf(records: HandRecord[]): [number, number, number, number] {
  const totals: [number, number, number, number] = [0, 0, 0, 0];
  for (const record of records) {
    totals[0] += record.points[0];
    totals[1] += record.points[1];
    totals[2] += record.points[2];
    totals[3] += record.points[3];
  }
  return totals;
}

export function tricksPlayed(match: MatchState): number {
  return match.tricksWon[0] + match.tricksWon[1] + match.tricksWon[2] + match.tricksWon[3];
}

export function closeTrick(match: MatchState): { phase: "playing" | "handSummary"; match: MatchState } {
  if (tricksPlayed(match) >= 13) {
    const bids: [number, number, number, number] = [
      match.bids[0] ?? MIN_BID,
      match.bids[1] ?? MIN_BID,
      match.bids[2] ?? MIN_BID,
      match.bids[3] ?? MIN_BID,
    ];
    const tricks: [number, number, number, number] = [
      match.tricksWon[0],
      match.tricksWon[1],
      match.tricksWon[2],
      match.tricksWon[3],
    ];
    const points: [number, number, number, number] = [
      scoreTenths(bids[0], tricks[0]),
      scoreTenths(bids[1], tricks[1]),
      scoreTenths(bids[2], tricks[2]),
      scoreTenths(bids[3], tricks[3]),
    ];
    return {
      phase: "handSummary",
      match: {
        ...match,
        trick: [],
        trickWinner: null,
        records: [...match.records, { bids, tricks, points }],
      },
    };
  }
  const leader = match.trickWinner ?? match.turn;
  return {
    phase: "playing",
    match: { ...match, trick: [], trickWinner: null, leader, turn: leader },
  };
}

export function handPhrase(record: HandRecord): string {
  const bid = record.bids[0];
  const took = record.tricks[0];
  const points = formatTenths(record.points[0]);
  if (took < bid) return `Missed the call. ${bid} called, ${took} taken, ${points}.`;
  if (took === bid) return `Made the call exactly. ${points}.`;
  const over = took - bid;
  return `Made it, with ${over} overtrick${over === 1 ? "" : "s"}. ${points}.`;
}

export function actionPrompt(match: MatchState, phase: Phase, playerName: string): string {
  if (phase === "bidding") {
    if (match.turn === 0) return "Tap 1 to 8. A call cannot be changed.";
    return `${seatName(match.turn, playerName)} is choosing a call.`;
  }
  if (phase === "playing") {
    if (match.turn !== 0) return `${seatName(match.turn, playerName)} to play.`;
    if (match.trick.length === 0) return "Tap a card, then play it. Any suit may lead.";
    const lead = match.trick[0].card.suit;
    const canFollow = match.hands[0].some((card) => card.suit === lead);
    if (canFollow) return `Follow ${suitName(lead)}. Tap a card, then play it.`;
    return `No ${suitName(lead)} left. Any card — a spade trumps.`;
  }
  if (phase === "resolving") {
    if (match.trickWinner === 0) return "You take the trick.";
    if (match.trickWinner === null) return "";
    return `${seatName(match.trickWinner, playerName)} takes the trick.`;
  }
  if (phase === "handSummary") {
    const record = match.records[match.records.length - 1];
    return record ? handPhrase(record) : "";
  }
  return "";
}

export function statusLine(
  match: MatchState,
  phase: Phase,
): { text: string; tone: "idle" | "safe" | "bad" | "hot" } {
  if (phase === "bidding") {
    return match.turn === 0
      ? { text: "Your call", tone: "hot" }
      : { text: "Waiting on a call", tone: "idle" };
  }
  const bid = match.bids[0];
  if (bid === null) return { text: "Your call", tone: "hot" };
  const won = match.tricksWon[0];
  const left = 13 - tricksPlayed(match);
  if (won >= bid) {
    const over = won - bid;
    return { text: over === 0 ? "Call made" : `Call made, ${over} over`, tone: "safe" };
  }
  if (won + left < bid) return { text: "Call missed", tone: "bad" };
  return { text: `Need ${bid - won} · ${left} left`, tone: "hot" };
}

export type Standing = { seat: Seat; name: string; total: number; rank: number };

export function standings(totals: number[], playerName: string): Standing[] {
  const order = SEATS.slice().sort((a, b) => totals[b] - totals[a] || a - b);
  let rank = 0;
  let previous: number | null = null;
  return order.map((seat, index) => {
    if (previous === null || totals[seat] !== previous) rank = index + 1;
    previous = totals[seat];
    return { seat, name: seatName(seat, playerName), total: totals[seat], rank };
  });
}

export function tableResult(totals: number[], playerName: string): string {
  const best = Math.max(...totals);
  const winners = SEATS.filter((seat) => totals[seat] === best);
  if (winners.length === 1) {
    return winners[0] === 0 ? "You take the table" : `${seatName(winners[0], playerName)} takes the table`;
  }
  const names = winners.map((seat) => (seat === 0 ? "You" : seatName(seat, playerName)));
  if (winners.includes(0)) {
    const others = names.filter((name) => name !== "You");
    return `You share the table with ${others.join(" and ")}`;
  }
  return `${names.join(" and ")} share the table`;
}
