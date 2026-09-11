import { motion, useReducedMotion } from 'motion/react';
import { Fragment, useEffect, useRef, useState, useMemo } from 'react';

/*
 * React Bits BlurText (@react-bits/BlurText-JS-TW), adapted for this project.
 * React Bits ships copy-owned source, so the changes live here rather than in
 * a wrapper. Four of them, all forced by where it is used - inside the hero's
 * <h1>, around an inline serif accent:
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
 *     shown, in line with the rest of the page.
 */
/* A literal non-breaking space is invisible in source and easy to delete by
 * accident, so the one this component depends on is named. */
const NBSP = String.fromCharCode(160);

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);

  const keyframes = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

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
 *   threshold?: number,
 *   rootMargin?: string,
 *   animationFrom?: Record<string, unknown>,
 *   animationTo?: Record<string, unknown>[],
 *   easing?: (t: number) => number,
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
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = t => t,
  onAnimationComplete = undefined,
  stepDuration = 0.35
}) => {
  const hasChildren = children != null;
  const elements = hasChildren ? [children] : animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  const restState = toSnapshots[toSnapshots.length - 1];

  return (
    <Tag ref={ref} className={['blur-text', className, inline ? '' : 'flex flex-wrap'].filter(Boolean).join(' ')}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (startDelay + (index + indexOffset) * delay) / 1000
        };
        spanTransition.ease = easing;

        const gap = !hasChildren && animateBy === 'words' && index < elements.length - 1;

        return (
          <Fragment key={index}>
            <motion.span
              className="inline-block will-change-[transform,filter,opacity]"
              initial={reduced ? restState : fromSnapshot}
              animate={reduced ? restState : inView ? animateKeyframes : fromSnapshot}
              transition={reduced ? { duration: 0 } : spanTransition}
              onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
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
            </motion.span>
            {gap && inline && ' '}
          </Fragment>
        );
      })}
    </Tag>
  );
};

export default BlurText;
