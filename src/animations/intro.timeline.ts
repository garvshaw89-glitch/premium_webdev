import gsap from 'gsap';

export type IntroPhase =
  | 'darkness'
  | 'fabricReveal'
  | 'craftsmanship'
  | 'wordmarkReveal'
  | 'signatureReveal'
  | 'homepageTransition'
  | 'complete';

export interface IntroTimelineCallbacks {
  onPhaseChange?: (phase: IntroPhase) => void;
  onRevealHomepage?: (instant?: boolean) => void;
  onComplete?: () => void;
}

export interface IntroTimelineOptions {
  isMobile: boolean;
  isTablet: boolean;
  callbacks?: IntroTimelineCallbacks;
}

/**
 * Single Master GSAP Timeline for NOIR® — Atelier of Modern India.
 * Orchestrates one continuous 8.2-second luxury fashion campaign film across
 * six explicit, tightly connected labels:
 *
 * - darkness           (0.0s – 1.0s): Obsidian stage, film grain, narrow center light & emerging burgundy silk (scale 1.08 -> 1.0)
 * - fabricReveal       (1.0s – 2.5s): Dual-layer parallax burgundy silk motion with directional highlights & clip-path uncover
 * - craftsmanship      (2.5s – 4.0s): Macro Indian antique-gold zardozi embroidery, slow camera pan & soft focus-to-sharp reveal
 * - wordmarkReveal     (4.0s – 5.0s): Deep burgundy stage, backlit masked NOIR® letter reveal & subtle antique-gold sheen sweep
 * - signatureReveal    (4.9s – 5.8s): Hairline rule, ATELIER OF MODERN INDIA, and Tradition, Reimagined.
 * - homepageTransition (5.8s – 8.2s): Burgundy silk expanding from center as full-screen veil dissolving into live Entry Hero film
 */
