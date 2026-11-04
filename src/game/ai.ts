import {
  type BidStyle,
  type Card,
  type HandRecord,
  type Played,
  type Seat,
  type Suit,
  MAX_BID,
  MIN_BID,
  beats,
  legalCards,
  nextSeat,
  scoreTenths,
  suitName,
  winningPlay,
} from "./logic.ts";

export type Assessment = { bid: number; notes: string[] };

export function assessHand(hand: Card[], style: BidStyle): Assessment {
  const grouped: Record<Suit, Card[]> = { S: [], H: [], D: [], C: [] };
  for (const card of hand) grouped[card.suit].push(card);
  const notes: { w: number; text: string }[] = [];
  let estimate = 0;
  const add = (weight: number, text: string) => {
    estimate += weight;
    if (weight >= 0.4 && text) notes.push({ w: weight, text });
  };
  const holds = (cards: Card[], rank: number) => cards.some((card) => card.rank === rank);

  const spades = grouped.S;
  if (holds(spades, 14)) add(1, "Ace of spades");
  if (holds(spades, 13)) {
    add(holds(spades, 14) || spades.length >= 3 ? 0.9 : 0.4, "King of spades");
  }
  if (holds(spades, 12)) {
    add(holds(spades, 14) || holds(spades, 13) || spades.length >= 4 ? 0.7 : 0.15, "Queen of spades");
  }
  if (holds(spades, 11) && spades.length >= 4 && (holds(spades, 14) || holds(spades, 13))) {
    add(0.4, "Jack of spades");
  }
  if (spades.length >= 4) add((spades.length - 3) * 0.36, `${spades.length} spades, so length tricks`);

  if (hand.length === 13) {
    for (const suit of ["H", "D", "C"] as const) {
      const cards = grouped[suit];
      const name = suitName(suit);
      if (cards.length === 0) {
        if (spades.length >= 2) add(0.62, `No ${name} — room to trump`);
        else if (spades.length === 1) add(0.28, "");
        continue;
      }
      if (cards.length === 1) {
        if (holds(cards, 14)) add(0.82, `Bare ace of ${name}`);
        else if (spades.length >= 2) add(0.28, "");
        continue;
      }
      if (holds(cards, 14)) add(1, `Ace of ${name}`);
      if (holds(cards, 13)) {
        if (holds(cards, 14)) add(0.82, `King of ${name}`);
        else if (cards.length >= 3) add(0.48, `King of ${name}, with company`);
        else add(0.22, "");
      }
      if (holds(cards, 12) && holds(cards, 14) && holds(cards, 13)) add(0.42, `Queen of ${name}`);
    }
  }

  const bias = style === "cautious" ? -0.35 : style === "bold" ? 0.35 : 0.05;
  let bid = Math.round(estimate + 1.15 + bias);
  if (bid < MIN_BID) bid = MIN_BID;
  if (bid > MAX_BID) bid = MAX_BID;

  notes.sort((a, b) => b.w - a.w);
  const seen = new Set<string>();
  const top: string[] = [];
  for (const note of notes) {
    if (seen.has(note.text)) continue;
    seen.add(note.text);
    top.push(note.text);
    if (top.length === 3) break;
  }
  if (top.length === 0) top.push("A thin hand. One is the lowest call.");
  return { bid, notes: top };
}

