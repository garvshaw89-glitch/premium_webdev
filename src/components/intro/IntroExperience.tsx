import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  createIntroTimeline,
  createReducedMotionIntroTimeline,
} from '../../animations/intro.timeline';
import { NOIR_INTRO_MEDIA, type IntroMediaConfig } from '../../data/noirMedia';

export const NOIR_INTRO_SESSION_KEY = 'noir_intro_completed_v2';

export function hasCompletedNoirIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(NOIR_INTRO_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markNoirIntroCompleted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(NOIR_INTRO_SESSION_KEY, 'true');
  } catch {
    // Gracefully ignore storage restrictions in private browsing / sandboxed iframes
  }
}

export function resetNoirIntroSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(NOIR_INTRO_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

export interface IntroExperienceProps {
  /** Override media paths if integrating external CDN campaign footage */
  media?: Partial<IntroMediaConfig>;
  /** Force playback even if sessionStorage already recorded completion (e.g. Replay Film) */
  forcePlay?: boolean;
  /** Fired right as Timeline 05 opens into the homepage so Hero typography can choreograph smoothly */
  onRevealHomepage?: (instant?: boolean) => void;
  /** Fired once the intro overlay has completely finished and can be unmounted */
  onComplete: () => void;
}

const WORDMARK_LETTERS = ['N', 'O', 'I', 'R'];

function attemptVideoPlay(video: HTMLVideoElement | null): void {
  if (!video) return;
  video.muted = true;
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      // Autoplay blocked by browser policy; poster image fallback remains seamlessly visible
    });
  }
}

