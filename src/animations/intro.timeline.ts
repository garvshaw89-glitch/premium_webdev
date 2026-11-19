import gsap from 'gsap';

export interface IntroTimelineCallbacks {
  onPhaseChange?: (phase: IntroPhase) => void;
  onRevealHomepage?: (instant?: boolean) => void;
  onComplete?: () => void;
}

export type IntroPhase =
  | 'darkness'
  | 'fabric'
  | 'craftsmanship'
  | 'wordmark'
  | 'signature'
  | 'transition'
  | 'complete';

export interface IntroTimelineOptions {
  isMobile: boolean;
  isTablet: boolean;
  callbacks?: IntroTimelineCallbacks;
}

/**
 * Builds the single master GSAP timeline for Scene 01 of NOIR®.
 * Choreographs:
 * - darkness      (0.0s – 0.95s): Obsidian stillness, subtle film grain, warm center bloom
 * - fabric        (0.95s – 2.55s): Man pulling the flowing red-burgundy Banarasi silk saree
 * - craftsmanship (2.55s – 3.75s): Woman wearing the burgundy saree smoothly rotating into frame with warm gold light sweep
 * - wordmark      (3.75s – 4.45s): Centered NOIR® wordmark revealed through clipped letter masks
 * - signature     (4.35s – 5.45s): ATELIER OF MODERN INDIA + Tradition, Reimagined.
 * - transition    (5.45s – 7.15s): Sweeping burgundy silk veil dissolves directly into live Entry Hero film
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

  // Initial compositor-safe states (no layout thrashing)
  gsap.set(q('[data-intro="shell"]'), { opacity: 1 });
  gsap.set(q('[data-intro="grain"]'), { opacity: 0 });
  gsap.set(q('[data-intro="center-bloom"]'), { opacity: 0, scale: 0.3 });
  gsap.set(q('[data-intro="center-core"]'), { opacity: 0, scale: 0.4 });
  gsap.set(q('[data-intro="skip-btn"]'), { opacity: 0, y: -6 });

  // Beat 02: Saree pull reveals right-to-left following the flow of the red-burgundy silk
  gsap.set(q('[data-intro="fabric-layer"]'), {
    opacity: 0,
    scale: isMobile ? 1.05 : 1.07,
    xPercent: isMobile ? 0 : 2.5,
    clipPath: isMobile ? 'inset(18% 0% 18% 0%)' : 'inset(0% 0% 0% 78%)',
  });
  gsap.set(q('[data-intro="directional-light"]'), { opacity: 0 });

  // Beat 03: Woman wearing the burgundy saree gracefully rotating smoothly into frame
  gsap.set(q('[data-intro="craft-layer"]'), {
    opacity: 0,
    scale: isMobile ? 1.04 : 1.06,
    xPercent: isMobile ? 0 : -2,
    clipPath: isMobile ? 'inset(8% 0% 8% 0%)' : 'inset(0% 18% 0% 0%)',
  });
  gsap.set(q('[data-intro="craft-light-sweep"]'), {
    xPercent: -120,
    opacity: 0,
  });

  gsap.set(q('[data-intro="wordmark-group"]'), { opacity: 1, y: 0 });
  gsap.set(q('[data-intro="wordmark-char"]'), { yPercent: 115, opacity: 0 });
  gsap.set(q('[data-intro="wordmark-reg"]'), { opacity: 0, y: 6 });
  gsap.set(q('[data-intro="gold-rule"]'), { scaleX: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(q('[data-intro="descriptor"]'), { yPercent: 110, opacity: 0 });
  gsap.set(q('[data-intro="tagline"]'), { yPercent: 110, opacity: 0 });

  gsap.set(q('[data-intro="transition-silk"]'), {
    opacity: 0,
    scale: 1.08,
    clipPath: 'inset(0% 100% 0% 0%)',
  });

  const targetGrainOpacity = isMobile ? 0.035 : isTablet ? 0.05 : 0.07;

  // =========================================================================
  // TIMELINE 01 — THE DARKNESS (0.0s – 0.95s)
  // =========================================================================
  tl.addLabel('darkness', 0);
  tl.call(() => callbacks?.onPhaseChange?.('darkness'), undefined, 'darkness');

  tl.to(
    q('[data-intro="grain"]'),
    {
      opacity: targetGrainOpacity,
      duration: 0.7,
      ease: 'power1.out',
    },
    'darkness+=0.05'
  )
    .to(
      q('[data-intro="center-bloom"]'),
      {
        opacity: 0.9,
        scale: 1,
        duration: 0.85,
        ease: 'power2.out',
      },
      'darkness+=0.1'
    )
    .to(
      q('[data-intro="center-core"]'),
      {
        opacity: 0.85,
        scale: 1,
        duration: 0.65,
        ease: 'power2.out',
      },
      'darkness+=0.16'
    )
    .to(
      q('[data-intro="skip-btn"]'),
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      },
      'darkness+=0.38'
    );

  // =========================================================================
  // TIMELINE 02 — THE SAREE PULL (0.95s – 2.55s)
  // Man in obsidian tailoring pulls the flowing deep red-burgundy silk saree
  // =========================================================================
  tl.addLabel('fabric', 0.95);
  tl.call(() => callbacks?.onPhaseChange?.('fabric'), undefined, 'fabric');

  tl.to(
    q('[data-intro="fabric-layer"]'),
    {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      xPercent: 0,
      scale: 1.01,
      duration: 1.5,
      ease: 'power3.inOut',
    },
    'fabric'
  )
    .to(
      q('[data-intro="directional-light"]'),
      {
        opacity: 0.75,
        duration: 1.15,
        ease: 'power2.out',
      },
      'fabric+=0.2'
    )
    .to(
      q('[data-intro="center-core"]'),
      {
        opacity: 0,
        scale: 1.6,
        duration: 0.55,
        ease: 'power2.inOut',
      },
      'fabric+=0.12'
    )
    .to(
      q('[data-intro="center-bloom"]'),
      {
        opacity: 0.22,
        scale: 1.25,
        duration: 0.95,
        ease: 'power2.out',
      },
      'fabric+=0.2'
    );

  // =========================================================================
  // TIMELINE 03 — GRACEFUL ROTATION & ZARI SHEEN (2.55s – 3.75s)
  // Woman wearing the burgundy saree smoothly turns into the illuminated arch
  // =========================================================================
  tl.addLabel('craftsmanship', 2.55);
  tl.call(() => callbacks?.onPhaseChange?.('craftsmanship'), undefined, 'craftsmanship');

  tl.to(
    q('[data-intro="craft-layer"]'),
    {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      xPercent: 0,
      scale: 1.0,
      duration: 0.95,
      ease: 'power2.inOut',
    },
    'craftsmanship'
  )
    .to(
      q('[data-intro="craft-light-sweep"]'),
      {
        xPercent: 120,
        opacity: isMobile ? 0.45 : 0.65,
        duration: 1.1,
        ease: 'power1.inOut',
      },
      'craftsmanship+=0.1'
    )
    .to(
      q('[data-intro="fabric-layer"]'),
      {
        opacity: 0,
        duration: 0.85,
        ease: 'power2.inOut',
      },
      'craftsmanship+=0.18'
    )
    // Softly lower luminance of the rotating saree frame so NOIR® wordmark commands center
    .to(
      q('[data-intro="craft-layer"]'),
      {
        opacity: 0.48,
        scale: 1.03,
        duration: 0.65,
        ease: 'power2.inOut',
      },
      'craftsmanship+=1.05'
    );

  // =========================================================================
  // TIMELINE 04 — THE NOIR® WORDMARK & SIGNATURE (3.75s – 5.45s)
  // =========================================================================
  tl.addLabel('wordmark', 3.75);
  tl.call(() => callbacks?.onPhaseChange?.('wordmark'), undefined, 'wordmark');

  tl.to(
    q('[data-intro="center-bloom"]'),
    {
      opacity: 0.36,
      scale: 1.08,
      duration: 0.8,
      ease: 'power2.out',
    },
    'wordmark'
  )
    .to(
      q('[data-intro="wordmark-char"]'),
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.78,
        stagger: 0.068,
        ease: 'power3.out',
      },
      'wordmark+=0.05'
    )
    .to(
      q('[data-intro="wordmark-reg"]'),
      {
        opacity: 0.82,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      },
      'wordmark+=0.45'
    )
    .to(
      q('[data-intro="gold-rule"]'),
      {
        scaleX: 1,
        opacity: 0.7,
        duration: 0.62,
        ease: 'power2.out',
      },
      'wordmark+=0.38'
    );

  tl.addLabel('signature', 4.35);
  tl.call(() => callbacks?.onPhaseChange?.('signature'), undefined, 'signature');

  tl.to(
    q('[data-intro="descriptor"]'),
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.56,
      ease: 'power3.out',
    },
    'signature'
  ).to(
    q('[data-intro="tagline"]'),
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
    },
    'signature+=0.24'
  );

  // =========================================================================
  // TIMELINE 05 — SEAMLESS TRANSITION INTO ENTRY HERO FILM (5.45s – 7.15s)
  // =========================================================================
  tl.addLabel('transition', 5.45);
  tl.call(() => callbacks?.onPhaseChange?.('transition'), undefined, 'transition');

  tl.to(
    q('[data-intro="skip-btn"]'),
    {
      opacity: 0,
      duration: 0.28,
      ease: 'power2.in',
    },
    'transition'
  )
    .to(
      q('[data-intro="wordmark-group"]'),
      {
        opacity: 0,
        y: -10,
        duration: 0.48,
        ease: 'power2.inOut',
      },
      'transition+=0.05'
    )
    // Flowing deep burgundy Banarasi silk glides across the frame from left to right
    .to(
      q('[data-intro="transition-silk"]'),
      {
        opacity: 0.94,
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1.0,
        duration: 0.72,
        ease: 'power3.inOut',
      },
      'transition+=0.06'
    )
    // Reveal the pre-mounted live Entry Hero right as the silk curtain opens
    .call(
      () => {
        callbacks?.onRevealHomepage?.(false);
      },
      undefined,
      'transition+=0.72'
    )
    .to(
      q('[data-intro="shell"]'),
      {
        opacity: 0,
        duration: 0.92,
        ease: 'power2.inOut',
      },
      'transition+=0.76'
    );

  return tl;
}

/**
 * Reduced-motion timeline: honors prefers-reduced-motion by showing a serene
 * static brand reveal before dissolving cleanly into the entry page.
 */
