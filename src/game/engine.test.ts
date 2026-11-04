import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { simulateGame } from "./ai.ts";
import {
  type Card,
  type Rank,
  type Seat,
  type Suit,
  createDeck,
  dealMatch,
  formatTenths,
  legalCards,
  mulberry32,
  scoreTenths,
  winningPlay,
} from "./logic.ts";

function card(suit: Suit, rank: Rank): Card {
  return { id: `${suit}${rank}`, suit, rank };
}

describe("callbreak rules", () => {
  it("deals 52 unique cards, 13 each", () => {
    const deck = createDeck();
    assert.equal(deck.length, 52);
    assert.equal(new Set(deck.map((c) => c.id)).size, 52);
    const match = dealMatch(3, 1, [], mulberry32(7));
    assert.equal(match.turn, 0);
    const ids = match.hands.flat().map((c) => c.id);
    assert.equal(ids.length, 52);
    assert.equal(new Set(ids).size, 52);
    assert.ok(match.hands.every((hand) => hand.length === 13));
  });

  it("forces a follow and lets a void play anything", () => {
    const hand = [card("H", 14), card("S", 2), card("D", 5)];
    const led = [{ seat: 1 as Seat, card: card("H", 10) }];
    assert.deepEqual(
      legalCards(hand, led).map((c) => c.id),
      ["H14"],
    );
    const voidHand = [card("S", 14), card("C", 3)];
    assert.equal(legalCards(voidHand, led).length, 2);
    assert.equal(legalCards(hand, []).length, 3);
  });

  it("lets spades trump, otherwise the led suit", () => {
    assert.equal(
      winningPlay([
        { seat: 0, card: card("H", 14) },
        { seat: 1, card: card("H", 13) },
        { seat: 2, card: card("S", 2) },
        { seat: 3, card: card("D", 14) },
      ]).seat,
      2,
    );
    assert.equal(
      winningPlay([
        { seat: 0, card: card("D", 10) },
        { seat: 1, card: card("D", 14) },
        { seat: 2, card: card("C", 14) },
        { seat: 3, card: card("D", 3) },
      ]).seat,
      1,
    );
    assert.equal(
      winningPlay([
        { seat: 0, card: card("S", 12) },
        { seat: 3, card: card("S", 14) },
      ]).seat,
      3,
    );
  });

  it("scores a made call, overtricks, and a miss in tenths", () => {
    assert.equal(scoreTenths(4, 4), 40);
    assert.equal(scoreTenths(4, 6), 42);
    assert.equal(scoreTenths(4, 2), -40);
    assert.equal(formatTenths(42), "4.2");
    assert.equal(formatTenths(-40), "−4.0");
    assert.equal(formatTenths(0), "0.0");
  });

  it("plays out five-hand matches with legal cards", () => {
    let made = 0;
    let calls = 0;
    let bidSum = 0;
    for (let game = 0; game < 40; game++) {
      const records = simulateGame(mulberry32(1000 + game));
      assert.equal(records.length, 5);
      for (const record of records) {
        assert.equal(
          record.tricks.reduce((sum, n) => sum + n, 0),
          13,
        );
        for (let seat = 0; seat < 4; seat++) {
          calls += 1;
          bidSum += record.bids[seat];
          if (record.tricks[seat] >= record.bids[seat]) made += 1;
          assert.ok(record.bids[seat] >= 1 && record.bids[seat] <= 8);
          assert.equal(record.points[seat], scoreTenths(record.bids[seat], record.tricks[seat]));
        }
      }
    }
    const rate = made / calls;
    console.log(`make rate ${rate.toFixed(3)} avg bid ${(bidSum / calls).toFixed(2)}`);
    assert.ok(rate > 0.55 && rate < 0.88, `make rate ${rate}`);
  });
});
