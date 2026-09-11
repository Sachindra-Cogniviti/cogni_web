// Component ported from https://codepen.io/JuanFuentes/full/rgXKGQ
//
// React Bits TextPressure (@react-bits/TextPressure-JS-TW), adapted for this
// project. The distortion maths - `dist`, `getAttr`, and the eased chase of
// the cursor - is upstream's and unchanged. What changed is everything around
// it, because upstream is built to be a full-width display banner and here it
// is one italic word inside the hero's <h1>:
//
//   - Renders `as` (a <span> here), not its own <h1>. A second <h1> inside the
//     headline would give the page two competing top-level headings.
//   - No font loading. Upstream @imports Roboto Flex from Google Fonts at
//     runtime; app/fonts.ts exists precisely so the exported site never calls
//     Google Fonts. The word inherits the page's Newsreader italic instead.
//   - No self-sizing, uppercasing or centring. The headline sets the type.
//   - Hover-gated, which is what was asked for. Upstream runs a
//     requestAnimationFrame loop for the life of the page, measuring every
//     character each frame whether or not anyone is pointing at it. Here the
//     loop starts on pointer enter and stops once the letters have settled
//     back, so an idle page does no work at all.
//   - An entrance sweep. `autoPlay` runs the effect once on arrival with no
//     pointer involved, by walking an imaginary cursor across the word and
//     ramping the strength up and back down, so the pressure reads as a wave
//     passing through the letters. It shows the reader that the word answers
//     to the pointer; without it the interaction is invisible until someone
//     happens to hover. Hovering mid-sweep takes over immediately.
//   - Settles rather than freezes. Leaving eases `strength` back to zero, so
//     the letters relax instead of sticking at whatever the cursor last did.
//   - Inert under reduced motion and on coarse pointers, where there is no
//     hover to speak of.
//
// Axis note: the effect can only move axes the font actually has. Newsreader
// is variable on weight, so `weight` is the axis that does the work here;
// `width` and `italic` are left off by default because Newsreader has neither
// a wdth axis nor an ital axis (its italic is a separate face).

import { useEffect, useRef, useState } from 'react';

