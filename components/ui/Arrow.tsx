const TURN = { right: 0, left: 180, up: -90, "up-right": -45 } as const;

interface ArrowProps {
  /** Which way it points. "up-right" marks links that leave the site. */
  direction?: keyof typeof TURN;
  className?: string;
}

/**
 * The site's arrow: a dashed shaft and a chevron head, like a "-->". When a
 * `group` ancestor is hovered or focused, the dashes flow towards the head
 * and the head nudges forward (styles in globals.css). Sized to the text.
 */
function Arrow({ direction = "right", className = "" }: ArrowProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={`inline-block h-[0.7em] w-[1.2em] shrink-0 overflow-visible ${className}`}
      style={{ rotate: `${TURN[direction]}deg` }}
    >
      <line className="arrow-shaft" x1="1" y1="6" x2="15.5" y2="6" />
      <polyline className="arrow-head" points="11,1.5 16.5,6 11,10.5" />
    </svg>
  );
}

export default Arrow;
