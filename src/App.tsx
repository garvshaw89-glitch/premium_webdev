import { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  IntroExperience,
  hasCompletedNoirIntro,
  resetNoirIntroSession,
} from './components/intro/IntroExperience';
import { NoirHeader } from './components/layout/NoirHeader';
import { HomeHero } from './components/home/HomeHero';
import { FeaturedCollections } from './components/home/FeaturedCollections';
import { AtelierStory } from './components/home/AtelierStory';
import { AppointmentModal } from './components/home/AppointmentModal';
import { NOIR_INTRO_MEDIA, type NoirRoute } from './data/noirMedia';

const VALID_ROUTES: NoirRoute[] = ['home', 'collections', 'atelier', 'craft', 'campaign'];

function readRouteFromHash(): NoirRoute {
  if (typeof window === 'undefined') return 'home';
  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase() as NoirRoute;
  return VALID_ROUTES.includes(raw) ? raw : 'home';
}

export default function App() {
  const [route, setRoute] = useState<NoirRoute>(() => readRouteFromHash());

  // Determine intro eligibility once on initial mount using sessionStorage
  const [showIntro, setShowIntro] = useState<boolean>(() => !hasCompletedNoirIntro());
  const [forceReplay, setForceReplay] = useState<boolean>(false);
  const [introRunId, setIntroRunId] = useState<number>(1);

  // Controls homepage hero + navigation entrance choreography
  const [homepageRevealed, setHomepageRevealed] = useState<boolean>(() => hasCompletedNoirIntro());
  const [instantReveal, setInstantReveal] = useState<boolean>(() => hasCompletedNoirIntro());

  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentNote, setAppointmentNote] = useState('');

  useEffect(() => {
    const onHashChange = () => {
      setRoute(readRouteFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Internal route navigation NEVER replays the intro
  const handleNavigate = useCallback((nextRoute: NoirRoute) => {
    setRoute(nextRoute);
    const targetHash = nextRoute === 'home' ? '#/' : `#/${nextRoute}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRevealHomepage = useCallback((instant = false) => {
    setInstantReveal(instant);
    setHomepageRevealed(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setHomepageRevealed(true);
    setShowIntro(false);
    setForceReplay(false);
  }, []);

  const handleReplayIntro = useCallback(() => {
    resetNoirIntroSession();
    setRoute('home');
    if (window.location.hash !== '#/') {
      window.history.pushState(null, '', '#/');
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    setHomepageRevealed(false);
    setInstantReveal(false);
    setForceReplay(true);
    setIntroRunId((n) => n + 1);
    setShowIntro(true);
  }, []);

  const handleBookWithPiece = useCallback((pieceTitle: string) => {
    setAppointmentNote(`Private fitting inquiry: ${pieceTitle}`);
    setAppointmentOpen(true);
  }, []);

  const handleOpenGeneralAppointment = useCallback(() => {
    setAppointmentNote('');
    setAppointmentOpen(true);
  }, []);

  return (
    <div className="min-h-[100svh] w-full bg-[#151112] text-[#EDE4D8] overflow-x-clip">
      {/* ===================================================================
          SCENE 01 — FULL-SCREEN CINEMATIC BRAND INTRODUCTION
          Unmounts cleanly once finished; never replays during route switches
         =================================================================== */}
      {showIntro && (
        <IntroExperience
          key={introRunId}
          forcePlay={forceReplay}
          onRevealHomepage={handleRevealHomepage}
          onComplete={handleIntroComplete}
        />
      )}

      {/* ===================================================================
          PERSISTENT 3-ZONE NAVIGATION HEADER
         =================================================================== */}
      <NoirHeader
        activeRoute={route}
        onNavigate={handleNavigate}
        onOpenAppointment={handleOpenGeneralAppointment}
        isRevealed={homepageRevealed}
        instantReveal={instantReveal}
      />

      {/* ===================================================================
          PRIMARY CONTENT VIEWS (Homepage Hero stays pre-mounted on home route)
         =================================================================== */}
      <main>
        {route === 'home' && (
          <>
            <HomeHero
              isRevealed={homepageRevealed}
              instantReveal={instantReveal}
              onExploreCollections={() => handleNavigate('collections')}
              onReplayIntro={handleReplayIntro}
            />
            <FeaturedCollections onBookPiece={handleBookWithPiece} />
            <AtelierStory onOpenAppointment={handleOpenGeneralAppointment} />
          </>
        )}

        {route === 'collections' && (
          <div className="pt-20 sm:pt-24">
            <FeaturedCollections onBookPiece={handleBookWithPiece} />
          </div>
        )}

        {route === 'atelier' && (
          <section className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pt-28 sm:pt-36 pb-24">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.28em] text-[#B69A6A]">
                Private Salons
              </p>
              <h1
                style={{ textWrap: 'balance' }}
                className="font-editorial mt-3 text-4xl sm:text-5xl lg:text-6xl font-light text-[#EDE4D8]"
              >
                The Mumbai &amp; New Delhi Ateliers
              </h1>
              <p className="mt-5 text-sm sm:text-base font-light leading-relaxed text-[#EDE4D8]/75">
                Designed as quiet sanctuaries of stone, darkened teak, and filtered daylight,
                our private salons welcome clients by appointment for bespoke menswear tailoring,
                bridal drapes, and archival textile commissions.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#EDE4D8]/12 pt-12">
              <div className="border border-[#EDE4D8]/10 bg-[#1A1416] p-8 sm:p-10">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#B69A6A]">
                  Flagship Atelier
                </p>
                <h2 className="font-editorial mt-3 text-3xl font-light text-[#EDE4D8]">
                  Mumbai · Kala Ghoda
                </h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-[#EDE4D8]/70">
                  14 Rope Walk Lane, Heritage Precinct, Fort, Mumbai 400001
                </p>
                <p className="mt-2 text-xs tracking-[0.16em] text-[#EDE4D8]/50">
                  Tuesday – Sunday · 11:00 to 19:30 IST
                </p>
                <button
                  type="button"
                  onClick={handleOpenGeneralAppointment}
                  className="mt-8 inline-flex min-h-[44px] items-center border border-[#B69A6A]/60 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[#EDE4D8] hover:bg-[#641F2B] hover:border-[#641F2B] transition-colors cursor-pointer"
                >
                  Book Mumbai Salon
                </button>
              </div>

              <div className="border border-[#EDE4D8]/10 bg-[#1A1416] p-8 sm:p-10">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#B69A6A]">
                  Heritage Salon
                </p>
                <h2 className="font-editorial mt-3 text-3xl font-light text-[#EDE4D8]">
                  New Delhi · Mehrauli
                </h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-[#EDE4D8]/70">
                  One Style Mile Courtyard, Kalka Das Marg, Mehrauli, New Delhi 110030
                </p>
                <p className="mt-2 text-xs tracking-[0.16em] text-[#EDE4D8]/50">
                  By Private Appointment Only
                </p>
                <button
                  type="button"
                  onClick={handleOpenGeneralAppointment}
                  className="mt-8 inline-flex min-h-[44px] items-center border border-[#B69A6A]/60 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[#EDE4D8] hover:bg-[#641F2B] hover:border-[#641F2B] transition-colors cursor-pointer"
                >
                  Book Delhi Salon
                </button>
              </div>
            </div>
          </section>
        )}

        {route === 'craft' && (
          <div className="pt-20 sm:pt-24">
            <AtelierStory onOpenAppointment={handleOpenGeneralAppointment} />
          </div>
        )}

        {route === 'campaign' && (
          <section className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pt-28 sm:pt-36 pb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-[#B69A6A]">
                  Autumn / Winter Film · Scene 01
                </p>
                <h1
                  style={{ textWrap: 'balance' }}
                  className="font-editorial mt-3 text-4xl sm:text-5xl lg:text-6xl font-light text-[#EDE4D8]"
                >
                  Tradition, Reimagined.
                </h1>
                <p className="mt-4 text-sm sm:text-base font-light leading-relaxed text-[#EDE4D8]/75">
                  Filmed in twilight sandstone colonnades and obsidian studio chiaroscuro,
                  Scene 01 traces the awakening of deep burgundy Banarasi silk and antique gold
                  zardozi into modern Indian couture.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReplayIntro}
                className="inline-flex min-h-[46px] items-center gap-2.5 bg-[#641F2B] px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#EDE4D8] hover:bg-[#7A2735] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Replay Opening Film</span>
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <figure className="border border-[#EDE4D8]/10 bg-[#1A1416] overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={NOIR_INTRO_MEDIA.sareePullPoster}
                    alt="Man in obsidian bandhgala pulling deep red-burgundy Banarasi silk saree"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#B69A6A]">
                    01 · The Pull
                  </p>
                  <p className="mt-1.5 text-sm font-light text-[#EDE4D8]/75">
                    Obsidian raw silk tailoring drawing six yards of red-burgundy Banarasi silk across darkness.
                  </p>
                </figcaption>
              </figure>

              <figure className="border border-[#EDE4D8]/10 bg-[#1A1416] overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={NOIR_INTRO_MEDIA.womanRotatePoster}
                    alt="Woman wearing deep red-burgundy silk saree turning gracefully in slow motion"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#B69A6A]">
                    02 · The Turn
                  </p>
                  <p className="mt-1.5 text-sm font-light text-[#EDE4D8]/75">
                    A fluid slow-motion rotation catching antique gold zari in warm chiaroscuro light.
                  </p>
                </figcaption>
              </figure>

              <figure className="border border-[#EDE4D8]/10 bg-[#1A1416] overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={NOIR_INTRO_MEDIA.heroDesktopPoster}
                    alt="NOIR sandstone colonnade couture arrival"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#B69A6A]">
                    03 · The Arrival
                  </p>
                  <p className="mt-1.5 text-sm font-light text-[#EDE4D8]/75">
                    The draped crimson-burgundy pallu resting between heritage tailoring and modern silhouette.
                  </p>
                </figcaption>
              </figure>
            </div>
          </section>
        )}
      </main>

      {/* ===================================================================
          QUIET EDITORIAL FOOTER
         =================================================================== */}
      <footer className="border-t border-[#EDE4D8]/10 bg-[#151112]">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-5 sm:px-8 lg:px-12 py-10">
          <div>
            <p className="font-editorial text-xl font-light tracking-[0.26em] text-[#EDE4D8]">
              NOIR<sup className="font-sans-noir text-[9px] text-[#B69A6A] ml-0.5">®</sup>
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[#EDE4D8]/50">
              Atelier of Modern India · Tradition, Reimagined.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#EDE4D8]/60">
            <button
              type="button"
              onClick={handleReplayIntro}
              className="uppercase tracking-[0.18em] text-[#B69A6A] hover:text-[#EDE4D8] transition-colors cursor-pointer"
            >
              Replay Opening Film
            </button>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} NOIR Atelier</span>
          </div>
        </div>
      </footer>

      <AppointmentModal
        isOpen={appointmentOpen}
        initialNote={appointmentNote}
        onClose={() => setAppointmentOpen(false)}
      />
    </div>
  );
}
