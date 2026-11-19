import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';
import {
  createIntroTimeline,
  createReducedMotionIntroTimeline,
  type IntroPhase,
} from '../../animations/intro.timeline';
import { NoirAmbientAudio } from '../../audio/noirAmbientAudio';
import { NOIR_INTRO_MEDIA, type IntroMediaConfig } from '../../data/noirMedia';

export const NOIR_INTRO_SESSION_KEY = 'noir_intro_completed_v4';

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
  /** Fired right as Scene 05 opens into the homepage so Navigation & Hero reveal cleanly */
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
      // Autoplay blocked by browser policy; exact-match poster fallback remains visible
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
  const audioRef = useRef<NoirAmbientAudio | null>(null);

  const primarySilkRef = useRef<HTMLVideoElement | null>(null);
  const depthSilkRef = useRef<HTMLVideoElement | null>(null);
  const craftVideoRef = useRef<HTMLVideoElement | null>(null);
  const transitionSilkRef = useRef<HTMLVideoElement | null>(null);

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

  const [soundEnabled, setSoundEnabled] = useState(false);

  const [primarySilkFailed, setPrimarySilkFailed] = useState(false);
  const [depthSilkFailed, setDepthSilkFailed] = useState(false);
  const [craftVideoFailed, setCraftVideoFailed] = useState(false);
  const [transitionSilkFailed, setTransitionSilkFailed] = useState(false);

  const isMobile = viewportMode === 'mobile';
  const isTablet = viewportMode === 'tablet';

  // Scene 01 & 02: Floating red-burgundy Banarasi silk saree suspended in twilight
  const openingSilkVideo = isMobile
    ? resolvedMedia.silkPortraitVideo
    : resolvedMedia.floatingSareeVideo;
  const openingSilkPoster = isMobile
    ? resolvedMedia.silkPortraitPoster
    : resolvedMedia.floatingSareePoster;

  // Scene 03: Woman walking gracefully toward the floating burgundy saree to catch it
  const catchSceneVideo = isMobile
    ? resolvedMedia.heroMobileVideo
    : resolvedMedia.womanWalkingCatchVideo;
  const catchScenePoster = isMobile
    ? resolvedMedia.heroMobilePoster
    : resolvedMedia.womanWalkingCatchPoster;

  // Scene 05: Flowing burgundy silk wrap expanding from center directly into the Entry Hero
  const transitionVeilVideo = isMobile
    ? resolvedMedia.silkPortraitVideo
    : resolvedMedia.sareeCatchWrapVideo;
  const transitionVeilPoster = isMobile
    ? resolvedMedia.silkPortraitPoster
    : resolvedMedia.sareeCatchWrapPoster;

  const finalizeIntro = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    markNoirIntroCompleted();
    audioRef.current?.fadeOutAndDispose(0.85);
    audioRef.current = null;
    document.documentElement.classList.remove('noir-intro-lock');
    document.body.classList.remove('noir-intro-lock');
    onCompleteRef.current();
  }, []);

  const handleToggleSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new NoirAmbientAudio();
    }
    const nextState = audioRef.current.toggle();
    setSoundEnabled(nextState);
  }, []);

  const handleSkip = useCallback(() => {
    if (hasFinishedRef.current) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    audioRef.current?.fadeOutAndDispose(0.35);
    audioRef.current = null;

    // Immediately settle homepage into complete, non-partial final state
    markNoirIntroCompleted();
    onRevealRef.current?.(true);

    const shell = containerRef.current?.querySelector('[data-intro="shell"]');
    if (shell && !prefersReducedMotion) {
      gsap.to(shell, {
        opacity: 0,
        duration: 0.34,
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
      audioRef.current?.fadeOutAndDispose(0.25);
      audioRef.current = null;
    };
  }, [handleSkip]);

  // Scoped GSAP context master timeline (React Strict Mode safe, zero duplicate timelines)
  useEffect(() => {
    if (!forcePlay && hasCompletedNoirIntro()) {
      onRevealRef.current?.(true);
      finalizeIntro();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    hasFinishedRef.current = false;

    // Preload & play ONLY the critical opening burgundy silk video immediately
    if (!prefersReducedMotion) {
      attemptVideoPlay(primarySilkRef.current);
    }

    const ctx = gsap.context(() => {
      const callbacks = {
        onPhaseChange: (phase: IntroPhase) => {
          if (prefersReducedMotion) return;

          if (phase === 'fabricReveal') {
            attemptVideoPlay(depthSilkRef.current);
            // Lazy-prepare macro craftsmanship clip right before Scene 03
            if (craftVideoRef.current && craftVideoRef.current.readyState === 0) {
              craftVideoRef.current.preload = 'auto';
              craftVideoRef.current.load();
            }
            audioRef.current?.pulseFabric(1.5, 0.036);
          }

          if (phase === 'craftsmanship') {
            attemptVideoPlay(craftVideoRef.current);
            // Lazy-prepare transition silk clip right before Scene 05
            if (transitionSilkRef.current && transitionSilkRef.current.readyState === 0) {
              transitionSilkRef.current.preload = 'auto';
              transitionSilkRef.current.load();
            }
          }

          if (phase === 'wordmarkReveal') {
            audioRef.current?.playTransitionSwell();
          }

          if (phase === 'homepageTransition') {
            attemptVideoPlay(transitionSilkRef.current);
            audioRef.current?.pulseFabric(1.6, 0.045);
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
      aria-label="NOIR cinematic brand introduction"
      className="fixed inset-0 z-50 h-[100svh] w-[100vw] overflow-hidden select-none"
    >
      <div
        data-intro="shell"
        className="relative h-full w-full overflow-hidden bg-[#151112]"
      >
        {/* Obsidian Base Stage */}
        <div
          data-intro="bg-stage"
          aria-hidden="true"
          className="absolute inset-0 bg-[#151112]"
        />

        {/* ===============================================================
            SCENE 01 & 02: LAYERED BURGUNDY SILK (Primary + Parallax Depth)
           =============================================================== */}
        <div
          data-intro="fabric-primary"
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          {!primarySilkFailed && !prefersReducedMotion ? (
            <video
              ref={primarySilkRef}
              key={openingSilkVideo}
              src={openingSilkVideo}
              poster={openingSilkPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onError={() => setPrimarySilkFailed(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              src={openingSilkPoster}
              alt="Deep burgundy Banarasi silk emerging from obsidian darkness"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          )}

          <div
            data-intro="directional-light"
            aria-hidden="true"
            className="noir-directional-light absolute inset-0 will-change-transform"
          />
          <div aria-hidden="true" className="noir-vignette absolute inset-0" />
        </div>

        {/* Second Parallax Silk Depth Layer (Desktop & Tablet only to keep mobile lean) */}
        {!isMobile && (
          <div
            data-intro="fabric-depth"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen will-change-transform"
          >
            {!depthSilkFailed && !prefersReducedMotion ? (
              <video
                ref={depthSilkRef}
                src={resolvedMedia.silkLandscapeVideo}
                poster={resolvedMedia.silkLandscapePoster}
                muted
                loop
                playsInline
                preload="none"
                onError={() => setDepthSilkFailed(true)}
                className="h-full w-full scale-x-[-1] object-cover object-center opacity-75"
              />
            ) : (
              <img
                src={resolvedMedia.silkLandscapePoster}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full scale-x-[-1] object-cover object-center opacity-75"
              />
            )}
            <div className="noir-vignette absolute inset-0" />
          </div>
        )}

        {/* ===============================================================
            SCENE 03: WOMAN WALKING TOWARD THE FLOATING SAREE TO CATCH IT
            Slow tracking glide + soft focus-to-sharp + antique gold light sweep
           =============================================================== */}
        <div
          data-intro="craft-layer"
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          {!craftVideoFailed && !prefersReducedMotion ? (
            <video
              ref={craftVideoRef}
              key={catchSceneVideo}
              src={catchSceneVideo}
              poster={catchScenePoster}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              onError={() => setCraftVideoFailed(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              src={catchScenePoster}
              alt="Woman walking gracefully to catch the floating red-burgundy Banarasi silk saree"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          )}
          <div
            data-intro="craft-light-sweep"
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -inset-x-1/3 bg-[linear-gradient(108deg,transparent_28%,rgba(182,154,106,0.32)_48%,rgba(237,228,216,0.2)_52%,transparent_72%)] mix-blend-screen will-change-transform"
          />
          <div aria-hidden="true" className="noir-vignette absolute inset-0" />
        </div>

        {/* ===============================================================
            SCENE 01 CENTER NARROW WARM LIGHT APERTURE
           =============================================================== */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            data-intro="center-slit"
            className="noir-center-slit h-[44svh] min-h-[220px] max-h-[420px] w-[26vw] min-w-[140px] max-w-[280px] will-change-transform"
          />
          <div
            data-intro="center-bloom"
            className="noir-center-bloom absolute h-[52vw] max-h-[500px] min-h-[240px] w-[52vw] max-w-[500px] min-w-[240px] rounded-full will-change-transform"
          />
        </div>

        {/* ===============================================================
            SCENE 04: DEEP BURGUNDY ENVIRONMENT + BACKLIT NOIR® WORDMARK
           =============================================================== */}
        <div
          data-intro="burgundy-stage"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_78%_70%_at_50%_50%,rgba(100,31,43,0.52)_0%,rgba(53,21,29,0.78)_48%,rgba(21,17,18,0.96)_100%)]"
        />

        <div
          data-intro="wordmark-group"
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          {/* Backlight halo revealing the letters from behind */}
          <div
            data-intro="wordmark-backlight"
            aria-hidden="true"
            className="noir-wordmark-backlight absolute h-[42svh] max-h-[380px] w-[82vw] max-w-[780px] will-change-transform"
          />

          <div className="relative inline-flex items-start justify-center">
            <h1
              aria-label="NOIR"
              className="font-editorial relative flex items-baseline font-light text-[#EDE4D8] tracking-[0.28em] sm:tracking-[0.34em] lg:tracking-[0.38em] text-[3.5rem] sm:text-[5.25rem] md:text-[6.5rem] lg:text-[7.75rem] xl:text-[8.75rem] leading-none"
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

              {/* Subtle antique-gold reflection sweep strictly aligned to NOIR lettering */}
              <span
                data-intro="wordmark-sheen"
                aria-hidden="true"
                className="noir-gold-sheen-text pointer-events-none absolute inset-0 flex items-baseline"
              >
                {WORDMARK_LETTERS.map((letter, idx) => (
                  <span
                    key={`sheen-${letter}-${idx}`}
                    className="inline-block overflow-hidden py-1"
                  >
                    <span className="inline-block">{letter}</span>
                  </span>
                ))}
              </span>
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
              className="font-sans-noir text-[11px] sm:text-xs md:text-[13px] font-normal uppercase tracking-[0.38em] sm:tracking-[0.46em] text-[#EDE4D8]/90 will-change-transform"
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
            SCENE 05: CENTER-EXPANDING BURGUNDY SILK FULL-SCREEN VEIL
            Expands outward from center and dissolves into live Entry Hero film
           =============================================================== */}
        <div
          data-intro="transition-silk"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full bg-[#35151D] will-change-transform"
        >
          {!transitionSilkFailed && !prefersReducedMotion ? (
            <video
              ref={transitionSilkRef}
              key={`veil-${transitionVeilVideo}`}
              src={transitionVeilVideo}
              poster={transitionVeilPoster}
              muted
              loop
              playsInline
              preload="none"
              onError={() => setTransitionSilkFailed(true)}
              className="h-full w-full object-cover object-center opacity-92"
            />
          ) : (
            <img
              src={transitionVeilPoster}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center opacity-92"
            />
          )}
          <div className="absolute inset-0 bg-[#641F2B]/26 mix-blend-multiply" />
          <div className="noir-vignette absolute inset-0" />
        </div>

        {/* ===============================================================
            LIGHTWEIGHT FILM GRAIN OVERLAY
           =============================================================== */}
        {!prefersReducedMotion && (
          <div
            data-intro="grain"
            aria-hidden="true"
            className="noir-film-grain pointer-events-none absolute inset-0 z-40 h-full w-full"
          />
        )}

        {/* ===============================================================
            TOP-RIGHT MINIMAL CONTROLS: OPTIONAL SOUND + SKIP INTRO
           =============================================================== */}
        <div
          data-intro="controls"
          className="absolute top-6 right-5 sm:top-8 sm:right-8 lg:top-10 lg:right-12 z-50 flex items-center gap-4 sm:gap-6"
        >
          {!prefersReducedMotion && (
            <button
              type="button"
              onClick={handleToggleSound}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Mute ambient sound' : 'Enable subtle ambient sound'}
              className="font-sans-noir inline-flex min-h-[44px] items-center gap-2 px-2 py-2 text-[11px] sm:text-xs font-normal uppercase tracking-[0.24em] text-[#EDE4D8]/68 transition-colors duration-200 hover:text-[#B69A6A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A] whitespace-nowrap cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-[#B69A6A]" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? 'SOUND ON' : 'SOUND'}</span>
            </button>
          )}

          {!prefersReducedMotion && (
            <span aria-hidden="true" className="h-3 w-px bg-[#EDE4D8]/20" />
          )}

          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip brand introduction"
            className="font-sans-noir group inline-flex min-h-[44px] items-center gap-2.5 px-2 py-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.26em] text-[#EDE4D8]/80 transition-colors duration-200 hover:text-[#EDE4D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A] whitespace-nowrap cursor-pointer"
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