export function IntroExperience({
  media,
  forcePlay = false,
  onRevealHomepage,
  onComplete,
}: IntroExperienceProps) {
  const resolvedMedia: IntroMediaConfig = {
    ...NOIR_INTRO_MEDIA,
    ...media,
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pullVideoRef = useRef<HTMLVideoElement | null>(null);
  const rotateVideoRef = useRef<HTMLVideoElement | null>(null);
  const transitionVideoRef = useRef<HTMLVideoElement | null>(null);

  const hasFinishedRef = useRef(false);
  const onRevealRef = useRef(onRevealHomepage);
  const onCompleteRef = useRef(onComplete);
  onRevealRef.current = onRevealHomepage;
  onCompleteRef.current = onComplete;

  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [pullVideoFailed, setPullVideoFailed] = useState(false);
  const [rotateVideoFailed, setRotateVideoFailed] = useState(false);
  const [transitionVideoFailed, setTransitionVideoFailed] = useState(false);

  const isMobile = viewportMode === 'mobile';
  const isTablet = viewportMode === 'tablet';

  // Dedicated mobile vertical crops vs. desktop widescreen cinema frames
  const activePullVideo = isMobile
    ? resolvedMedia.silkPortraitVideo
    : resolvedMedia.sareePullVideo;
  const activePullPoster = isMobile
    ? resolvedMedia.silkPortraitPoster
    : resolvedMedia.sareePullPoster;

  const activeRotateVideo = isMobile
    ? resolvedMedia.heroMobileVideo
    : resolvedMedia.womanRotateVideo;
  const activeRotatePoster = isMobile
    ? resolvedMedia.heroMobilePoster
    : resolvedMedia.womanRotatePoster;

  const activeTransitionVideo = isMobile
    ? resolvedMedia.silkPortraitVideo
    : resolvedMedia.silkLandscapeVideo;
  const activeTransitionPoster = isMobile
    ? resolvedMedia.silkPortraitPoster
    : resolvedMedia.silkLandscapePoster;

  const finalizeIntro = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    markNoirIntroCompleted();
    document.documentElement.classList.remove('noir-intro-lock');
    document.body.classList.remove('noir-intro-lock');
    onCompleteRef.current();
  }, []);

  const handleSkip = useCallback(() => {
    if (hasFinishedRef.current) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    // Immediately settle homepage into complete, non-partial final state
    markNoirIntroCompleted();
    onRevealRef.current?.(true);

    const shell = containerRef.current?.querySelector('[data-intro="shell"]');
    if (shell && !prefersReducedMotion) {
      gsap.to(shell, {
        opacity: 0,
        duration: 0.28,
        ease: 'power2.out',
        onComplete: finalizeIntro,
      });
    } else {
      finalizeIntro();
    }
  }, [finalizeIntro, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewport = () => {
      const w = window.innerWidth;
      setViewportMode(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('noir-intro-lock');
    document.body.classList.add('noir-intro-lock');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.classList.remove('noir-intro-lock');
      document.body.classList.remove('noir-intro-lock');
    };
  }, [handleSkip]);

  // Master GSAP timeline lifecycle inside scoped gsap.context (Strict Mode safe)
  useEffect(() => {
    if (!forcePlay && hasCompletedNoirIntro()) {
      onRevealRef.current?.(true);
      finalizeIntro();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    hasFinishedRef.current = false;

    if (!prefersReducedMotion) {
      attemptVideoPlay(pullVideoRef.current);
      attemptVideoPlay(transitionVideoRef.current);
    }

    const ctx = gsap.context(() => {
      const callbacks = {
        onPhaseChange: (phase: string) => {
          if (phase === 'craftsmanship' && !prefersReducedMotion) {
            if (rotateVideoRef.current) {
              rotateVideoRef.current.currentTime = 0;
            }
            attemptVideoPlay(rotateVideoRef.current);
          }
          if (phase === 'transition' && !prefersReducedMotion) {
            attemptVideoPlay(transitionVideoRef.current);
          }
        },
        onRevealHomepage: (instant?: boolean) => {
          onRevealRef.current?.(instant);
        },
        onComplete: () => {
          finalizeIntro();
        },
      };

      timelineRef.current = prefersReducedMotion
        ? createReducedMotionIntroTimeline(container, callbacks)
        : createIntroTimeline(container, {
            isMobile,
            isTablet,
            callbacks,
          });
    }, container);

    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, [finalizeIntro, forcePlay, isMobile, isTablet, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="NOIR brand introduction"
      className="fixed inset-0 z-50 h-[100svh] w-[100vw] overflow-hidden select-none"
    >
      <div
        data-intro="shell"
        className="relative h-full w-full overflow-hidden bg-[#151112]"
      >
        {/* ===============================================================
            LAYER 01: THE SAREE PULL (Timeline 02)
            Man in obsidian tailoring pulling the flowing red-burgundy saree
           =============================================================== */}
        <div
          data-intro="fabric-layer"
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          {!pullVideoFailed && !prefersReducedMotion ? (
            <video
              ref={pullVideoRef}
              key={activePullVideo}
              src={activePullVideo}
              poster={activePullPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onError={() => setPullVideoFailed(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              src={activePullPoster}
              alt="Man in obsidian couture pulling a flowing red-burgundy Banarasi silk saree"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          )}

          <div
            data-intro="directional-light"
            aria-hidden="true"
            className="noir-directional-light absolute inset-0"
          />
          <div aria-hidden="true" className="noir-vignette absolute inset-0" />
        </div>

        {/* ===============================================================
            LAYER 02: WOMAN SMOOTHLY ROTATING IN THE BURGUNDY SAREE (Timeline 03)
            Fluid slow-motion rotation with antique gold light sweeping across silk
           =============================================================== */}
        <div
          data-intro="craft-layer"
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          {!rotateVideoFailed && !prefersReducedMotion ? (
            <video
              ref={rotateVideoRef}
              key={activeRotateVideo}
              src={activeRotateVideo}
              poster={activeRotatePoster}
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onError={() => setRotateVideoFailed(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              src={activeRotatePoster}
              alt="Woman wearing a flowing red-burgundy Banarasi silk saree rotating smoothly"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          )}
          <div
            data-intro="craft-light-sweep"
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -inset-x-1/3 bg-[linear-gradient(108deg,transparent_28%,rgba(182,154,106,0.28)_48%,rgba(237,228,216,0.18)_52%,transparent_72%)] mix-blend-screen will-change-transform"
          />
          <div aria-hidden="true" className="noir-vignette absolute inset-0" />
        </div>

        {/* ===============================================================
            LAYER 03: CENTER WARM OPTICAL LIGHT BLOOM (Timeline 01)
           =============================================================== */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            data-intro="center-bloom"
            className="noir-center-bloom h-[58vw] max-h-[540px] min-h-[260px] w-[58vw] max-w-[540px] min-w-[260px] rounded-full will-change-transform"
          />
          <div
            data-intro="center-core"
            className="absolute h-2 w-2 rounded-full bg-[#EDE4D8] shadow-[0_0_28px_8px_rgba(182,154,106,0.45)] will-change-transform"
          />
        </div>

        {/* ===============================================================
            LAYER 04: THE NOIR® WORDMARK & BRAND SIGNATURE (Timeline 04)
            Exact visual center, clipped letter mask reveal, zero bounce/spin
           =============================================================== */}
        <div
          data-intro="wordmark-group"
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          <div className="relative inline-flex items-start justify-center">
            <h1
              aria-label="NOIR"
              className="font-editorial flex items-baseline font-light text-[#EDE4D8] drop-shadow-[0_10px_28px_rgba(21,17,18,0.8)] tracking-[0.26em] sm:tracking-[0.32em] lg:tracking-[0.36em] text-[3.5rem] sm:text-[5rem] md:text-[6.25rem] lg:text-[7.5rem] xl:text-[8.5rem] leading-none"
            >
              {WORDMARK_LETTERS.map((letter, idx) => (
                <span
                  key={`${letter}-${idx}`}
                  className="inline-block overflow-hidden py-1"
                >
                  <span
                    data-intro="wordmark-char"
                    className="inline-block will-change-transform"
                  >
                    {letter}
                  </span>
                </span>
              ))}
            </h1>
            <span
              data-intro="wordmark-reg"
              aria-hidden="true"
              className="font-sans-noir -ml-1 sm:-ml-2 mt-1 sm:mt-2 text-[0.75rem] sm:text-[0.95rem] lg:text-[1.1rem] font-light text-[#B69A6A] will-change-transform"
            >
              ®
            </span>
          </div>

          <div
            data-intro="gold-rule"
            aria-hidden="true"
            className="mt-5 mb-5 h-px w-16 sm:w-24 bg-[#B69A6A]/70 will-change-transform"
          />

          <div className="overflow-hidden">
            <p
              data-intro="descriptor"
              className="font-sans-noir text-[11px] sm:text-xs md:text-[13px] font-normal uppercase tracking-[0.34em] sm:tracking-[0.42em] text-[#EDE4D8]/90 will-change-transform"
            >
              ATELIER OF MODERN INDIA
            </p>
          </div>

          <div className="mt-3 overflow-hidden">
            <p
              data-intro="tagline"
              className="font-editorial italic text-lg sm:text-xl md:text-2xl font-light tracking-[0.06em] text-[#B69A6A] will-change-transform"
            >
              Tradition, Reimagined.
            </p>
          </div>
        </div>

        {/* ===============================================================
            LAYER 05: BURGUNDY SILK SWEEP VEIL (Timeline 05)
            Glides smoothly across the viewport before dissolving into Entry Hero
           =============================================================== */}
        <div
          data-intro="transition-silk"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full bg-[#35151D] will-change-transform"
        >
          {!transitionVideoFailed && !prefersReducedMotion ? (
            <video
              ref={transitionVideoRef}
              key={`transition-${activeTransitionVideo}`}
              src={activeTransitionVideo}
              poster={activeTransitionPoster}
              muted
              loop
              playsInline
              preload="none"
              onError={() => setTransitionVideoFailed(true)}
              className="h-full w-full object-cover object-center opacity-88"
            />
          ) : (
            <img
              src={activeTransitionPoster}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center opacity-88"
            />
          )}
          <div className="absolute inset-0 bg-[#641F2B]/32 mix-blend-multiply" />
          <div className="noir-vignette absolute inset-0" />
        </div>

        {/* ===============================================================
            LAYER 06: SUBTLE LIGHTWEIGHT FILM GRAIN
           =============================================================== */}
        {!prefersReducedMotion && (
          <div
            data-intro="grain"
            aria-hidden="true"
            className="noir-film-grain pointer-events-none absolute inset-0 z-40 h-full w-full"
          />
        )}

        {/* ===============================================================
            SKIP INTRO CONTROL — Top Right, Minimal Uppercase Manrope
           =============================================================== */}
        <div className="absolute top-6 right-5 sm:top-8 sm:right-8 lg:top-10 lg:right-12 z-50">
          <button
            type="button"
            data-intro="skip-btn"
            onClick={handleSkip}
            aria-label="Skip brand introduction"
            className="font-sans-noir group inline-flex min-h-[44px] items-center gap-2.5 px-3 py-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.26em] text-[#EDE4D8]/78 transition-colors duration-200 hover:text-[#EDE4D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A] whitespace-nowrap cursor-pointer"
          >
            <span>SKIP INTRO</span>
            <span
              aria-hidden="true"
              className="block h-px w-4 bg-[#B69A6A]/65 transition-all duration-200 group-hover:w-6 group-hover:bg-[#B69A6A]"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntroExperience;
