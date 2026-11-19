import { useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { NOIR_INTRO_MEDIA } from '../../data/noirMedia';

export interface HomeHeroProps {
  isRevealed: boolean;
  instantReveal?: boolean;
  onExploreCollections: () => void;
  onReplayIntro: () => void;
}

export function HomeHero({
  isRevealed,
  instantReveal = false,
  onExploreCollections,
  onReplayIntro,
}: HomeHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const heroVideoSrc = isMobile
    ? NOIR_INTRO_MEDIA.heroMobileVideo
    : NOIR_INTRO_MEDIA.heroDesktopVideo;
  const heroPosterSrc = isMobile
    ? NOIR_INTRO_MEDIA.heroMobilePoster
    : NOIR_INTRO_MEDIA.heroDesktopPoster;

  // Prepare and begin playing the underlying hero campaign video BEFORE Timeline 05 dissolves
  useEffect(() => {
    if (prefersReducedMotion || videoFailed) return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    const promise = vid.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        // Autoplay restricted; poster remains seamlessly visible
      });
    }
  }, [heroVideoSrc, prefersReducedMotion, videoFailed]);

  const revealMotionClass = instantReveal
    ? 'transition-none'
    : 'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]';

  return (
    <section
      aria-label="NOIR Autumn Winter Campaign"
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-[#151112]"
    >
      {/* Pre-mounted Campaign Film / Poster Layer (zero layout shift or flash during intro dissolve) */}
      <div className="absolute inset-0 h-full w-full">
        {!videoFailed && !prefersReducedMotion ? (
          <video
            ref={videoRef}
            key={heroVideoSrc}
            src={heroVideoSrc}
            poster={heroPosterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <img
            src={heroPosterSrc}
            alt="NOIR Autumn Winter Couture Campaign in heritage sandstone colonnade"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
        )}

        {/* Measured Editorial Scrims for WCAG AA legibility across desktop and mobile */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#151112]/90 via-[#151112]/48 to-transparent hidden md:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#151112]/92 via-[#151112]/38 to-[#151112]/48 md:bg-gradient-to-t md:from-[#151112]/80 md:via-transparent md:to-[#151112]/35"
        />
      </div>

      {/* Editorial Hero Foreground */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end md:justify-center px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 md:pb-0 md:pt-16">
        <div className="max-w-xl">
          <div
            className={`${revealMotionClass} ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <p className="font-sans-noir text-xs font-normal tracking-[0.28em] uppercase text-[#B69A6A]">
              Atelier of Modern India · Autumn / Winter
            </p>
          </div>

          <h1
            style={{ textWrap: 'balance' }}
            className={`font-editorial mt-4 text-[clamp(2.6rem,5.4vw,4.75rem)] font-light leading-[1.04] tracking-[0.04em] text-[#EDE4D8] ${revealMotionClass} delay-100 ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Tradition, Reimagined.
          </h1>

          <p
            className={`font-sans-noir mt-5 max-w-md text-sm sm:text-[15px] font-light leading-relaxed text-[#EDE4D8]/80 ${revealMotionClass} delay-200 ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Sculptural menswear and womenswear handwoven in deep burgundy Banarasi silk,
            obsidian raw mulberry, and burnished antique gold zardozi.
          </p>

          <div
            className={`mt-8 sm:mt-10 flex flex-wrap items-center gap-6 ${revealMotionClass} delay-300 ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <button
              type="button"
              onClick={onExploreCollections}
              className="group inline-flex min-h-[46px] items-center gap-3 bg-[#641F2B] px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#EDE4D8] transition-colors duration-200 hover:bg-[#7A2735] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onReplayIntro}
              className="inline-flex min-h-[44px] items-center gap-2 text-xs font-normal uppercase tracking-[0.2em] text-[#EDE4D8]/75 transition-colors duration-200 hover:text-[#B69A6A] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Replay Opening Film</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Quiet Editorial Chapter Line */}
      <div
        className={`pointer-events-none absolute bottom-6 inset-x-0 z-10 hidden md:block ${revealMotionClass} delay-300 ${
          isRevealed ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-12 text-[11px] tracking-[0.24em] uppercase text-[#EDE4D8]/50">
          <span>Mumbai · New Delhi · Varanasi Looms</span>
          <span>Menswear &amp; Womenswear Couture</span>
        </div>
      </div>
    </section>
  );
}