export function createIntroTimeline(
  container: HTMLElement,
  options: IntroTimelineOptions
): gsap.core.Timeline {
  const { isMobile, isTablet, callbacks } = options;
  const q = gsap.utils.selector(container);

  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
    },
    onComplete: () => {
      callbacks?.onPhaseChange?.('complete');
      callbacks?.onComplete?.();
    },
  });

  // -------------------------------------------------------------------------
  // Initial compositor-only states (zero layout shift / reflow)
  // -------------------------------------------------------------------------
  gsap.set(q('[data-intro="shell"]'), { opacity: 1 });
  gsap.set(q('[data-intro="bg-stage"]'), { opacity: 0 });
  gsap.set(q('[data-intro="grain"]'), { opacity: 0 });
  gsap.set(q('[data-intro="center-slit"]'), { opacity: 0, scaleY: 0.25, scaleX: 0.5 });
  gsap.set(q('[data-intro="center-bloom"]'), { opacity: 0, scale: 0.35 });
  gsap.set(q('[data-intro="controls"]'), { opacity: 0, y: -6 });

  // Scene 01 & 02: Floating burgundy silk + secondary parallax depth layer
  gsap.set(q('[data-intro="fabric-primary"]'), {
    opacity: 0,
    scale: 1.08,
    xPercent: 0,
    yPercent: 1.4,
    clipPath: isMobile ? 'inset(22% 8% 22% 8%)' : 'inset(24% 18% 24% 18%)',
  });
  gsap.set(q('[data-intro="fabric-depth"]'), {
    opacity: 0,
    scale: 1.15,
    xPercent: isMobile ? 0 : -4,
    yPercent: isMobile ? 2 : 0,
  });
  gsap.set(q('[data-intro="directional-light"]'), { opacity: 0, xPercent: -10 });

  // Scene 03: Woman walking gracefully to catch the floating burgundy saree
  gsap.set(q('[data-intro="craft-layer"]'), {
    opacity: 0,
    scale: 1.09,
    xPercent: isMobile ? 0 : -2.6,
    clipPath: isMobile ? 'inset(14% 0% 14% 0%)' : 'inset(0% 100% 0% 0%)',
    filter: isMobile ? 'none' : 'blur(6px)',
  });
  gsap.set(q('[data-intro="craft-light-sweep"]'), {
    xPercent: -120,
    opacity: 0,
  });

  // Scene 04: Deep burgundy wordmark stage + backlit NOIR® & subtle gold reflection
  gsap.set(q('[data-intro="burgundy-stage"]'), { opacity: 0 });
  gsap.set(q('[data-intro="wordmark-backlight"]'), { opacity: 0, scale: 0.65 });
  gsap.set(q('[data-intro="wordmark-group"]'), { opacity: 1, y: 0 });
  gsap.set(q('[data-intro="wordmark-char"]'), { yPercent: 112, opacity: 0 });
  gsap.set(q('[data-intro="wordmark-reg"]'), { opacity: 0, y: 6 });
  gsap.set(q('[data-intro="wordmark-sheen"]'), {
    opacity: 0,
    backgroundPosition: '125% 0%',
  });
  gsap.set(q('[data-intro="gold-rule"]'), { scaleX: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(q('[data-intro="descriptor"]'), { yPercent: 110, opacity: 0 });
  gsap.set(q('[data-intro="tagline"]'), { yPercent: 110, opacity: 0 });

  // Scene 05: Center-expanding burgundy silk full-screen mask
  gsap.set(q('[data-intro="transition-silk"]'), {
    opacity: 0,
    scale: 1.12,
    clipPath: 'inset(46% 42% 46% 42%)',
  });

  const targetGrainOpacity = isMobile ? 0.032 : isTablet ? 0.05 : 0.072;

  // =========================================================================
  // SCENE 01 — THE DARKNESS (0.0s – 1.0s)
  // =========================================================================
  tl.addLabel('darkness', 0);
  tl.call(() => callbacks?.onPhaseChange?.('darkness'), undefined, 'darkness');

  tl.to(
    q('[data-intro="bg-stage"]'),
    {
      opacity: 1,
      duration: 0.5,
      ease: 'power1.out',
    },
    'darkness'
  )
    .to(
      q('[data-intro="grain"]'),
      {
        opacity: targetGrainOpacity,
        duration: 0.75,
        ease: 'power1.out',
      },
      'darkness+=0.06'
    )
    // Narrow warm center light aperture opens softly
    .to(
      q('[data-intro="center-slit"]'),
      {
        opacity: 0.88,
        scaleY: 1,
        scaleX: 1,
        duration: 0.85,
        ease: 'power2.out',
      },
      'darkness+=0.1'
    )
    .to(
      q('[data-intro="center-bloom"]'),
      {
        opacity: 0.72,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
      },
      'darkness+=0.16'
    )
    // Floating red-burgundy saree begins drifting into view from darkness (scale 1.08 -> 1.04)
    .to(
      q('[data-intro="fabric-primary"]'),
      {
        opacity: 0.68,
        scale: 1.04,
        yPercent: 0.2,
        clipPath: isMobile ? 'inset(10% 3% 10% 3%)' : 'inset(10% 8% 10% 8%)',
        duration: 0.72,
        ease: 'power2.out',
      },
      'darkness+=0.34'
    )
    .to(
      q('[data-intro="controls"]'),
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out',
      },
      'darkness+=0.42'
    );

  // =========================================================================
  // SCENE 02 — FLOATING BURGUNDY SAREE REVEAL (1.0s – 2.5s)
  // Full cinematic floating saree + second silk parallax depth layer
  // =========================================================================
  tl.addLabel('fabricReveal', 1.0);
  tl.call(() => callbacks?.onPhaseChange?.('fabricReveal'), undefined, 'fabricReveal');

  tl.to(
    q('[data-intro="fabric-primary"]'),
    {
      opacity: 0.98,
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: 1.0,
      xPercent: isMobile ? 0 : 1.8,
      yPercent: -1.1,
      duration: 1.45,
      ease: 'power2.inOut',
    },
    'fabricReveal'
  )
    .to(
      q('[data-intro="center-slit"]'),
      {
        opacity: 0,
        scaleX: 1.8,
        duration: 0.75,
        ease: 'power2.inOut',
      },
      'fabricReveal+=0.08'
    )
    .to(
      q('[data-intro="directional-light"]'),
      {
        opacity: 0.85,
        xPercent: 8,
        duration: 1.4,
        ease: 'sine.inOut',
      },
      'fabricReveal+=0.1'
    );

  // Second silk depth layer at distinct speed for desktop & tablet
  if (!isMobile) {
    tl.to(
      q('[data-intro="fabric-depth"]'),
      {
        opacity: isTablet ? 0.24 : 0.34,
        scale: 1.04,
        xPercent: 3.2,
        duration: 1.55,
        ease: 'sine.inOut',
      },
      'fabricReveal+=0.12'
    );
  }

  // =========================================================================
  // SCENE 03 — THE CRAFTSMANSHIP (2.5s – 4.0s)
  // Clip-path unveil into macro Indian gold zardozi, slow pan, soft focus-to-sharp
  // =========================================================================
  tl.addLabel('craftsmanship', 2.5);
  tl.call(() => callbacks?.onPhaseChange?.('craftsmanship'), undefined, 'craftsmanship');

  tl.to(
    q('[data-intro="craft-layer"]'),
    {
      opacity: 0.96,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.88,
      ease: 'power3.inOut',
    },
    'craftsmanship'
  )
    // Slow continuous camera glide across fine gold threads
    .to(
      q('[data-intro="craft-layer"]'),
      {
        xPercent: isMobile ? 0 : 2.2,
        scale: 1.02,
        duration: 1.55,
        ease: 'sine.inOut',
      },
      'craftsmanship'
    );

  // Soft optical focus-to-sharp rack transition on desktop/tablet
  if (!isMobile) {
    tl.to(
      q('[data-intro="craft-layer"]'),
      {
        filter: 'blur(0px)',
        duration: 0.85,
        ease: 'power2.out',
      },
      'craftsmanship+=0.18'
    );
  }

  tl.to(
    q('[data-intro="craft-light-sweep"]'),
    {
      xPercent: 120,
      opacity: isMobile ? 0.42 : 0.68,
      duration: 1.25,
      ease: 'power1.inOut',
    },
    'craftsmanship+=0.15'
  )
    // Quietly dim background silk layers beneath craftsmanship
    .to(
      q('[data-intro="fabric-depth"]'),
      {
        opacity: 0,
        duration: 0.65,
        ease: 'power2.inOut',
      },
      'craftsmanship+=0.2'
    )
    // Smoothly melt craftsmanship into the deep dark burgundy environment for Scene 04
    .to(
      q('[data-intro="burgundy-stage"]'),
      {
        opacity: 1,
        duration: 0.72,
        ease: 'power2.inOut',
      },
      'craftsmanship+=1.02'
    )
    .to(
      q('[data-intro="craft-layer"]'),
      {
        opacity: 0,
        duration: 0.68,
        ease: 'power2.inOut',
      },
      'craftsmanship+=1.05'
    )
    .to(
      q('[data-intro="fabric-primary"]'),
      {
        opacity: 0.28,
        duration: 0.65,
        ease: 'power2.inOut',
      },
      'craftsmanship+=1.05'
    );

  // =========================================================================
  // SCENE 04 — THE NOIR WORDMARK & SIGNATURE (4.0s – 5.8s)
  // Deep burgundy stage, backlit masked letters, subtle antique-gold sheen
  // =========================================================================
  tl.addLabel('wordmarkReveal', 4.0);
  tl.call(() => callbacks?.onPhaseChange?.('wordmarkReveal'), undefined, 'wordmarkReveal');

  tl.to(
    q('[data-intro="wordmark-backlight"]'),
    {
      opacity: 0.92,
      scale: 1.04,
      duration: 0.95,
      ease: 'power2.out',
    },
    'wordmarkReveal'
  )
    .to(
      q('[data-intro="wordmark-char"]'),
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.82,
        stagger: 0.075,
        ease: 'power3.out',
      },
      'wordmarkReveal+=0.08'
    )
    .to(
      q('[data-intro="wordmark-reg"]'),
      {
        opacity: 0.85,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      },
      'wordmarkReveal+=0.5'
    )
    // Subtle antique-gold reflection sweep passing across NOIR® lettering once
    .to(
      q('[data-intro="wordmark-sheen"]'),
      {
        opacity: 0.82,
        duration: 0.22,
        ease: 'power1.out',
      },
      'wordmarkReveal+=0.58'
    )
    .to(
      q('[data-intro="wordmark-sheen"]'),
      {
        backgroundPosition: '-30% 0%',
        duration: 1.05,
        ease: 'power2.inOut',
      },
      'wordmarkReveal+=0.58'
    )
    .to(
      q('[data-intro="wordmark-sheen"]'),
      {
        opacity: 0,
        duration: 0.35,
        ease: 'power1.out',
      },
      'wordmarkReveal+=1.32'
    );

  // Brand Signature (Descriptor + Tagline)
  tl.addLabel('signatureReveal', 4.88);
  tl.call(() => callbacks?.onPhaseChange?.('signatureReveal'), undefined, 'signatureReveal');

  tl.to(
    q('[data-intro="gold-rule"]'),
    {
      scaleX: 1,
      opacity: 0.72,
      duration: 0.58,
      ease: 'power2.out',
    },
    'signatureReveal'
  )
    .to(
      q('[data-intro="descriptor"]'),
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.58,
        ease: 'power3.out',
      },
      'signatureReveal+=0.14'
    )
    .to(
      q('[data-intro="tagline"]'),
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.62,
        ease: 'power3.out',
      },
      'signatureReveal+=0.38'
    );

  // =========================================================================
  // SCENE 05 — THE FINAL CINEMATIC TRANSITION (5.95s – 8.2s)
  // Burgundy silk expands from center as full-screen mask -> live Entry Hero
  // =========================================================================
  tl.addLabel('homepageTransition', 5.95);
  tl.call(() => callbacks?.onPhaseChange?.('homepageTransition'), undefined, 'homepageTransition');

  tl.to(
    q('[data-intro="controls"]'),
    {
      opacity: 0,
      duration: 0.32,
      ease: 'power2.in',
    },
    'homepageTransition'
  )
    .to(
      q('[data-intro="wordmark-group"]'),
      {
        opacity: 0,
        y: -10,
        duration: 0.58,
        ease: 'power2.inOut',
      },
      'homepageTransition+=0.08'
    )
    // Burgundy silk expands organically outward from center to cover full viewport
    .to(
      q('[data-intro="transition-silk"]'),
      {
        opacity: 0.98,
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1.0,
        duration: 0.92,
        ease: 'power3.inOut',
      },
      'homepageTransition+=0.1'
    )
    // Trigger homepage navigation & hero typography reveal right as silk opens into live film
    .call(
      () => {
        callbacks?.onRevealHomepage?.(false);
      },
      undefined,
      'homepageTransition+=0.98'
    )
    // Seamless dissolve of the entire intro shell into the live, pre-mounted Entry Hero film
    .to(
      q('[data-intro="shell"]'),
      {
        opacity: 0,
        duration: 1.22,
        ease: 'power2.inOut',
      },
      'homepageTransition+=1.02'
    );

  return tl;
}