export function createReducedMotionIntroTimeline(
  container: HTMLElement,
  callbacks?: IntroTimelineCallbacks
): gsap.core.Timeline {
  const q = gsap.utils.selector(container);

  gsap.set(q('[data-intro="shell"]'), { opacity: 1 });
  gsap.set(q('[data-intro="fabric-layer"]'), { opacity: 0, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
  gsap.set(q('[data-intro="craft-layer"]'), { opacity: 0.35, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
  gsap.set(q('[data-intro="transition-silk"]'), { opacity: 0 });
  gsap.set(q('[data-intro="grain"]'), { opacity: 0 });
  gsap.set(q('[data-intro="center-bloom"]'), { opacity: 0.32, scale: 1 });
  gsap.set(q('[data-intro="center-core"]'), { opacity: 0 });
  gsap.set(q('[data-intro="skip-btn"]'), { opacity: 1, y: 0 });
  gsap.set(q('[data-intro="wordmark-group"]'), { opacity: 0, y: 0 });
  gsap.set(q('[data-intro="wordmark-char"]'), { yPercent: 0, opacity: 1 });
  gsap.set(q('[data-intro="wordmark-reg"]'), { opacity: 0.8, y: 0 });
  gsap.set(q('[data-intro="gold-rule"]'), { scaleX: 1, opacity: 0.7 });
  gsap.set(q('[data-intro="descriptor"]'), { yPercent: 0, opacity: 1 });
  gsap.set(q('[data-intro="tagline"]'), { yPercent: 0, opacity: 1 });

  const tl = gsap.timeline({
    onComplete: () => {
      callbacks?.onPhaseChange?.('complete');
      callbacks?.onComplete?.();
    },
  });

  tl.addLabel('darkness', 0)
    .addLabel('fabric', 0.05)
    .addLabel('craftsmanship', 0.1)
    .addLabel('wordmark', 0.12)
    .to(q('[data-intro="wordmark-group"]'), { opacity: 1, duration: 0.35, ease: 'power1.out' }, 'wordmark')
    .addLabel('signature', 0.45)
    .addLabel('transition', 1.15)
    .call(() => callbacks?.onRevealHomepage?.(true), undefined, 'transition')
    .to(q('[data-intro="shell"]'), { opacity: 0, duration: 0.4, ease: 'power1.out' }, 'transition+=0.05');

  return tl;
}
