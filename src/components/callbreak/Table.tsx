import { type Seat, seatName } from "@/game/logic";
import { useGame } from "@/game/store";
import { cx } from "./cx";
import { PlayingCard } from "./PlayingCard";

function initials(seat: Seat, playerName: string): string {
  const name = seatName(seat, playerName);
  return seat === 0 ? name.slice(0, 1).toUpperCase() : name.slice(0, 2);
}

export function Seat({ seat, placement }: { seat: Exclude<Seat, 0>; placement: "north" | "side" }) {
  const match = useGame((s) => s.match);
  const phase = useGame((s) => s.phase);
  const playerName = useGame((s) => s.playerName);
  if (!match) return null;
  const name = seatName(seat, playerName);
  const active =
    match.turn === seat && (phase === "bidding" || phase === "playing" || phase === "resolving");
  const bid = match.bids[seat];
  const count = match.hands[seat].length;
  let meta = "Waiting";
  if (phase === "bidding") meta = bid === null ? (match.turn === seat ? "Calling" : "—") : `Call ${bid}`;
  else if (bid !== null) meta = `${match.tricksWon[seat]} / ${bid}`;

  return (
    <div className={cx("seat", placement)} data-seat={seat}>
      {count > 0 ? (
        <div className="stack">
          <PlayingCard back />
          <span className="stack-count">{count}</span>
        </div>
      ) : (
        <div className="stack stack-empty" aria-hidden="true" />
      )}
      <div className="seat-copy">
        <div className={cx("avatar", active && "is-turn")}>
          {initials(seat, playerName)}
          {match.dealer === seat ? <span className="dealer-gem">D</span> : null}
        </div>
        <p className="seat-name">{name}</p>
        <p className="seat-meta">{meta}</p>
      </div>
    </div>
  );
}

export function Trick() {
  const match = useGame((s) => s.match);
  const phase = useGame((s) => s.phase);
  if (!match) return null;
  const winnerId =
    phase === "resolving"
      ? match.trick.find((play) => play.seat === match.trickWinner)?.card.id
      : undefined;

  return (
    <div className="trick-well" aria-label="Current trick">
      {match.trick.length === 0 ? (
        <span className="trick-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40">
            <path
              fill="currentColor"
              d="M20 2.4C20 2.4 7.6 14 7.6 22.2a6.7 6.7 0 0 0 11.2 5C17.2 31.2 15.6 35.2 13.6 38h12.8c-2-2.8-3.6-6.8-5.2-10.8a6.7 6.7 0 0 0 11.2-5C32.4 14 20 2.4 20 2.4z"
            />
          </svg>
        </span>
      ) : null}
      {match.trick.map((play) => (
        <div
          key={play.card.id}
          className={cx("trick-card", `s${play.seat}`, winnerId === play.card.id && "is-winner")}
        >
          <PlayingCard card={play.card} />
        </div>
      ))}
    </div>
  );
}
