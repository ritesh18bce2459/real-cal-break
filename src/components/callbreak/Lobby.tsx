import { formatTenths } from "@/game/logic";
import { useGame } from "@/game/store";
import { SuitMark } from "./SuitMark";

export function Lobby({ onRules }: { onRules: () => void }) {
  const hydrated = useGame((s) => s.hydrated);
  const name = useGame((s) => s.playerName);
  const setName = useGame((s) => s.setName);
  const stats = useGame((s) => s.stats);
  const sound = useGame((s) => s.sound);
  const toggleSound = useGame((s) => s.toggleSound);
  const newMatch = useGame((s) => s.newMatch);

  return (
    <div className="lobby">
      <div className="lobby-mark" aria-hidden="true">
        <SuitMark suit="S" />
      </div>
      <header className="lobby-head">
        <p className="eyebrow">A parlor card game</p>
        <h1 className="lobby-title">Callbreak</h1>
        <p className="lobby-sub">Five hands. No partners. Spades take the trick.</p>
      </header>

      <ul className="blurb">
        <li>Four players, thirteen cards each. You play alone.</li>
        <li>Call 1 to 8 tricks. Make the call, or lose it whole.</li>
        <li>Highest score after five hands takes the table.</li>
      </ul>

      <form
        className="deal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (hydrated) newMatch();
        }}
      >
        <label className="name-field">
          <span className="eyebrow">Your name at the table</span>
          {hydrated ? (
            <input
              className="name-input"
              value={name === "You" ? "" : name}
              placeholder="You"
              maxLength={16}
              autoComplete="nickname"
              enterKeyHint="done"
              onChange={(event) => setName(event.target.value)}
            />
          ) : (
            <div className="name-input" aria-hidden="true">
              You
            </div>
          )}
        </label>
        <button className="btn btn-brass btn-block" type="submit" disabled={!hydrated}>
          Deal the cards
        </button>
      </form>

      <p className="opponents">
        Maya bids tight. Kabir calls the hand. Meera stretches.
      </p>

      <dl className="stats">
        <div>
          <dt>Matches</dt>
          <dd>{stats.games}</dd>
        </div>
        <div>
          <dt>Wins</dt>
          <dd>{stats.wins}</dd>
        </div>
        <div>
          <dt>Best</dt>
          <dd>{stats.bestTenths === null ? "—" : formatTenths(stats.bestTenths)}</dd>
        </div>
      </dl>

      <div className="lobby-links">
        <button type="button" className="text-btn" onClick={onRules}>
          How to play
        </button>
        <button type="button" className="text-btn" onClick={toggleSound}>
          Sound {sound ? "on" : "off"}
        </button>
      </div>
      <p className="install-line">
        On iPhone, share then Add to Home Screen. On Android, use the browser menu and choose Install app.
      </p>
    </div>
  );
}