const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const TextPressure = ({
  text = 'Compressa',
  as: Tag = 'span',
  className = '',

  width = false,
  weight = true,
  italic = false,
  alpha = false,

  // Play the effect once on arrival, without waiting for a pointer.
  autoPlay = false,
  autoPlayDelay = 0,
  autoPlayDuration = 1200,

  // Rest values, held when nothing is hovering. They should match what the
  // surrounding type is already set to, so the word looks untouched at rest.
  restWeight = 500,
  restWidth = 100,

  minWeight = 300,
  maxWeight = 800,
  minWidth = 75,
  maxWidth = 125
}) => {
  const containerRef = useRef(null);
  const spansRef = useRef([]);
  const cursorRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  // 0 at rest, 1 fully under the cursor. Eased both ways so entering and
  // leaving are the same gesture run in opposite directions.
  const strengthRef = useRef(0);
  const targetRef = useRef(0);
  // Non-null while the entrance sweep is running: { start, duration }. It
  // drives the same letters as the pointer does, from a timeline instead.
  const sweepRef = useRef(null);
  const [active, setActive] = useState(false);

  const chars = text.split('');

  useEffect(() => {
    if (!active) return;

    const node = containerRef.current;
    if (!node) return;

    const onPointerMove = event => {
      cursorRef.current.x = event.clientX;
      cursorRef.current.y = event.clientY;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let rafId;
    const animate = () => {
      const rect = node.getBoundingClientRect();
      const sweep = sweepRef.current;

      if (sweep) {
        const p = (performance.now() - sweep.start) / sweep.duration;
        if (p >= 1) {
          // Hand back to the pointer path, which will find strength at rest
          // and shut the loop down on the next check.
          sweepRef.current = null;
          strengthRef.current = 0;
        } else {
          // Start clear of the left edge and finish past the right, so the
          // first and last letters get a whole pass rather than catching the
          // wave halfway. Strength is a half sine: in and out over the run.
          mouseRef.current.x = rect.left + rect.width * (1.5 * p - 0.25);
          mouseRef.current.y = rect.top + rect.height / 2;
          strengthRef.current = Math.sin(Math.PI * p);
        }
      } else {
        mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
        mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;
        strengthRef.current += (targetRef.current - strengthRef.current) / 8;
      }

      const s = strengthRef.current;
      const maxDist = rect.width / 2;

      spansRef.current.forEach(span => {
        if (!span) return;

        const r = span.getBoundingClientRect();
        const d = dist(mouseRef.current, { x: r.x + r.width / 2, y: r.y + r.height / 2 });

        // Each axis is the rest value pulled towards the cursor-driven one by
        // however far in the gesture we are, so strength 0 is exactly rest.
        // getAttr adds its floor back on top, so it peaks at minVal + maxVal.
        // Handing it the span between the two is what makes `maxWeight` mean
        // the weight you actually get under the cursor - passing 800 straight
        // in asks for 1100, and every letter within a wide radius pins at the
        // font's ceiling instead of falling off across the word.
        const wght = weight
          ? restWeight + (getAttr(d, maxDist, minWeight, maxWeight - minWeight) - restWeight) * s
          : restWeight;
        const wdth = width
          ? restWidth + (getAttr(d, maxDist, minWidth, maxWidth - minWidth) - restWidth) * s
          : restWidth;
        const ital = italic ? (getAttr(d, maxDist, 0, 1) * s).toFixed(2) : 0;

        const settings = `'wght' ${Math.round(wght)}, 'wdth' ${Math.round(wdth)}, 'ital' ${ital}`;
        if (span.style.fontVariationSettings !== settings) {
          span.style.fontVariationSettings = settings;
        }
        if (alpha) {
          span.style.opacity = (1 - (1 - getAttr(d, maxDist, 0, 1)) * s).toFixed(2);
        }
      });

      // Once nothing is driving the letters and they have relaxed, stop the
      // loop and hand the type back to the stylesheet.
      if (!sweepRef.current && targetRef.current === 0 && s < 0.001) {
        spansRef.current.forEach(span => {
          if (!span) return;
          span.style.fontVariationSettings = '';
          if (alpha) span.style.opacity = '';
        });
        setActive(false);
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [active, width, weight, italic, alpha, restWeight, restWidth, minWeight, maxWeight, minWidth, maxWidth]);

  // The entrance sweep. Unlike hover it is not gated on a fine pointer -
  // a touch reader should see the word move too, since they have no other
  // way to find out that it does.
  useEffect(() => {
    if (!autoPlay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setTimeout(() => {
      sweepRef.current = { start: performance.now(), duration: autoPlayDuration };
      setActive(true);
    }, autoPlayDelay);

    return () => clearTimeout(id);
  }, [autoPlay, autoPlayDelay, autoPlayDuration]);

  const start = event => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // A pointer outranks the entrance sweep: if someone reaches the word
    // while it is still playing, it becomes theirs mid-flight.
    sweepRef.current = null;

    // Begin the chase where the pointer already is, so the first frame does
    // not swing in from wherever it was last left.
    cursorRef.current.x = event.clientX;
    cursorRef.current.y = event.clientY;
    mouseRef.current.x = event.clientX;
    mouseRef.current.y = event.clientY;
    targetRef.current = 1;
    setActive(true);
  };

  const stop = () => {
    targetRef.current = 0;
  };

  return (
    <Tag
      ref={containerRef}
      className={className}
      onPointerEnter={start}
      onPointerLeave={stop}
      style={{ display: 'inline-block' }}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          ref={el => {
            spansRef.current[i] = el;
          }}
          data-char={char}
          className="inline-block"
        >
          {char}
        </span>
      ))}
    </Tag>
  );
};

export default TextPressure;