/**
 * Accessible reduced-motion timeline: honors prefers-reduced-motion by bypassing
 * multi-scene camera movement and presenting a serene, brief brand lockup reveal
 * before transitioning cleanly to the homepage.
 */
export function createReducedMotionIntroTimeline(
  container: HTMLElement,
  callbacks?: IntroTimelineCallbacks
): gsap.core.Timeline {
  const q = gsap.utils.selector(container);

  gsap.set(q('[data-intro="shell"]'), { opacity: 1 });
  gsap.set(q('[data-intro="bg-stage"]'), { opacity: 1 });
  gsap.set(q('[data-intro="burgundy-stage"]'), { opacity: 1 });
  gsap.set(q('[data-intro="fabric-primary"]'), {
    opacity: 0.24,
    clipPath: 'inset(0% 0% 0% 0%)',
    scale: 1,
  });
  gsap.set(q('[data-intro="fabric-depth"]'), { opacity: 0 });
  gsap.set(q('[data-intro="craft-layer"]'), { opacity: 0, filter: 'none' });
  gsap.set(q('[data-intro="transition-silk"]'), { opacity: 0 });
  gsap.set(q('[data-intro="grain"]'), { opacity: 0 });
  gsap.set(q('[data-intro="center-slit"]'), { opacity: 0 });
  gsap.set(q('[data-intro="center-bloom"]'), { opacity: 0 });
  gsap.set(q('[data-intro="wordmark-backlight"]'), { opacity: 0.72, scale: 1 });
  gsap.set(q('[data-intro="controls"]'), { opacity: 1, y: 0 });
  gsap.set(q('[data-intro="wordmark-group"]'), { opacity: 0, y: 0 });
  gsap.set(q('[data-intro="wordmark-char"]'), { yPercent: 0, opacity: 1 });
  gsap.set(q('[data-intro="wordmark-reg"]'), { opacity: 0.85, y: 0 });
  gsap.set(q('[data-intro="wordmark-sheen"]'), { opacity: 0 });
  gsap.set(q('[data-intro="gold-rule"]'), { scaleX: 1, opacity: 0.72 });
  gsap.set(q('[data-intro="descriptor"]'), { yPercent: 0, opacity: 1 });
  gsap.set(q('[data-intro="tagline"]'), { yPercent: 0, opacity: 1 });

  const tl = gsap.timeline({
    onComplete: () => {
      callbacks?.onPhaseChange?.('complete');
      callbacks?.onComplete?.();
    },
  });

  tl.addLabel('darkness', 0)
    .addLabel('fabricReveal', 0.05)
    .addLabel('craftsmanship', 0.1)
    .addLabel('wordmarkReveal', 0.12)
    .to(
      q('[data-intro="wordmark-group"]'),
      { opacity: 1, duration: 0.38, ease: 'power1.out' },
      'wordmarkReveal'
    )
    .addLabel('signatureReveal', 0.48)
    .addLabel('homepageTransition', 1.25)
    .call(() => callbacks?.onRevealHomepage?.(true), undefined, 'homepageTransition')
    .to(
      q('[data-intro="shell"]'),
      { opacity: 0, duration: 0.42, ease: 'power1.out' },
      'homepageTransition+=0.05'
    );

  return tl;
}
