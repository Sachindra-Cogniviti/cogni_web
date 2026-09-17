import { Fragment } from 'react';

/*
 * React Bits BlurText (@react-bits/BlurText-JS-TW), adapted for this project.
 * React Bits ships copy-owned source, so the changes live here rather than in
 * a wrapper. Five of them, all forced by where it is used - inside the hero's
 * <h1>, around an inline serif accent, as the first thing on the page:
 *
 *   - `as` and `inline`. Upstream always renders <p class="flex flex-wrap">.
 *     A <p> cannot go inside an <h1>, and the flex container drops the
 *     headline's `text-balance` because balancing needs real inline text. In
 *     inline mode it renders the given tag with no flex, and the word spans
 *     wrap on their own as inline-block.
 *   - `startDelay` and `indexOffset`. The headline is three runs - before, the
 *     accent, after - and they have to read as one cascade rather than three
 *     that each restart at zero. The offset continues the word count across
 *     runs; the start delay holds the whole thing until the discipline strip
 *     above has landed.
 *   - `children`. With children the component animates them as a single
 *     segment instead of splitting `text`, so the accent word gets the same
 *     reveal as every other word while still rendering TextPressure inside.
 *   - Reduced motion. Upstream animates regardless; here the words are simply
 *     shown, in line with the rest of the page (globals.css).
 *   - The engine is CSS, not Motion. Upstream drives each word with Motion,
 *     which cannot start until React has hydrated - and on a slow phone that
 *     is a second or more after the headline's markup is on screen, during
 *     which the largest text on the page sits invisible. That is what
 *     Lighthouse reports as a late largest contentful paint. Here each word
 *     is a span with an inline animation delay and the keyframes live in
 *     globals.css (`blur-text-in`), so the cascade starts the moment the
 *     browser paints the HTML, with or without JavaScript, and hydration
 *     changes nothing it can see. Two consequences: the reveal plays from
 *     first paint rather than from scrolling into view, which is right for
 *     the hero and would be wrong for a block below the fold; and
 *     `animationTo` can only describe the rest state - the from state and a
 *     single destination - so upstream's intermediate keyframe is not
 *     supported. `easing` is a CSS timing function string.
 */
/* A literal non-breaking space is invisible in source and easy to delete by
 * accident, so the one this component depends on is named. */
const NBSP = String.fromCharCode(160);

/**
 * Props are spelled out because the hero consumes this from TypeScript, and
 * inference from the defaults alone types `children` as `null`.
 *
 * @param {{
 *   text?: string,
 *   children?: import('react').ReactNode,
 *   as?: import('react').ElementType,
 *   inline?: boolean,
 *   delay?: number,
 *   startDelay?: number,
 *   indexOffset?: number,
 *   className?: string,
 *   animateBy?: 'words' | 'characters',
 *   direction?: 'top' | 'bottom',
 *   animationFrom?: { opacity?: number, y?: string | number, filter?: string },
 *   easing?: string,
 *   onAnimationComplete?: () => void,
 *   stepDuration?: number,
 * }} props
 */
const BlurText = ({
  text = '',
  children = null,
  as: Tag = 'p',
  inline = false,
  delay = 200,
  startDelay = 0,
  indexOffset = 0,
  className = '',
  animateBy = 'words',
  direction = 'top',
  animationFrom,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
  onAnimationComplete = undefined,
  stepDuration = 0.35
}) => {
  const hasChildren = children != null;
  const elements = hasChildren ? [children] : animateBy === 'words' ? text.split(' ') : text.split('');

  const from = animationFrom ?? {
    filter: 'blur(10px)',
    opacity: 0,
    y: direction === 'top' ? -50 : 50
  };
  const fromY = typeof from.y === 'number' ? `${from.y}px` : (from.y ?? '0px');
  const fromBlur = (from.filter ?? '').match(/blur\(([^)]*)\)/)?.[1] ?? '0px';

  // Everything the keyframes need, as custom properties on the run, so the
  // stylesheet holds one set of keyframes for every use.
  const runStyle = {
    '--bt-opacity': String(from.opacity ?? 0),
    '--bt-y': fromY,
    '--bt-blur': fromBlur,
    '--bt-duration': `${stepDuration}s`,
    '--bt-ease': easing
  };

  return (
    <Tag className={['blur-text', className, inline ? '' : 'flex flex-wrap'].filter(Boolean).join(' ')} style={runStyle}>
      {elements.map((segment, index) => {
        const gap = !hasChildren && animateBy === 'words' && index < elements.length - 1;
        const last = index === elements.length - 1;

        return (
          <Fragment key={index}>
            <span
              className="inline-block will-change-[transform,filter,opacity]"
              style={{ animationDelay: `${startDelay + (index + indexOffset) * delay}ms` }}
              onAnimationEnd={last && onAnimationComplete ? onAnimationComplete : undefined}
            >
              {segment === ' ' ? NBSP : segment}
              {/* Flex collapses the whitespace between its items, so upstream
                  carries the gap inside the span as a non-breaking space.
                  Inline mode must not: a trailing space inside an inline-block
                  is trimmed away, and a non-breaking one would render but
                  leave the headline no point at which to wrap. There the gap
                  goes between the spans instead, as ordinary collapsible
                  text. */}
              {gap && !inline && NBSP}
            </span>
            {gap && inline && ' '}
          </Fragment>
        );
      })}
    </Tag>
  );
};

export default BlurText;
