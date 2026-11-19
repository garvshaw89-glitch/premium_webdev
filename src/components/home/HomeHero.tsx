import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { NOIR_INTRO_MEDIA } from '../../data/noirMedia';

export interface HomeHeroProps {
  isRevealed: boolean;
  instantReveal?: boolean;
  onExploreCollections: () => void;
  onReplayIntro: () => void;
}

const FILM_CHAPTERS = [
  { id: 'floating', label: '01 · Floating Silk', seekSec: 3.1 },
  { id: 'reach', label: '02 · The Reach', seekSec: 5.7 },
  { id: 'embrace', label: '03 · The Embrace', seekSec: 0.2 },
] as const;

type HeroChapterId = (typeof FILM_CHAPTERS)[number]['id'];

export function HomeHero({
  isRevealed,
  instantReveal = false,
  onExploreCollections,
  onReplayIntro,
}: HomeHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [activeChapter, setActiveChapter] = useState<HeroChapterId>('embrace');

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

  // Prepare and play the looping couture film smoothly underneath the intro before reveal
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

  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || isMobile) return;
    const t = vid.currentTime;
    if (t >= 2.8 && t < 5.3) {
      setActiveChapter('floating');
    } else if (t >= 5.3 && t < 7.9) {
      setActiveChapter('reach');
    } else {
      setActiveChapter('embrace');
    }
  }, [isMobile]);

  const handleSelectChapter = useCallback(
    (chapterId: HeroChapterId, seekSec: number) => {
      setActiveChapter(chapterId);
      const vid = videoRef.current;
      if (vid && !isMobile && !videoFailed) {
        vid.currentTime = seekSec;
        const p = vid.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    },
    [isMobile, videoFailed]
  );

  const revealMotionClass = instantReveal
    ? 'transition-none'
    : 'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]';

  return (
    <section
      aria-label="NOIR Autumn Winter Campaign"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#151112]"
    >
      {/* Full-Bleed Couture Campaign Film (Man pulling red-burgundy saree -> Woman smoothly turning) */}
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
            onTimeUpdate={handleTimeUpdate}
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <img
            src={heroPosterSrc}
            alt="NOIR Couture Campaign — flowing red-burgundy Banarasi silk saree in twilight sandstone hall"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
        )}

        {/* Measured Editorial Scrim — protects left typography while keeping burgundy saree & models luminous */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute inset-0 bg-[linear-gradient(90deg,rgba(21,17,18,0.88)_0%,rgba(21,17,18,0.58)_34%,rgba(21,17,18,0.12)_64%,rgba(21,17,18,0.22)_100%)]"
        />
        <div
          aria-hidden="true"
          className="md:hidden absolute inset-0 bg-[linear-gradient(180deg,rgba(21,17,18,0.55)_0%,rgba(21,17,18,0.14)_36%,rgba(21,17,18,0.45)_68%,rgba(21,17,18,0.94)_100%)]"
        />
        <div
          aria-hidden="true"
          className="hidden md:block absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#151112]/80 to-transparent"
        />
      </div>

      {/* Editorial Hero Foreground */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end md:justify-center px-5 sm:px-8 lg:px-12 pb-12 sm:pb-16 md:pb-0 md:pt-14">
        <div className="max-w-lg">
          <div
            className={`${revealMotionClass} ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <p className="font-sans-noir text-[11px] sm:text-xs font-normal tracking-[0.3em] uppercase text-[#B69A6A]">
              Atelier of Modern India · Scene 01
            </p>
          </div>

          <h1
            style={{ textWrap: 'balance' }}
            className={`font-editorial mt-4 text-[clamp(2.75rem,5.5vw,5rem)] font-light leading-[1.02] tracking-[0.03em] text-[#EDE4D8] ${revealMotionClass} delay-100 ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Tradition, Reimagined.
          </h1>

          <div
            aria-hidden="true"
            className={`mt-6 h-px w-14 bg-[#B69A6A]/65 ${revealMotionClass} delay-150 ${
              isRevealed ? 'opacity-100 scale-x-100 origin-left' : 'opacity-0 scale-x-0 origin-left'
            }`}
          />

          <p
            className={`font-sans-noir mt-5 max-w-md text-sm sm:text-[15px] font-light leading-relaxed text-[#EDE4D8]/82 ${revealMotionClass} delay-200 ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Six weightless yards of deep burgundy Banarasi silk drifting through twilight—caught
            in a single fluid embrace of handwoven zari and contemporary Indian couture.
          </p>

          <div
            className={`mt-8 sm:mt-10 flex flex-wrap items-center gap-5 sm:gap-7 ${revealMotionClass} delay-300 ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <button
              type="button"
              onClick={onExploreCollections}
              className="group inline-flex min-h-[48px] items-center gap-3 bg-[#EDE4D8] px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#151112] transition-colors duration-200 hover:bg-[#B69A6A] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onReplayIntro}
              className="inline-flex min-h-[44px] items-center gap-2 border-b border-transparent pb-0.5 text-xs font-normal uppercase tracking-[0.22em] text-[#EDE4D8]/80 transition-colors duration-200 hover:border-[#B69A6A] hover:text-[#B69A6A] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Replay Opening Film</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Quiet Editorial Film Bar (Desktop) */}
      <div
        className={`absolute bottom-7 inset-x-0 z-10 hidden md:block ${revealMotionClass} delay-300 ${
          isRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 lg:px-12">
          <span className="text-[11px] tracking-[0.24em] uppercase text-[#EDE4D8]/55">
            Mumbai · New Delhi · Varanasi Looms
          </span>

          {!prefersReducedMotion && !videoFailed && (
            <div
              role="group"
              aria-label="Campaign film movements"
              className="flex items-center gap-6"
            >
              {FILM_CHAPTERS.map((chapter) => {
                const isActive = activeChapter === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => handleSelectChapter(chapter.id, chapter.seekSec)}
                    className={`relative pb-1 text-[11px] uppercase tracking-[0.22em] whitespace-nowrap transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A] ${
                      isActive
                        ? 'text-[#EDE4D8]'
                        : 'text-[#EDE4D8]/45 hover:text-[#EDE4D8]/80'
                    }`}
                  >
                    {chapter.label}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 bottom-0 h-px bg-[#B69A6A] transition-all duration-300 ${
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