export function chooseCard(args: {
  hand: Card[];
  trick: Played[];
  bid: number;
  tricksWon: number;
  tricksPlayed: number;
  seen: Card[];
}): Card {
  const { hand, trick, bid, tricksWon, seen } = args;
  const legal = legalCards(hand, trick);
  if (legal.length === 0) return hand[0];
  if (legal.length === 1) return legal[0];

  const visible = seen.concat(trick.map((play) => play.card));
  const tricksLeft = 13 - args.tricksPlayed;
  const need = Math.max(0, bid - tricksWon);
  const want = need > 0 && need <= tricksLeft;
  const must = want && need >= tricksLeft;

  if (trick.length === 0) return leadCard(hand, visible, want, must);

  const lead = trick[0].card.suit;
  const current = winningPlay(trick).card;
  const winners = legal.filter((card) => beats(card, current, lead));
  const following = hand.some((card) => card.suit === lead);

  if (winners.length > 0 && want) {
    const cheap = cheapest(winners);
    const trumping = lead !== "S" && cheap.suit === "S";
    const saveHighTrump = trumping && !must && cheap.rank >= 12 && tricksLeft - 1 >= need;
    if (!saveHighTrump) return cheap;
  } else if (winners.length > 0 && !want) {
    const ducks = legal.filter((card) => !winners.includes(card));
    if (ducks.length > 0) return discard(ducks);
    return cheapest(winners);
  }

  return discard(legal, !following && want);
}

export function simulateGame(rng: () => number): HandRecord[] {
  let dealer: Seat = 3;
  const records: HandRecord[] = [];
  const styles: BidStyle[] = ["even", "cautious", "even", "bold"];
  for (let round = 0; round < 5; round++) {
    if (round > 0) dealer = nextSeat(dealer);
    const deck = shuffled(rng);
    const hands: Card[][] = [[], [], [], []];
    const start = nextSeat(dealer);
    for (let i = 0; i < deck.length; i++) hands[(start + i) % 4].push(deck[i]);
    const bids = hands.map((hand, seat) => assessHand(hand, styles[seat]).bid) as [
      number,
      number,
      number,
      number,
    ];
    const tricks: [number, number, number, number] = [0, 0, 0, 0];
    let leader: Seat = start;
    const seen: Card[] = [];
    for (let trickIndex = 0; trickIndex < 13; trickIndex++) {
      const trick: Played[] = [];
      let seat = leader;
      for (let turn = 0; turn < 4; turn++) {
        const card = chooseCard({
          hand: hands[seat],
          trick,
          bid: bids[seat],
          tricksWon: tricks[seat],
          tricksPlayed: trickIndex,
          seen,
        });
        if (!legalCards(hands[seat], trick).some((legal) => legal.id === card.id)) {
          throw new Error(`illegal play ${card.id}`);
        }
        hands[seat] = hands[seat].filter((held) => held.id !== card.id);
        trick.push({ seat, card });
        seen.push(card);
        seat = nextSeat(seat);
      }
      const winner = winningPlay(trick).seat;
      tricks[winner] += 1;
      leader = winner;
    }
    if (hands.some((hand) => hand.length !== 0)) throw new Error("cards left in hand");
    const points = bids.map((bid, seat) => scoreTenths(bid, tricks[seat])) as [
      number,
      number,
      number,
      number,
    ];
    records.push({ bids, tricks, points });
  }
  return records;
}

function shuffled(rng: () => number): Card[] {
  const cards: Card[] = [];
  for (const suit of ["S", "H", "D", "C"] as const) {
    for (let rank = 2; rank <= 14; rank++) {
      cards.push({ id: `${suit}${rank}`, suit, rank: rank as Card["rank"] });
    }
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = cards[i];
    cards[i] = cards[j];
    cards[j] = swap;
  }
  return cards;
}

