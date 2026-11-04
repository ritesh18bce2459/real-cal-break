import { useEffect, useState } from "react";
import { Menu, Volume2, VolumeX } from "lucide-react";
import { SEATS, formatTenths, seatName, statusLine, totalsOf } from "@/game/logic";
import { bindAudioLifecycle, invalidateTimers, unlockAudio, useGame } from "@/game/store";
import { cx } from "./cx";
import { Hand } from "./Hand";
import { Lobby } from "./Lobby";
import { GameOver, HandSummary, RulesBody, ScorePad, Sheet } from "./Sheets";
import { Seat, Trick } from "./Table";

export function CallbreakApp() {
  const phase = useGame((s) => s.phase);
  const hydrate = useGame((s) => s.hydrate);
  const [panel, setPanel] = useState<"rules" | "score" | "menu" | null>(null);

  useEffect(() => {
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

  useEffect(() => {
    if (phase === "handSummary" || phase === "gameOver") setPanel(null);
  }, [phase]);

  return (
    <div className="app table-bg" data-phase={phase}>
      {phase === "lobby" ? (
        <Lobby onRules={() => setPanel("rules")} />
      ) : (
        <MatchScreen onMenu={() => setPanel("menu")} />
      )}
      {panel === "rules" ? (
        <Sheet title="How to play" onClose={() => setPanel(null)} tone={phase === "lobby" ? "paper" : "paper"}>
          <RulesBody />
        </Sheet>
      ) : null}
      {panel === "score" && phase !== "lobby" ? (
        <Sheet title="Scorecard" onClose={() => setPanel(null)}>
          <ScorePad />
        </Sheet>
      ) : null}
      {panel === "menu" && phase !== "lobby" ? (
        <MenuSheet
          onClose={() => setPanel(null)}
          onRules={() => setPanel("rules")}
          onScore={() => setPanel("score")}
        />
      ) : null}
      {phase === "handSummary" ? <HandSummary /> : null}
      {phase === "gameOver" ? <GameOver /> : null}
    </div>
  );
}

function MatchScreen({ onMenu }: { onMenu: () => void }) {
  const match = useGame((s) => s.match);
  const phase = useGame((s) => s.phase);
  const playerName = useGame((s) => s.playerName);
  const hint = useGame((s) => s.hint);
  const sound = useGame((s) => s.sound);
  const toggleSound = useGame((s) => s.toggleSound);
  if (!match) return null;
  const totals = totalsOf(match.records);
  const called = match.bids.every((bid) => bid !== null)
    ? match.bids.reduce<number>((sum, bid) => sum + (bid ?? 0), 0)
    : null;
  const status = statusLine(match, phase);
  const dealerYou = match.dealer === 0;

  return (
    <div className="match">
      <header className="topbar">
        <h1 className="wordmark">Callbreak</h1>
        <div className="pips" aria-label={`Hand ${match.round} of 5`}>
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={cx("pip", index + 1 < match.round && "is-done", index + 1 === match.round && "is-now")}
            />
          ))}
        </div>
        <button type="button" className="icon-btn" onClick={onMenu} aria-label="Table menu">
          <Menu />
        </button>
      </header>
      <div className="scores">
        {SEATS.map((seat) => {
          const active = match.turn === seat && (phase === "bidding" || phase === "playing");
          return (
            <div key={seat} className={cx("score-chip", seat === 0 && "is-you", active && "is-turn")}>
              <span className="who">{seatName(seat, playerName)}</span>
              <span className={cx("pts", totals[seat] < 0 && "neg")}>{formatTenths(totals[seat])}</span>
            </div>
          );
        })}
      </div>
      {called !== null ? (
        <p className={cx("table-call", called > 13 && "is-hot")}>Table called {called}</p>
      ) : (
        <p className="table-call">Hand {match.round} of 5</p>
      )}
      <div className="arena">
        <Seat seat={2} placement="north" />
        <div className="mid">
          <Seat seat={1} placement="side" />
          <Trick />
          <Seat seat={3} placement="side" />
        </div>
      </div>
      <section className="south" aria-label="Your hand">
        <div className="hud">
          <p className={cx("status", `tone-${status.tone}`)}>
            {status.text}
            {dealerYou ? <span className="dealer-note"> · dealer</span> : null}
          </p>
          <button type="button" className="icon-btn" onClick={toggleSound} aria-label={sound ? "Mute" : "Sound on"}>
            {sound ? <Volume2 /> : <VolumeX />}
          </button>
        </div>
        <p className="hint" aria-live="polite">
          {hint}
        </p>
        <Hand />
      </section>
    </div>
  );
}

function MenuSheet({
  onClose,
  onRules,
  onScore,
}: {
  onClose: () => void;
  onRules: () => void;
  onScore: () => void;
}) {
  const sound = useGame((s) => s.sound);
  const toggleSound = useGame((s) => s.toggleSound);
  const leave = useGame((s) => s.leave);
  return (
    <Sheet title="The table" onClose={onClose}>
      <div className="menu-list">
        <button type="button" className="btn btn-ink btn-block" onClick={onScore}>
          Scorecard
        </button>
        <button type="button" className="btn btn-ghost-ink btn-block" onClick={onRules}>
          How to play
        </button>
        <button type="button" className="btn btn-ghost-ink btn-block" onClick={toggleSound}>
          Sound {sound ? "on" : "off"}
        </button>
      </div>
      <button
        type="button"
        className="text-btn text-btn-ink"
        onClick={() => {
          leave();
          onClose();
        }}
      >
        Leave this match
      </button>
    </Sheet>
  );
}
