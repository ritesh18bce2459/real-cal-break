import { type Card, cardLabel, isRed, rankLabel } from "@/game/logic";
import { cx } from "./cx";
import { SuitMark } from "./SuitMark";

type Props = {
  card?: Card;
  back?: boolean;
  selected?: boolean;
  dim?: boolean;
  waiting?: boolean;
  shake?: boolean;
  onClick?: () => void;
};

export function PlayingCard({ card, back, selected, dim, waiting, shake, onClick }: Props) {
  const className = cx(
    "pcard",
    card && isRed(card.suit) && "red",
    (back || !card) && "back",
    selected && "is-selected",
    dim && "is-dim",
    waiting && "is-wait",
    card?.suit === "S" && !back && "is-trump",
    shake && "is-shake",
  );

  if (back || !card) {
    return (
      <div className={className} aria-hidden="true">
        <span className="back-inner">
          <SuitMark suit="S" />
        </span>
      </div>
    );
  }

  const face = (
    <>
      <span className="corner tl">
        <b className={card.rank === 10 ? "ten" : undefined}>{rankLabel(card.rank)}</b>
        <SuitMark suit={card.suit} />
      </span>
      <span className="center">
        {card.rank >= 11 ? <span className="face">{rankLabel(card.rank)}</span> : null}
        <SuitMark suit={card.suit} />
      </span>
      <span className="corner br">
        <b className={card.rank === 10 ? "ten" : undefined}>{rankLabel(card.rank)}</b>
        <SuitMark suit={card.suit} />
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={cardLabel(card)}
        aria-pressed={selected || undefined}
      >
        {face}
      </button>
    );
  }

  return <div className={className}>{face}</div>;
}
