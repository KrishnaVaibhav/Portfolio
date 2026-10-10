/**
 * Copy that lights up word by word as it scrolls into the reading zone (see
 * .scroll-word in index.css). Screen readers get the plain sentence; the word
 * spans are presentation only. Without scroll timelines it renders normally.
 */
export const ScrollText = ({ text }: { text: string }) => (
  <>
    <span className="sr-only">{text}</span>
    <span aria-hidden>
      {text.split(/(\s+)/).map((part, i) =>
        /\s+/.test(part) ? (
          part
        ) : (
          <span key={i} className="scroll-word">
            {part}
          </span>
        ),
      )}
    </span>
  </>
);
