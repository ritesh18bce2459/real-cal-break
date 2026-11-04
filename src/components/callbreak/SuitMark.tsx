import type { Suit } from "@/game/logic";

export function SuitMark({ suit }: { suit: Suit }) {
  if (suit === "H") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20 35C20 35 5 24.5 5 15.2 5 9.4 9.4 5.5 14.2 5.5c2.8 0 5 1.4 5.8 3.4.8-2 3-3.4 5.8-3.4C30.6 5.5 35 9.4 35 15.2 35 24.5 20 35 20 35z"
        />
      </svg>
    );
  }
  if (suit === "D") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path fill="currentColor" d="M20 3.2 36 20 20 36.8 4 20Z" />
      </svg>
    );
  }
  if (suit === "C") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="12.5" r="6.6" fill="currentColor" />
        <circle cx="12.4" cy="21.6" r="6.6" fill="currentColor" />
        <circle cx="27.6" cy="21.6" r="6.6" fill="currentColor" />
        <path fill="currentColor" d="M17.4 23.2h5.2L25 37H15z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 2.4C20 2.4 7.6 14 7.6 22.2a6.7 6.7 0 0 0 11.2 5C17.2 31.2 15.6 35.2 13.6 38h12.8c-2-2.8-3.6-6.8-5.2-10.8a6.7 6.7 0 0 0 11.2-5C32.4 14 20 2.4 20 2.4z"
      />
    </svg>
  );
}