function leadCard(hand: Card[], visible: Card[], want: boolean, must: boolean): Card {
  const spades = hand.filter((card) => card.suit === "S");
  const side = hand.filter((card) => card.suit !== "S");
  const groups = suitGroups(hand);

  if (!want) {
    if (side.length > 0) return lowest(side.filter((card) => card.suit === longestSuit(side)));
    return lowest(hand);
  }

  const highMasters = side.filter((card) => card.rank >= 12 && isMaster(card, hand, visible));
  const highLead = bestMaster(highMasters, groups);
  if (highLead) return highLead;

  const trumpMasters = spades.filter((card) => isMaster(card, hand, visible));
  if (trumpMasters.length > 0 && (must || side.length === 0 || spades.length >= 4)) {
    return highest(trumpMasters);
  }

  const anyLead = bestMaster(
    side.filter((card) => isMaster(card, hand, visible)),
    groups,
  );
  if (anyLead) return anyLead;

  if (!must && spades.length > 0 && side.length > 0) {
    const suit = shortestSuit(side);
    const pile = side.filter((card) => card.suit === suit);
    if (pile.length <= 2) return lowest(pile);
  }

  if (trumpMasters.length > 0) return highest(trumpMasters);
  if (must && spades.length > 0) return highest(spades);
  if (side.length > 0) return lowest(side.filter((card) => card.suit === shortestSuit(side)));
  return highest(hand);
}

function isMaster(card: Card, hand: Card[], visible: Card[]): boolean {
  const held = new Set<number>(hand.filter((c) => c.suit === card.suit).map((c) => c.rank));
  const gone = new Set<number>(visible.filter((c) => c.suit === card.suit).map((c) => c.rank));
  for (let rank = card.rank + 1; rank <= 14; rank++) {
    if (!held.has(rank) && !gone.has(rank)) return false;
  }
  return true;
}

function bestMaster(masters: Card[], groups: Map<Suit, Card[]>): Card | null {
  if (masters.length === 0) return null;
  const suits = [...new Set(masters.map((card) => card.suit))];
  suits.sort((a, b) => {
    const lengthDelta = (groups.get(b)?.length ?? 0) - (groups.get(a)?.length ?? 0);
    if (lengthDelta !== 0) return lengthDelta;
    return highest(masters.filter((card) => card.suit === b)).rank - highest(masters.filter((card) => card.suit === a)).rank;
  });
  return highest(masters.filter((card) => card.suit === suits[0]));
}

function cheapest(cards: Card[]): Card {
  return cards.slice().sort((a, b) => {
    const trumpDelta = (a.suit === "S" ? 1 : 0) - (b.suit === "S" ? 1 : 0);
    if (trumpDelta !== 0) return trumpDelta;
    return a.rank - b.rank;
  })[0];
}

function discard(cards: Card[], _preferVoid = true): Card {
  if (cards.length === 1) return cards[0];
  const nonTrump = cards.filter((card) => card.suit !== "S");
  const pool = nonTrump.length > 0 ? nonTrump : cards;
  const groups = suitGroups(pool);
  let pick: Card[] | null = null;
  for (const pile of groups.values()) {
    if (!pick || pile.length < pick.length) pick = pile;
    else if (pile.length === pick.length && lowest(pile).rank < lowest(pick).rank) pick = pile;
  }
  return lowest(pick ?? pool);
}

function suitGroups(cards: Card[]): Map<Suit, Card[]> {
  const groups = new Map<Suit, Card[]>();
  for (const card of cards) {
    const pile = groups.get(card.suit);
    if (pile) pile.push(card);
    else groups.set(card.suit, [card]);
  }
  return groups;
}

function longestSuit(cards: Card[]): Suit {
  return extremeSuit(cards, "long");
}

function shortestSuit(cards: Card[]): Suit {
  return extremeSuit(cards, "short");
}

function extremeSuit(cards: Card[], mode: "long" | "short"): Suit {
  const groups = suitGroups(cards);
  let best = cards[0].suit;
  let bestLength = groups.get(best)?.length ?? 0;
  for (const [suit, pile] of groups) {
    if (mode === "long" ? pile.length > bestLength : pile.length < bestLength) {
      best = suit;
      bestLength = pile.length;
    }
  }
  return best;
}

function highest(cards: Card[]): Card {
  return cards.reduce((best, card) => (card.rank > best.rank ? card : best));
}

function lowest(cards: Card[]): Card {
  return cards.reduce((best, card) => (card.rank < best.rank ? card : best));
}
