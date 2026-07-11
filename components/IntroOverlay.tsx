'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from './FilterBar';
// the intro headline is always English, regardless of locale
import en from '@/messages/en.json';

// how long the centered logo + headline sit on the blank page before flying
const HOLD_MS = 2000;
// duration of the fly-to-navbar move (the logo twist runs the same length)
const FLY_MS = 900;
// quick fade used when the visitor clicks to skip
const SKIP_FADE_MS = 250;
const SEEN_KEY = 'introSeen';

type Phase = 'hold' | 'fly' | 'skip' | 'done';

// Full-screen white intro shown once per browser session on the home page:
// the brand (logo + headline) starts centered, then flies onto the navbar's
// real brand while the logo twists and the white backdrop fades out. The
// group's opacity crossfades to the real brand at the end of the move, which
// also hides the small layout differences (mobile nav stacks the name) that
// a pure translate+scale can't morph. Any click, or Escape, skips.
export default function IntroOverlay() {
  const [phase, setPhase] = useState<Phase>('hold');
  const [flyTransform, setFlyTransform] = useState('');
  const groupRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);

  const markSeen = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* private-mode storage errors just mean the intro replays */
    }
  };

  const skip = useCallback(() => {
    setPhase((p) => {
      if (p === 'skip' || p === 'done') return p;
      markSeen();
      timers.current.push(
        window.setTimeout(() => setPhase('done'), SKIP_FADE_MS),
      );
      return 'skip';
    });
  }, []);

  const fly = useCallback(() => {
    const group = groupRef.current;
    const logo = logoRef.current;
    // the navbar renders the brand in three places (mobile bar, drawer,
    // desktop bar); pick the one actually on screen — display:none and the
    // closed drawer (translated fully off-screen) both fail the rect check
    const target = Array.from(
      document.querySelectorAll<HTMLElement>('[data-intro-brand] img'),
    ).find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.right > 0 && r.left < window.innerWidth;
    });
    if (!group || !logo || !target) {
      skip();
      return;
    }
    // FLIP anchored on the logo: scale the whole group so the big logo
    // matches the navbar logo's height, and translate so their centers
    // coincide. The group transforms about its own center, so a point p maps
    // to c + (p - c) * s + (dx, dy); solve that for the logo's center.
    const g = group.getBoundingClientRect();
    const l = logo.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const s = tr.height / l.height;
    const cx = g.left + g.width / 2;
    const cy = g.top + g.height / 2;
    const dx = tr.left + tr.width / 2 - (cx + (l.left + l.width / 2 - cx) * s);
    const dy = tr.top + tr.height / 2 - (cy + (l.top + l.height / 2 - cy) * s);
    setFlyTransform(`translate(${dx}px, ${dy}px) scale(${s})`);
    setPhase('fly');
    timers.current.push(
      window.setTimeout(() => {
        markSeen();
        setPhase('done');
      }, FLY_MS + 100),
    );
  }, [skip]);

  useEffect(() => {
    const pending = timers.current;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) {
        setPhase('done');
        return;
      }
    } catch {
      /* storage unavailable: play the intro anyway */
    }
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    pending.push(
      window.setTimeout(reduced ? skip : fly, reduced ? 900 : HOLD_MS),
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      pending.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
    };
  }, [fly, skip]);

  // lock scrolling underneath while the intro is covering the page
  useEffect(() => {
    if (phase === 'done') return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      id="intro-overlay"
      // aria-hidden: purely decorative duplicate of the navbar brand; the
      // real page stays available to assistive tech the whole time
      aria-hidden
      // the pre-hydration script below may set display:none on this node
      suppressHydrationWarning
      onClick={skip}
      className={`fixed inset-0 z-[60] flex items-center justify-center px-6 transition-opacity ${
        phase === 'skip' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${SKIP_FADE_MS}ms` }}
    >
      {/* white backdrop fades separately so the site is revealed while the
          brand is still mid-flight toward the navbar */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-700 ${
          phase === 'fly' ? 'opacity-0 delay-200' : 'opacity-100'
        }`}
      />
      {/* the transition lives on this element from first render, and only
          the transform/opacity VALUES change when the fly starts — a CSS
          animation on the same element (or introducing the transition in
          the same commit as the change) stops the transition from running,
          which is why the entrance fade lives on the inner wrapper instead.
          perspective gives the logo's rotateY twist real depth */}
      <div
        ref={groupRef}
        className="relative"
        style={{
          perspective: '800px',
          transition: `transform ${FLY_MS}ms cubic-bezier(0.65, 0, 0.35, 1), opacity 350ms ease ${FLY_MS - 350}ms`,
          ...(phase === 'fly'
            ? { transform: flyTransform, opacity: 0 }
            : undefined),
        }}
      >
        {/* dir="ltr" + items-end mirror the navbar Brand so the landing
            pose matches */}
        <div
          dir="ltr"
          className={`flex items-end gap-3 sm:gap-4 ${
            phase === 'hold' ? 'intro-fade-in' : ''
          }`}
        >
          <span
            ref={logoRef}
            className={`shrink-0 ${phase === 'fly' ? 'intro-twist' : ''}`}
          >
            <Logo priority className="h-20 w-auto sm:h-32" />
          </span>
          <p
            dir="ltr"
            className="font-display translate-y-[1px] text-2xl leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl"
          >
            <span className="block font-bold whitespace-nowrap sm:inline">
              {en.Hero.nameBold}
            </span>{' '}
            <span className="block font-normal whitespace-nowrap sm:ms-2 sm:inline">
              {en.Hero.nameRegular}
            </span>
          </p>
        </div>
      </div>
      {/* runs before hydration: repeat views in the same session (locale
          switch, back-navigation) must not flash the intro while React
          boots; the mount effect then unmounts it for real */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('${SEEN_KEY}'))document.getElementById('intro-overlay').style.display='none'}catch(e){}`,
        }}
      />
    </div>
  );
}
