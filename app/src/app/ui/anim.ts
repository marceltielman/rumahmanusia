/**
 * Alternating animation names.
 *
 * Re-applying the same CSS animation does not replay it, so entrance
 * animations bind one of two identical keyframes and flip between them
 * whenever the content changes. The stylesheet defines each pair.
 */
export const alternate = (base: string, tick: number, ms: number) =>
  `${base}-${tick % 2 === 0 ? 'a' : 'b'} ${ms}ms cubic-bezier(.2,.7,.2,1)`;

/** Direction-aware pair used by the testimony carousel. */
export const alternateQuote = (forward: boolean, tick: number, ms: number) =>
  `rm-q-${forward ? 'a' : 'b'}${(tick % 2) + 1} ${ms}ms cubic-bezier(.2,.7,.2,1)`;
