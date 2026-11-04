import { useEffect, useState } from "react";
import { assessHand } from "@/game/ai";
import { type Card, cardLabel, legalCards } from "@/game/logic";
import { useGame } from "@/game/store";
import { PlayingCard } from "./PlayingCard";

export function Hand() {
  const match = useGame((s) => s.match);
  const phase = useGame((s) => s.phase);
  const selectedId = useGame((s) => s.selectedCardId);
  const selectCard = useGame((s) => s.selectCard);
  const playCard = useGame((s) => s.playCard);
  const setHint = useGame((s) => s.setHint);
  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
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

  function onCard(card: Card) {
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

  return (
    <div className="hand-zone">
      {trumps.length > 0 ? (
        <Fan
          key={`trump-${match.round}`}
          cards={trumps}
          yourTurn={yourTurn}
          legal={legal}
          selectedId={selectedId}
          shakeId={shakeId}
          onCard={onCard}
        />
      ) : null}
      {rest.length > 0 ? (
        <Fan
          key={`rest-${match.round}`}
          cards={rest}
          yourTurn={yourTurn}
          legal={legal}
          selectedId={selectedId}
          shakeId={shakeId}
          onCard={onCard}
        />
      ) : null}
      <div className="action">
        {phase === "bidding" && match.turn === 0 ? <BidPad hand={hand} /> : null}
        {yourTurn && selected ? (
          <button type="button" className="btn btn-brass btn-block" onClick={() => playCard(0, selected.id)}>
            Play {cardLabel(selected)}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Fan({
  cards,
  yourTurn,
  legal,
  selectedId,
  shakeId,
  onCard,
}: {
  cards: Card[];
  yourTurn: boolean;
  legal: Set<string>;
  selectedId: string | null;
  shakeId: string | null;
  onCard: (card: Card) => void;
}) {
  return (
    <div className="fan" style={{ ["--n" as string]: String(cards.length) }} role="group" aria-label="Your cards">
      {cards.map((card, index) => (
        <div className="card-slot" key={card.id} style={{ zIndex: selectedId === card.id ? 30 : index + 1 }}>
          <PlayingCard
            card={card}
            selected={selectedId === card.id}
            dim={yourTurn && !legal.has(card.id)}
            waiting={!yourTurn}
            shake={shakeId === card.id}
            onClick={yourTurn ? () => onCard(card) : undefined}
          />
        </div>
      ))}
    </div>
  );
}

function BidPad({ hand }: { hand: Card[] }) {
  const placeBid = useGame((s) => s.placeBid);
  const suggestion = assessHand(hand, "even");
  return (
    <div className="bid-pad">
      <div className="bid-grid">
        {Array.from({ length: 8 }, (_, index) => index + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={n === suggestion.bid ? "bid is-suggested" : "bid"}
            onClick={() => placeBid(0, n)}
            aria-label={`Call ${n}${n === suggestion.bid ? ", suggested" : ""}`}
          >
            <span className="bid-num">{n}</span>
            {n === suggestion.bid ? <span className="bid-tag">Guide</span> : null}
          </button>
        ))}
      </div>
      <ul className="notes">
        {suggestion.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
