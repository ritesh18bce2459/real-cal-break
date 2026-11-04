import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Crown, i as Menu, n as Volume2, t as VolumeX } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DUrBF-Kl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SUITS = [
	"S",
	"H",
	"D",
	"C"
];
var SEATS = [
	0,
	1,
	2,
	3
];
var BOTS = {
	1: {
		name: "Maya",
		style: "cautious"
	},
	2: {
		name: "Kabir",
		style: "even"
	},
	3: {
		name: "Meera",
		style: "bold"
	}
};
var SUIT_ORDER = {
	S: 0,
	H: 1,
	D: 2,
	C: 3
};
function nextSeat(seat) {
	return (seat + 1) % 4;
}
function seatName(seat, playerName) {
	if (seat === 0) {
		const name = playerName.trim();
		return name.length ? name : "You";
	}
	return BOTS[seat].name;
}
function styleFor(seat) {
	return seat === 0 ? "even" : BOTS[seat].style;
}
function suitName(suit) {
	switch (suit) {
		case "S": return "spades";
		case "H": return "hearts";
		case "D": return "diamonds";
		case "C": return "clubs";
	}
}
function rankLabel(rank) {
	switch (rank) {
		case 14: return "A";
		case 13: return "K";
		case 12: return "Q";
		case 11: return "J";
		default: return String(rank);
	}
}
function rankName(rank) {
	switch (rank) {
		case 14: return "Ace";
		case 13: return "King";
		case 12: return "Queen";
		case 11: return "Jack";
		default: return String(rank);
	}
}
function cardLabel(card) {
	return `${rankName(card.rank)} of ${suitName(card.suit)}`;
}
function isRed(suit) {
	return suit === "H" || suit === "D";
}
function createDeck() {
	const cards = [];
	for (const suit of SUITS) for (let rank = 2; rank <= 14; rank++) cards.push({
		id: `${suit}${rank}`,
		suit,
		rank
	});
	return cards;
}
function shuffle(list, rng = Math.random) {
	const cards = list.slice();
	for (let i = cards.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const swap = cards[i];
		cards[i] = cards[j];
		cards[j] = swap;
	}
	return cards;
}
function sortHand(hand) {
	return hand.slice().sort((a, b) => SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit] || b.rank - a.rank);
}
function dealMatch(dealer, round, records, rng = Math.random) {
	const deck = shuffle(createDeck(), rng);
	const hands = [
		[],
		[],
		[],
		[]
	];
	const start = nextSeat(dealer);
	for (let i = 0; i < deck.length; i++) hands[nextSeatIndex(start, i)].push(deck[i]);
	return {
		round,
		dealer,
		hands: [
			sortHand(hands[0]),
			sortHand(hands[1]),
			sortHand(hands[2]),
			sortHand(hands[3])
		],
		bids: [
			null,
			null,
			null,
			null
		],
		tricksWon: [
			0,
			0,
			0,
			0
		],
		trick: [],
		turn: start,
		leader: start,
		seen: [],
		records: records.slice(),
		trickWinner: null
	};
}
function nextSeatIndex(start, step) {
	return (start + step) % 4;
}
function legalCards(hand, trick) {
	if (trick.length === 0) return hand;
	const lead = trick[0].card.suit;
	const follow = hand.filter((card) => card.suit === lead);
	return follow.length > 0 ? follow : hand;
}
function beats(card, other, lead) {
	const cardTrump = card.suit === "S";
	const otherTrump = other.suit === "S";
	if (cardTrump && !otherTrump) return true;
	if (!cardTrump && otherTrump) return false;
	if (cardTrump && otherTrump) return card.rank > other.rank;
	if (card.suit !== lead) return false;
	if (other.suit !== lead) return true;
	return card.rank > other.rank;
}
function winningPlay(trick) {
	const lead = trick[0].card.suit;
	let best = trick[0];
	for (let i = 1; i < trick.length; i++) if (beats(trick[i].card, best.card, lead)) best = trick[i];
	return best;
}
function scoreTenths(bid, tricks) {
	if (tricks >= bid) return bid * 10 + (tricks - bid);
	return -bid * 10;
}
function formatTenths(tenths) {
	const negative = tenths < 0;
	const abs = Math.abs(tenths);
	const text = `${Math.floor(abs / 10)}.${abs % 10}`;
	return negative ? `−${text}` : text;
}
function totalsOf(records) {
	const totals = [
		0,
		0,
		0,
		0
	];
	for (const record of records) {
		totals[0] += record.points[0];
		totals[1] += record.points[1];
		totals[2] += record.points[2];
		totals[3] += record.points[3];
	}
	return totals;
}
function tricksPlayed(match) {
	return match.tricksWon[0] + match.tricksWon[1] + match.tricksWon[2] + match.tricksWon[3];
}
function closeTrick(match) {
	if (tricksPlayed(match) >= 13) {
		const bids = [
			match.bids[0] ?? 1,
			match.bids[1] ?? 1,
			match.bids[2] ?? 1,
			match.bids[3] ?? 1
		];
		const tricks = [
			match.tricksWon[0],
			match.tricksWon[1],
			match.tricksWon[2],
			match.tricksWon[3]
		];
		const points = [
			scoreTenths(bids[0], tricks[0]),
			scoreTenths(bids[1], tricks[1]),
			scoreTenths(bids[2], tricks[2]),
			scoreTenths(bids[3], tricks[3])
		];
		return {
			phase: "handSummary",
			match: {
				...match,
				trick: [],
				trickWinner: null,
				records: [...match.records, {
					bids,
					tricks,
					points
				}]
			}
		};
	}
	const leader = match.trickWinner ?? match.turn;
	return {
		phase: "playing",
		match: {
			...match,
			trick: [],
			trickWinner: null,
			leader,
			turn: leader
		}
	};
}
function handPhrase(record) {
	const bid = record.bids[0];
	const took = record.tricks[0];
	const points = formatTenths(record.points[0]);
	if (took < bid) return `Missed the call. ${bid} called, ${took} taken, ${points}.`;
	if (took === bid) return `Made the call exactly. ${points}.`;
	const over = took - bid;
	return `Made it, with ${over} overtrick${over === 1 ? "" : "s"}. ${points}.`;
}
function actionPrompt(match, phase, playerName) {
	if (phase === "bidding") {
		if (match.turn === 0) return "Tap 1 to 8. A call cannot be changed.";
		return `${seatName(match.turn, playerName)} is choosing a call.`;
	}
	if (phase === "playing") {
		if (match.turn !== 0) return `${seatName(match.turn, playerName)} to play.`;
		if (match.trick.length === 0) return "Tap a card, then play it. Any suit may lead.";
		const lead = match.trick[0].card.suit;
		if (match.hands[0].some((card) => card.suit === lead)) return `Follow ${suitName(lead)}. Tap a card, then play it.`;
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
function statusLine(match, phase) {
	if (phase === "bidding") return match.turn === 0 ? {
		text: "Your call",
		tone: "hot"
	} : {
		text: "Waiting on a call",
		tone: "idle"
	};
	const bid = match.bids[0];
	if (bid === null) return {
		text: "Your call",
		tone: "hot"
	};
	const won = match.tricksWon[0];
	const left = 13 - tricksPlayed(match);
	if (won >= bid) {
		const over = won - bid;
		return {
			text: over === 0 ? "Call made" : `Call made, ${over} over`,
			tone: "safe"
		};
	}
	if (won + left < bid) return {
		text: "Call missed",
		tone: "bad"
	};
	return {
		text: `Need ${bid - won} · ${left} left`,
		tone: "hot"
	};
}
function standings(totals, playerName) {
	const order = SEATS.slice().sort((a, b) => totals[b] - totals[a] || a - b);
	let rank = 0;
	let previous = null;
	return order.map((seat, index) => {
		if (previous === null || totals[seat] !== previous) rank = index + 1;
		previous = totals[seat];
		return {
			seat,
			name: seatName(seat, playerName),
			total: totals[seat],
			rank
		};
	});
}
function tableResult(totals, playerName) {
	const best = Math.max(...totals);
	const winners = SEATS.filter((seat) => totals[seat] === best);
	if (winners.length === 1) return winners[0] === 0 ? "You take the table" : `${seatName(winners[0], playerName)} takes the table`;
	const names = winners.map((seat) => seat === 0 ? "You" : seatName(seat, playerName));
	if (winners.includes(0)) return `You share the table with ${names.filter((name) => name !== "You").join(" and ")}`;
	return `${names.join(" and ")} share the table`;
}
function assessHand(hand, style) {
	const grouped = {
		S: [],
		H: [],
		D: [],
		C: []
	};
	for (const card of hand) grouped[card.suit].push(card);
	const notes = [];
	let estimate = 0;
	const add = (weight, text) => {
		estimate += weight;
		if (weight >= .4 && text) notes.push({
			w: weight,
			text
		});
	};
	const holds = (cards, rank) => cards.some((card) => card.rank === rank);
	const spades = grouped.S;
	if (holds(spades, 14)) add(1, "Ace of spades");
	if (holds(spades, 13)) add(holds(spades, 14) || spades.length >= 3 ? .9 : .4, "King of spades");
	if (holds(spades, 12)) add(holds(spades, 14) || holds(spades, 13) || spades.length >= 4 ? .7 : .15, "Queen of spades");
	if (holds(spades, 11) && spades.length >= 4 && (holds(spades, 14) || holds(spades, 13))) add(.4, "Jack of spades");
	if (spades.length >= 4) add((spades.length - 3) * .36, `${spades.length} spades, so length tricks`);
	if (hand.length === 13) for (const suit of [
		"H",
		"D",
		"C"
	]) {
		const cards = grouped[suit];
		const name = suitName(suit);
		if (cards.length === 0) {
			if (spades.length >= 2) add(.62, `No ${name} — room to trump`);
			else if (spades.length === 1) add(.28, "");
			continue;
		}
		if (cards.length === 1) {
			if (holds(cards, 14)) add(.82, `Bare ace of ${name}`);
			else if (spades.length >= 2) add(.28, "");
			continue;
		}
		if (holds(cards, 14)) add(1, `Ace of ${name}`);
		if (holds(cards, 13)) {
			if (holds(cards, 14)) add(.82, `King of ${name}`);
			else if (cards.length >= 3) add(.48, `King of ${name}, with company`);
			else add(.22, "");
		}
		if (holds(cards, 12) && holds(cards, 14) && holds(cards, 13)) add(.42, `Queen of ${name}`);
	}
	const bias = style === "cautious" ? -.35 : style === "bold" ? .35 : .05;
	let bid = Math.round(estimate + 1.15 + bias);
	if (bid < 1) bid = 1;
	if (bid > 8) bid = 8;
	notes.sort((a, b) => b.w - a.w);
	const seen = /* @__PURE__ */ new Set();
	const top = [];
	for (const note of notes) {
		if (seen.has(note.text)) continue;
		seen.add(note.text);
		top.push(note.text);
		if (top.length === 3) break;
	}
	if (top.length === 0) top.push("A thin hand. One is the lowest call.");
	return {
		bid,
		notes: top
	};
}
function chooseCard(args) {
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
		if (!(lead !== "S" && cheap.suit === "S" && !must && cheap.rank >= 12 && tricksLeft - 1 >= need)) return cheap;
	} else if (winners.length > 0 && !want) {
		const ducks = legal.filter((card) => !winners.includes(card));
		if (ducks.length > 0) return discard(ducks);
		return cheapest(winners);
	}
	return discard(legal, !following && want);
}
function leadCard(hand, visible, want, must) {
	const spades = hand.filter((card) => card.suit === "S");
	const side = hand.filter((card) => card.suit !== "S");
	const groups = suitGroups(hand);
	if (!want) {
		if (side.length > 0) return lowest(side.filter((card) => card.suit === longestSuit(side)));
		return lowest(hand);
	}
	const highLead = bestMaster(side.filter((card) => card.rank >= 12 && isMaster(card, hand, visible)), groups);
	if (highLead) return highLead;
	const trumpMasters = spades.filter((card) => isMaster(card, hand, visible));
	if (trumpMasters.length > 0 && (must || side.length === 0 || spades.length >= 4)) return highest(trumpMasters);
	const anyLead = bestMaster(side.filter((card) => isMaster(card, hand, visible)), groups);
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
function isMaster(card, hand, visible) {
	const held = new Set(hand.filter((c) => c.suit === card.suit).map((c) => c.rank));
	const gone = new Set(visible.filter((c) => c.suit === card.suit).map((c) => c.rank));
	for (let rank = card.rank + 1; rank <= 14; rank++) if (!held.has(rank) && !gone.has(rank)) return false;
	return true;
}
function bestMaster(masters, groups) {
	if (masters.length === 0) return null;
	const suits = [...new Set(masters.map((card) => card.suit))];
	suits.sort((a, b) => {
		const lengthDelta = (groups.get(b)?.length ?? 0) - (groups.get(a)?.length ?? 0);
		if (lengthDelta !== 0) return lengthDelta;
		return highest(masters.filter((card) => card.suit === b)).rank - highest(masters.filter((card) => card.suit === a)).rank;
	});
	return highest(masters.filter((card) => card.suit === suits[0]));
}
function cheapest(cards) {
	return cards.slice().sort((a, b) => {
		const trumpDelta = (a.suit === "S" ? 1 : 0) - (b.suit === "S" ? 1 : 0);
		if (trumpDelta !== 0) return trumpDelta;
		return a.rank - b.rank;
	})[0];
}
function discard(cards, _preferVoid = true) {
	if (cards.length === 1) return cards[0];
	const nonTrump = cards.filter((card) => card.suit !== "S");
	const pool = nonTrump.length > 0 ? nonTrump : cards;
	const groups = suitGroups(pool);
	let pick = null;
	for (const pile of groups.values()) if (!pick || pile.length < pick.length) pick = pile;
	else if (pile.length === pick.length && lowest(pile).rank < lowest(pick).rank) pick = pile;
	return lowest(pick ?? pool);
}
function suitGroups(cards) {
	const groups = /* @__PURE__ */ new Map();
	for (const card of cards) {
		const pile = groups.get(card.suit);
		if (pile) pile.push(card);
		else groups.set(card.suit, [card]);
	}
	return groups;
}
function longestSuit(cards) {
	return extremeSuit(cards, "long");
}
function shortestSuit(cards) {
	return extremeSuit(cards, "short");
}
function extremeSuit(cards, mode) {
	const groups = suitGroups(cards);
	let best = cards[0].suit;
	let bestLength = groups.get(best)?.length ?? 0;
	for (const [suit, pile] of groups) if (mode === "long" ? pile.length > bestLength : pile.length < bestLength) {
		best = suit;
		bestLength = pile.length;
	}
	return best;
}
function highest(cards) {
	return cards.reduce((best, card) => card.rank > best.rank ? card : best);
}
function lowest(cards) {
	return cards.reduce((best, card) => card.rank < best.rank ? card : best);
}
var ctx = null;
var master = null;
var enabled = true;
function ctor() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.AudioContext ?? w.webkitAudioContext ?? null;
}
function setSoundEnabled(on) {
	enabled = on;
	if (ctx && master) master.gain.setTargetAtTime(on ? .7 : 0, ctx.currentTime, .02);
}
function unlockAudio() {
	const AudioCtx = ctor();
	if (!AudioCtx) return;
	if (!ctx) {
		ctx = new AudioCtx({ latencyHint: "interactive" });
		master = ctx.createGain();
		master.gain.value = enabled ? .7 : 0;
		master.connect(ctx.destination);
	}
	if (ctx.state === "suspended") ctx.resume();
}
function resumeAudio() {
	if (ctx && ctx.state === "suspended") ctx.resume();
}
function bindAudioLifecycle() {
	if (typeof document === "undefined") return () => {};
	const onVis = () => {
		if (document.visibilityState === "visible") resumeAudio();
	};
	document.addEventListener("visibilitychange", onVis);
	return () => document.removeEventListener("visibilitychange", onVis);
}
function tone(freq, duration, type, gain, delay = 0) {
	if (!ctx || !master || !enabled) return;
	const start = ctx.currentTime + delay;
	const osc = ctx.createOscillator();
	const amp = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, start);
	amp.gain.setValueAtTime(1e-4, start);
	amp.gain.exponentialRampToValueAtTime(Math.max(gain, 2e-4), start + .012);
	amp.gain.exponentialRampToValueAtTime(1e-4, start + duration);
	osc.connect(amp);
	amp.connect(master);
	osc.start(start);
	osc.stop(start + duration + .02);
	osc.onended = () => {
		osc.disconnect();
		amp.disconnect();
	};
}
function sfxDeal() {
	tone(196, .05, "triangle", .08);
	tone(262, .06, "sine", .05, .04);
}
function sfxPlay() {
	tone(520, .035, "square", .03);
	tone(180, .06, "triangle", .07);
}
function sfxBid() {
	tone(523, .07, "triangle", .07);
	tone(659, .09, "sine", .05, .06);
}
function sfxTake() {
	tone(392, .08, "sine", .07);
	tone(523, .11, "sine", .05, .07);
}
function sfxYouTake() {
	tone(523, .07, "sine", .08);
	tone(659, .09, "sine", .07, .06);
	tone(784, .13, "sine", .06, .12);
}
function sfxMiss() {
	tone(196, .16, "triangle", .06);
	tone(146, .2, "sine", .05, .08);
}
function sfxWin() {
	[
		523,
		659,
		784,
		1046
	].forEach((freq, i) => tone(freq, .16, "sine", .07, i * .09));
}
function sfxLose() {
	tone(220, .16, "triangle", .05);
	tone(174, .22, "sine", .045, .1);
}
var KEY = "callbreak.v1";
var PHASES = [
	"lobby",
	"bidding",
	"playing",
	"resolving",
	"handSummary",
	"gameOver"
];
function emptyStats() {
	return {
		games: 0,
		wins: 0,
		bestTenths: null
	};
}
function isMatch(value) {
	if (!value || typeof value !== "object") return false;
	const match = value;
	if (typeof match.round !== "number" || match.round < 1 || match.round > 5) return false;
	if (!Array.isArray(match.hands) || match.hands.length !== 4) return false;
	if (!match.hands.every((hand) => Array.isArray(hand))) return false;
	if (!Array.isArray(match.bids) || match.bids.length !== 4) return false;
	if (!Array.isArray(match.tricksWon) || match.tricksWon.length !== 4) return false;
	if (!Array.isArray(match.trick) || !Array.isArray(match.seen) || !Array.isArray(match.records)) return false;
	return match.turn === 0 || match.turn === 1 || match.turn === 2 || match.turn === 3;
}
function loadSave() {
	if (typeof localStorage === "undefined") return null;
	return read(KEY) ?? read(`${KEY}.bak`);
}
function read(key) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || data.version !== 1) return null;
		const phase = PHASES.includes(data.phase) ? data.phase : "lobby";
		const statsIn = data.stats;
		return {
			version: 1,
			playerName: typeof data.playerName === "string" ? data.playerName.slice(0, 16) : "You",
			sound: data.sound !== false,
			stats: {
				games: finite(statsIn?.games),
				wins: finite(statsIn?.wins),
				bestTenths: statsIn?.bestTenths == null ? null : finite(statsIn.bestTenths)
			},
			phase,
			match: isMatch(data.match) ? data.match : null
		};
	} catch {
		return null;
	}
}
function writeSave(data) {
	if (typeof localStorage === "undefined") return;
	try {
		const prev = localStorage.getItem(KEY);
		if (prev) localStorage.setItem(`${KEY}.bak`, prev);
		localStorage.setItem(KEY, JSON.stringify(data));
	} catch {}
}
function finite(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
var token = 0;
var timer = null;
function invalidateTimers() {
	token += 1;
	if (timer !== null) {
		clearTimeout(timer);
		timer = null;
	}
}
function delayFor(ms) {
	if (typeof window === "undefined") return ms;
	if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return Math.min(ms, 70);
	return ms;
}
function later(ms, fn) {
	if (timer !== null) clearTimeout(timer);
	const mine = ++token;
	timer = setTimeout(() => {
		if (mine !== token) return;
		timer = null;
		fn();
	}, delayFor(ms));
}
function buzz(ms) {
	if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") try {
		navigator.vibrate(ms);
	} catch {}
}
var useGame = create((set, get) => {
	function persist() {
		const state = get();
		writeSave({
			version: 1,
			playerName: state.playerName,
			sound: state.sound,
			stats: state.stats,
			phase: state.phase,
			match: state.match
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
	function openMatch(match) {
		const name = get().playerName;
		set({
			phase: "bidding",
			match,
			selectedCardId: null,
			hint: actionPrompt(match, "bidding", name)
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
				hint: match ? actionPrompt(match, phase, playerName) : ""
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
			if (!Number.isInteger(bid) || bid < 1 || bid > 8) return;
			const bids = match.bids.slice();
			bids[seat] = bid;
			const finished = bids.every((value) => value !== null);
			let phase = "bidding";
			let next;
			if (!finished) next = {
				...match,
				bids,
				turn: nextSeat(seat)
			};
			else {
				const leader = nextSeat(match.dealer);
				next = {
					...match,
					bids,
					turn: leader,
					leader,
					trick: [],
					trickWinner: null
				};
				phase = "playing";
			}
			sfxBid();
			set({
				phase,
				match: next,
				hint: actionPrompt(next, phase, state.playerName)
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
			const hands = match.hands.map((hand, index) => index === seat ? hand.filter((held) => held.id !== card.id) : hand);
			const trick = match.trick.concat([{
				seat,
				card
			}]);
			const seen = match.seen.concat([card]);
			sfxPlay();
			if (seat === 0) buzz(8);
			if (trick.length < 4) {
				const turn = nextSeat(seat);
				const next = {
					...match,
					hands,
					trick,
					seen,
					turn
				};
				set({
					phase: "playing",
					match: next,
					selectedCardId: null,
					hint: actionPrompt(next, "playing", state.playerName)
				});
				persist();
				pump();
				return;
			}
			const winner = winningPlay(trick).seat;
			const tricksWon = match.tricksWon.slice();
			tricksWon[winner] += 1;
			const next = {
				...match,
				hands,
				trick,
				seen,
				tricksWon,
				trickWinner: winner,
				turn: winner
			};
			if (winner === 0) {
				sfxYouTake();
				buzz(14);
			} else sfxTake();
			set({
				phase: "resolving",
				match: next,
				selectedCardId: null,
				hint: actionPrompt(next, "resolving", state.playerName)
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
				const completed = match.tricksWon[0] + match.tricksWon[1] + match.tricksWon[2] + match.tricksWon[3];
				const card = chooseCard({
					hand: match.hands[seat],
					trick: match.trick,
					bid: match.bids[seat] ?? 1,
					tricksWon: match.tricksWon[seat],
					tricksPlayed: completed,
					seen: match.seen
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
				hint: actionPrompt(settled.match, settled.phase, state.playerName)
			});
			persist();
			pump();
		},
		nextHand: () => {
			const state = get();
			const match = state.match;
			if (!match || state.phase !== "handSummary") return;
			if (match.records.length >= 5) {
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
			const stats = {
				games: state.stats.games + 1,
				wins: state.stats.wins + (winners.length === 1 && winners[0] === 0 ? 1 : 0),
				bestTenths: state.stats.bestTenths === null || totals[0] > state.stats.bestTenths ? totals[0] : state.stats.bestTenths
			};
			if (winners.length === 1 && winners[0] === 0) sfxWin();
			else if (!winners.includes(0)) sfxLose();
			else sfxTake();
			set({
				phase: "gameOver",
				stats,
				hint: tableResult(totals, state.playerName)
			});
			persist();
			invalidateTimers();
		},
		leave: () => {
			invalidateTimers();
			set({
				phase: "lobby",
				match: null,
				selectedCardId: null,
				hint: ""
			});
			persist();
		}
	};
});
function cx(...parts) {
	return parts.filter(Boolean).join(" ");
}
function SuitMark({ suit }) {
	if (suit === "H") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 40 40",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M20 35C20 35 5 24.5 5 15.2 5 9.4 9.4 5.5 14.2 5.5c2.8 0 5 1.4 5.8 3.4.8-2 3-3.4 5.8-3.4C30.6 5.5 35 9.4 35 15.2 35 24.5 20 35 20 35z"
		})
	});
	if (suit === "D") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 40 40",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M20 3.2 36 20 20 36.8 4 20Z"
		})
	});
	if (suit === "C") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 40 40",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "20",
				cy: "12.5",
				r: "6.6",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12.4",
				cy: "21.6",
				r: "6.6",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "27.6",
				cy: "21.6",
				r: "6.6",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M17.4 23.2h5.2L25 37H15z"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 40 40",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M20 2.4C20 2.4 7.6 14 7.6 22.2a6.7 6.7 0 0 0 11.2 5C17.2 31.2 15.6 35.2 13.6 38h12.8c-2-2.8-3.6-6.8-5.2-10.8a6.7 6.7 0 0 0 11.2-5C32.4 14 20 2.4 20 2.4z"
		})
	});
}
function PlayingCard({ card, back, selected, dim, waiting, shake, onClick }) {
	const className = cx("pcard", card && isRed(card.suit) && "red", (back || !card) && "back", selected && "is-selected", dim && "is-dim", waiting && "is-wait", card?.suit === "S" && !back && "is-trump", shake && "is-shake");
	if (back || !card) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "back-inner",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitMark, { suit: "S" })
		})
	});
	const face = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "corner tl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
				className: card.rank === 10 ? "ten" : void 0,
				children: rankLabel(card.rank)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitMark, { suit: card.suit })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "center",
			children: [card.rank >= 11 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "face",
				children: rankLabel(card.rank)
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitMark, { suit: card.suit })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "corner br",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
				className: card.rank === 10 ? "ten" : void 0,
				children: rankLabel(card.rank)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitMark, { suit: card.suit })]
		})
	] });
	if (onClick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className,
		onClick,
		"aria-label": cardLabel(card),
		"aria-pressed": selected || void 0,
		children: face
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children: face
	});
}
function Hand() {
	const match = useGame((s) => s.match);
	const phase = useGame((s) => s.phase);
	const selectedId = useGame((s) => s.selectedCardId);
	const selectCard = useGame((s) => s.selectCard);
	const playCard = useGame((s) => s.playCard);
	const setHint = useGame((s) => s.setHint);
	const [shakeId, setShakeId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!shakeId) return;
		const id = window.setTimeout(() => setShakeId(null), 320);
		return () => window.clearTimeout(id);
	}, [shakeId]);
	if (!match) return null;
	const hand = match.hands[0];
	const yourTurn = phase === "playing" && match.turn === 0;
	const legal = new Set(legalCards(hand, match.trick).map((card) => card.id));
	const trumps = hand.filter((card) => card.suit === "S");
	const rest = hand.filter((card) => card.suit !== "S");
	const selected = hand.find((card) => card.id === selectedId) ?? null;
	function onCard(card) {
		if (!yourTurn) return;
		if (!legal.has(card.id)) {
			setShakeId(card.id);
			setHint("Follow suit. You still hold the suit that was led.");
			return;
		}
		if (selectedId === card.id) {
			playCard(0, card.id);
			return;
		}
		selectCard(card.id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hand-zone",
		children: [
			trumps.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fan, {
				cards: trumps,
				yourTurn,
				legal,
				selectedId,
				shakeId,
				onCard
			}, `trump-${match.round}`) : null,
			rest.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fan, {
				cards: rest,
				yourTurn,
				legal,
				selectedId,
				shakeId,
				onCard
			}, `rest-${match.round}`) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "action",
				children: [phase === "bidding" && match.turn === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BidPad, { hand }) : null, yourTurn && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-brass btn-block",
					onClick: () => playCard(0, selected.id),
					children: ["Play ", cardLabel(selected)]
				}) : null]
			})
		]
	});
}
function Fan({ cards, yourTurn, legal, selectedId, shakeId, onCard }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fan",
		style: { ["--n"]: String(cards.length) },
		role: "group",
		"aria-label": "Your cards",
		children: cards.map((card, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-slot",
			style: { zIndex: selectedId === card.id ? 30 : index + 1 },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingCard, {
				card,
				selected: selectedId === card.id,
				dim: yourTurn && !legal.has(card.id),
				waiting: !yourTurn,
				shake: shakeId === card.id,
				onClick: yourTurn ? () => onCard(card) : void 0
			})
		}, card.id))
	});
}
function BidPad({ hand }) {
	const placeBid = useGame((s) => s.placeBid);
	const suggestion = assessHand(hand, "even");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bid-pad",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bid-grid",
			children: Array.from({ length: 8 }, (_, index) => index + 1).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: n === suggestion.bid ? "bid is-suggested" : "bid",
				onClick: () => placeBid(0, n),
				"aria-label": `Call ${n}${n === suggestion.bid ? ", suggested" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "bid-num",
					children: n
				}), n === suggestion.bid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "bid-tag",
					children: "Guide"
				}) : null]
			}, n))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "notes",
			children: suggestion.notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: note }, note))
		})]
	});
}
function Lobby({ onRules }) {
	const hydrated = useGame((s) => s.hydrated);
	const name = useGame((s) => s.playerName);
	const setName = useGame((s) => s.setName);
	const stats = useGame((s) => s.stats);
	const sound = useGame((s) => s.sound);
	const toggleSound = useGame((s) => s.toggleSound);
	const newMatch = useGame((s) => s.newMatch);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lobby",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lobby-mark",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitMark, { suit: "S" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "lobby-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "A parlor card game"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "lobby-title",
						children: "Callbreak"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lobby-sub",
						children: "Five hands. No partners. Spades take the trick."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "blurb",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Four players, thirteen cards each. You play alone." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Call 1 to 8 tricks. Make the call, or lose it whole." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Highest score after five hands takes the table." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "deal-form",
				onSubmit: (event) => {
					event.preventDefault();
					if (hydrated) newMatch();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "name-field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Your name at the table"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "name-input",
						value: name === "You" ? "" : name,
						placeholder: "You",
						maxLength: 16,
						autoComplete: "nickname",
						enterKeyHint: "done",
						disabled: !hydrated,
						onChange: (event) => setName(event.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-brass btn-block",
					type: "submit",
					disabled: !hydrated,
					children: "Deal the cards"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "opponents",
				children: "Maya bids tight. Kabir calls the hand. Meera stretches."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "stats",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Matches" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: stats.games })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Wins" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: stats.wins })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Best" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: stats.bestTenths === null ? "—" : formatTenths(stats.bestTenths) })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lobby-links",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-btn",
					onClick: onRules,
					children: "How to play"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-btn",
					onClick: toggleSound,
					children: ["Sound ", sound ? "on" : "off"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "install-line",
				children: "On iPhone, share then Add to Home Screen. On Android, use the browser menu and choose Install app."
			})
		]
	});
}
function Sheet({ title, onClose, children, tone = "paper" }) {
	(0, import_react.useEffect)(() => {
		if (!onClose) return;
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "sheet-back",
		onClick: onClose ? () => onClose() : void 0,
		role: "presentation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cx("sheet", tone === "felt" && "sheet-felt"),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sheet-grab",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "sheet-title",
					children: title
				}),
				children
			]
		})
	});
}
function RulesBody() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "prose-rules",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Four players, one deck, no partners. Everyone scores for themselves." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "The deal" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Thirteen cards each. Spades are always trump. The deal passes left every hand." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "The call" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Starting left of the dealer, each player calls how many tricks they will take, from 1 to 8. A call cannot be changed." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "The play" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Follow the suit that was led if you can. If you cannot, play anything — a spade wins the trick unless a higher spade is played. With no spade, the highest card of the led suit wins. The winner leads next. Any suit may be led, including spades." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "The score" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Make the call and you score that number, plus 0.1 for every extra trick. Miss it and you score minus the whole call: 4 called and 3 taken is −4, not 3. Five hands. Highest total wins." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "On your phone" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Add Callbreak to your home screen and it opens full screen, like an app." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "iPhone or iPad: tap Share, then Add to Home Screen." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Android: open the browser menu and choose Install app or Add to Home Screen." })] })
		]
	});
}
function ScorePad() {
	const match = useGame((s) => s.match);
	const playerName = useGame((s) => s.playerName);
	if (!match) return null;
	const totals = totalsOf(match.records);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
		className: "scorepad",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Hand" }), SEATS.map((seat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: seatName(seat, playerName) }, seat))] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: match.records.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 5,
				children: "No hands scored yet."
			}) }) : match.records.map((record, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: index + 1 }), SEATS.map((seat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
				className: record.points[seat] < 0 ? "neg" : void 0,
				children: [formatTenths(record.points[seat]), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
					record.tricks[seat],
					"/",
					record.bids[seat]
				] })]
			}, seat))] }, index)) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total" }), SEATS.map((seat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: totals[seat] < 0 ? "neg" : void 0,
				children: formatTenths(totals[seat])
			}, seat))] }) })
		]
	});
}
function HandSummary() {
	const match = useGame((s) => s.match);
	const nextHand = useGame((s) => s.nextHand);
	const leave = useGame((s) => s.leave);
	if (!match) return null;
	const record = match.records[match.records.length - 1];
	const last = match.records.length >= 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		title: last ? "Fifth hand" : `Hand ${match.round}`,
		children: [
			record ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sheet-lead",
				children: handPhrase(record)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePad, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ink btn-block sheet-btn",
				onClick: nextHand,
				children: last ? "Final table" : "Next hand"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-btn text-btn-ink",
				onClick: leave,
				children: "Leave the table"
			})
		]
	});
}
function GameOver() {
	const match = useGame((s) => s.match);
	const playerName = useGame((s) => s.playerName);
	const newMatch = useGame((s) => s.newMatch);
	const leave = useGame((s) => s.leave);
	if (!match) return null;
	const totals = totalsOf(match.records);
	const rows = standings(totals, playerName);
	const youWon = rows[0]?.seat === 0 && rows.filter((row) => row.rank === 1).length === 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		title: tableResult(totals, playerName),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cx("result-mark", youWon && "is-win"),
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "your-total",
				children: formatTenths(totals[0])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "standings",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: row.seat === 0 ? "is-you" : void 0,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rk",
							children: row.rank
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "nm",
							children: row.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cx("sc", row.total < 0 && "neg"),
							children: formatTenths(row.total)
						})
					]
				}, row.seat))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePad, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn btn-ink btn-block sheet-btn",
				onClick: newMatch,
				children: "Deal again"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-btn text-btn-ink",
				onClick: leave,
				children: "Back to the club"
			})
		]
	});
}
function initials(seat, playerName) {
	const name = seatName(seat, playerName);
	return seat === 0 ? name.slice(0, 1).toUpperCase() : name.slice(0, 2);
}
function Seat({ seat, placement }) {
	const match = useGame((s) => s.match);
	const phase = useGame((s) => s.phase);
	const playerName = useGame((s) => s.playerName);
	if (!match) return null;
	const name = seatName(seat, playerName);
	const active = match.turn === seat && (phase === "bidding" || phase === "playing" || phase === "resolving");
	const bid = match.bids[seat];
	const count = match.hands[seat].length;
	let meta = "Waiting";
	if (phase === "bidding") meta = bid === null ? match.turn === seat ? "Calling" : "—" : `Call ${bid}`;
	else if (bid !== null) meta = `${match.tricksWon[seat]} / ${bid}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cx("seat", placement),
		"data-seat": seat,
		children: [count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "stack",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingCard, { back: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "stack-count",
				children: count
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "stack stack-empty",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "seat-copy",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cx("avatar", active && "is-turn"),
					children: [initials(seat, playerName), match.dealer === seat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "dealer-gem",
						children: "D"
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "seat-name",
					children: name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "seat-meta",
					children: meta
				})
			]
		})]
	});
}
function Trick() {
	const match = useGame((s) => s.match);
	const phase = useGame((s) => s.phase);
	if (!match) return null;
	const winnerId = phase === "resolving" ? match.trick.find((play) => play.seat === match.trickWinner)?.card.id : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "trick-well",
		"aria-label": "Current trick",
		children: [match.trick.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "trick-mark",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 40 40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: "M20 2.4C20 2.4 7.6 14 7.6 22.2a6.7 6.7 0 0 0 11.2 5C17.2 31.2 15.6 35.2 13.6 38h12.8c-2-2.8-3.6-6.8-5.2-10.8a6.7 6.7 0 0 0 11.2-5C32.4 14 20 2.4 20 2.4z"
				})
			})
		}) : null, match.trick.map((play) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cx("trick-card", `s${play.seat}`, winnerId === play.card.id && "is-winner"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingCard, { card: play.card })
		}, play.card.id))]
	});
}
function CallbreakApp() {
	const phase = useGame((s) => s.phase);
	const hydrate = useGame((s) => s.hydrate);
	const [panel, setPanel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		hydrate();
		const off = bindAudioLifecycle();
		const unlock = () => unlockAudio();
		window.addEventListener("pointerdown", unlock);
		return () => {
			off();
			window.removeEventListener("pointerdown", unlock);
			invalidateTimers();
		};
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		if (phase === "handSummary" || phase === "gameOver") setPanel(null);
	}, [phase]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app table-bg",
		"data-phase": phase,
		children: [
			phase === "lobby" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lobby, { onRules: () => setPanel("rules") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchScreen, { onMenu: () => setPanel("menu") }),
			panel === "rules" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				title: "How to play",
				onClose: () => setPanel(null),
				tone: phase === "lobby" ? "paper" : "paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RulesBody, {})
			}) : null,
			panel === "score" && phase !== "lobby" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				title: "Scorecard",
				onClose: () => setPanel(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePad, {})
			}) : null,
			panel === "menu" && phase !== "lobby" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuSheet, {
				onClose: () => setPanel(null),
				onRules: () => setPanel("rules"),
				onScore: () => setPanel("score")
			}) : null,
			phase === "handSummary" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandSummary, {}) : null,
			phase === "gameOver" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOver, {}) : null
		]
	});
}
function MatchScreen({ onMenu }) {
	const match = useGame((s) => s.match);
	const phase = useGame((s) => s.phase);
	const playerName = useGame((s) => s.playerName);
	const hint = useGame((s) => s.hint);
	const sound = useGame((s) => s.sound);
	const toggleSound = useGame((s) => s.toggleSound);
	if (!match) return null;
	const totals = totalsOf(match.records);
	const called = match.bids.every((bid) => bid !== null) ? match.bids.reduce((sum, bid) => sum + (bid ?? 0), 0) : null;
	const status = statusLine(match, phase);
	const dealerYou = match.dealer === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "match",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "topbar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "wordmark",
						children: "Callbreak"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pips",
						"aria-label": `Hand ${match.round} of 5`,
						children: Array.from({ length: 5 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cx("pip", index + 1 < match.round && "is-done", index + 1 === match.round && "is-now") }, index))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						onClick: onMenu,
						"aria-label": "Table menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scores",
				children: SEATS.map((seat) => {
					const active = match.turn === seat && (phase === "bidding" || phase === "playing");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cx("score-chip", seat === 0 && "is-you", active && "is-turn"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "who",
							children: seatName(seat, playerName)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cx("pts", totals[seat] < 0 && "neg"),
							children: formatTenths(totals[seat])
						})]
					}, seat);
				})
			}),
			called !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cx("table-call", called > 13 && "is-hot"),
				children: ["Table called ", called]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "table-call",
				children: [
					"Hand ",
					match.round,
					" of 5"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "arena",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seat, {
					seat: 2,
					placement: "north"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seat, {
							seat: 1,
							placement: "side"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trick, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seat, {
							seat: 3,
							placement: "side"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "south",
				"aria-label": "Your hand",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hud",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cx("status", `tone-${status.tone}`),
							children: [status.text, dealerYou ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "dealer-note",
								children: " · dealer"
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							onClick: toggleSound,
							"aria-label": sound ? "Mute" : "Sound on",
							children: sound ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "hint",
						"aria-live": "polite",
						children: hint
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, {})
				]
			})
		]
	});
}
function MenuSheet({ onClose, onRules, onScore }) {
	const sound = useGame((s) => s.sound);
	const toggleSound = useGame((s) => s.toggleSound);
	const leave = useGame((s) => s.leave);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		title: "The table",
		onClose,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "menu-list",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-ink btn-block",
					onClick: onScore,
					children: "Scorecard"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn btn-ghost-ink btn-block",
					onClick: onRules,
					children: "How to play"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-ghost-ink btn-block",
					onClick: toggleSound,
					children: ["Sound ", sound ? "on" : "off"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "text-btn text-btn-ink",
			onClick: () => {
				leave();
				onClose();
			},
			children: "Leave this match"
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallbreakApp, {});
}
//#endregion
export { Home as component };
