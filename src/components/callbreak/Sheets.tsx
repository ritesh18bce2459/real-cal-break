import { useEffect, type ReactNode } from "react";
import { Crown } from "lucide-react";
import {
  ROUNDS,
  SEATS,
  formatTenths,
  handPhrase,
  seatName,
  standings,
  tableResult,
  totalsOf,
} from "@/game/logic";
import { useGame } from "@/game/store";
import { cx } from "./cx";

export function Sheet({
  title,
  onClose,
  children,
  tone = "paper",
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  tone?: "paper" | "felt";
}) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="sheet-back"
      onClick={onClose ? () => onClose() : undefined}
      role="presentation"
    >
      <div
        className={cx("sheet", tone === "felt" && "sheet-felt")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grab" aria-hidden="true" />
        <h2 className="sheet-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function RulesBody() {
  return (
    <div className="prose-rules">
      <p>Four players, one deck, no partners. Everyone scores for themselves.</p>
      <h3>The deal</h3>
      <p>Thirteen cards each. Spades are always trump. The deal passes left every hand.</p>
      <h3>The call</h3>
      <p>
        Starting left of the dealer, each player calls how many tricks they will take, from 1 to 8. A call
        cannot be changed.
      </p>
      <h3>The play</h3>
      <p>
        Follow the suit that was led if you can. If you cannot, play anything — a spade wins the trick unless
        a higher spade is played. With no spade, the highest card of the led suit wins. The winner leads next.
        Any suit may be led, including spades.
      </p>
      <h3>The score</h3>
      <p>
        Make the call and you score that number, plus 0.1 for every extra trick. Miss it and you score minus
        the whole call: 4 called and 3 taken is −4, not 3. Five hands. Highest total wins.
      </p>
      <h3>On your phone</h3>
      <p>Add Callbreak to your home screen and it opens full screen, like an app.</p>
      <ol>
        <li>iPhone or iPad: tap Share, then Add to Home Screen.</li>
        <li>Android: open the browser menu and choose Install app or Add to Home Screen.</li>
      </ol>
    </div>
  );
}

export function ScorePad() {
  const match = useGame((s) => s.match);
  const playerName = useGame((s) => s.playerName);
  if (!match) return null;
  const totals = totalsOf(match.records);
  return (
    <table className="scorepad">
      <thead>
        <tr>
          <th>Hand</th>
          {SEATS.map((seat) => (
            <th key={seat}>{seatName(seat, playerName)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {match.records.length === 0 ? (
          <tr>
            <td colSpan={5}>No hands scored yet.</td>
          </tr>
        ) : (
          match.records.map((record, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              {SEATS.map((seat) => (
                <td key={seat} className={record.points[seat] < 0 ? "neg" : undefined}>
                  {formatTenths(record.points[seat])}
                  <small>
                    {record.tricks[seat]}/{record.bids[seat]}
                  </small>
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr>
          <th>Total</th>
          {SEATS.map((seat) => (
            <td key={seat} className={totals[seat] < 0 ? "neg" : undefined}>
              {formatTenths(totals[seat])}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
}

export function HandSummary() {
  const match = useGame((s) => s.match);
  const nextHand = useGame((s) => s.nextHand);
  const leave = useGame((s) => s.leave);
  if (!match) return null;
  const record = match.records[match.records.length - 1];
  const last = match.records.length >= ROUNDS;
  return (
    <Sheet title={last ? "Fifth hand" : `Hand ${match.round}`}>
      {record ? <p className="sheet-lead">{handPhrase(record)}</p> : null}
      <ScorePad />
      <button type="button" className="btn btn-ink btn-block sheet-btn" onClick={nextHand}>
        {last ? "Final table" : "Next hand"}
      </button>
      <button type="button" className="text-btn text-btn-ink" onClick={leave}>
        Leave the table
      </button>
    </Sheet>
  );
}

export function GameOver() {
  const match = useGame((s) => s.match);
  const playerName = useGame((s) => s.playerName);
  const newMatch = useGame((s) => s.newMatch);
  const leave = useGame((s) => s.leave);
  if (!match) return null;
  const totals = totalsOf(match.records);
  const rows = standings(totals, playerName);
  const youWon = rows[0]?.seat === 0 && rows.filter((row) => row.rank === 1).length === 1;
  return (
    <Sheet title={tableResult(totals, playerName)}>
      <div className={cx("result-mark", youWon && "is-win")} aria-hidden="true">
        <Crown />
      </div>
      <p className="your-total">{formatTenths(totals[0])}</p>
      <ol className="standings">
        {rows.map((row) => (
          <li key={row.seat} className={row.seat === 0 ? "is-you" : undefined}>
            <span className="rk">{row.rank}</span>
            <span className="nm">{row.name}</span>
            <span className={cx("sc", row.total < 0 && "neg")}>{formatTenths(row.total)}</span>
          </li>
        ))}
      </ol>
      <ScorePad />
      <button type="button" className="btn btn-ink btn-block sheet-btn" onClick={newMatch}>
        Deal again
      </button>
      <button type="button" className="text-btn text-btn-ink" onClick={leave}>
        Back to the club
      </button>
    </Sheet>
  );
}
