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
 * Designed to run inside a scoped gsap.context(fn, containerRef) so React Strict Mode
 * and unmount cleanup safely revert all inline styles and tweens.
 *
 * Explicit timeline labels:
 * - darkness      (0.0s – 1.0s)
 * - fabric        (1.0s – 2.5s)
 * - craftsmanship (2.5s – 3.5s)
 * - wordmark      (3.5s – 4.2s)
 * - signature     (4.1s – 5.2s)
 * - transition    (5.2s – 6.9s)
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

  gsap.set(q('[data-intro="fabric-layer"]'), {
    opacity: 0,
    scale: isMobile ? 1.06 : 1.1,
    clipPath: isMobile ? 'inset(32% 10% 32% 10%)' : 'inset(36% 24% 36% 24%)',
  });
  gsap.set(q('[data-intro="directional-light"]'), { opacity: 0 });

  gsap.set(q('[data-intro="craft-layer"]'), {
    opacity: 0,
    scale: 1.07,
    clipPath: 'inset(14% 0% 14% 0%)',
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
    scale: 1.12,
    clipPath: 'inset(100% 0% 0% 0%)',
  });

  const targetGrainOpacity = isMobile ? 0.04 : isTablet ? 0.055 : 0.08;

  // =========================================================================
  // TIMELINE 01 — THE DARKNESS (0.0s – 1.0s)
  // =========================================================================
  tl.addLabel('darkness', 0);
  tl.call(() => callbacks?.onPhaseChange?.('darkness'), undefined, 'darkness');

  tl.to(
    q('[data-intro="grain"]'),
    {
      opacity: targetGrainOpacity,
      duration: 0.75,
      ease: 'power1.out',
    },
    'darkness+=0.05'
  )
    .to(
      q('[data-intro="center-bloom"]'),
      {
        opacity: 0.92,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
      },
      'darkness+=0.12'
    )
    .to(
      q('[data-intro="center-core"]'),
      {
        opacity: 0.88,
        scale: 1,
        duration: 0.7,
        ease: 'power2.out',
      },
      'darkness+=0.18'
    )
    .to(
      q('[data-intro="skip-btn"]'),
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out',
      },
      'darkness+=0.42'
    );

  // =========================================================================
  // TIMELINE 02 — THE FABRIC AWAKENING (1.0s – 2.5s)
  // =========================================================================
  tl.addLabel('fabric', 1.0);
  tl.call(() => callbacks?.onPhaseChange?.('fabric'), undefined, 'fabric');

  tl.to(
    q('[data-intro="fabric-layer"]'),
    {
      opacity: 0.95,
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: 1.02,
      duration: 1.42,
      ease: 'power3.inOut',
    },
    'fabric'
  )
    .to(
      q('[data-intro="directional-light"]'),
      {
        opacity: 0.88,
        duration: 1.2,
        ease: 'power2.out',
      },
      'fabric+=0.2'
    )
    .to(
      q('[data-intro="center-core"]'),
      {
        opacity: 0,
        scale: 1.6,
        duration: 0.65,
        ease: 'power2.inOut',
      },
      'fabric+=0.15'
    )
    .to(
      q('[data-intro="center-bloom"]'),
      {
        opacity: 0.28,
        scale: 1.25,
        duration: 1.0,
        ease: 'power2.out',
      },
      'fabric+=0.25'
    );

  // =========================================================================
  // TIMELINE 03 — CRAFTSMANSHIP & TRAVELING LIGHT (2.5s – 3.5s)
  // =========================================================================
  tl.addLabel('craftsmanship', 2.5);
  tl.call(() => callbacks?.onPhaseChange?.('craftsmanship'), undefined, 'craftsmanship');

  if (!isMobile) {
    tl.to(
      q('[data-intro="craft-layer"]'),
      {
        opacity: 0.94,
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1.0,
        duration: 0.68,
        ease: 'power2.inOut',
      },
      'craftsmanship'
    )
      .to(
        q('[data-intro="craft-light-sweep"]'),
        {
          xPercent: 120,
          opacity: 0.72,
          duration: 0.95,
          ease: 'power1.inOut',
        },
        'craftsmanship+=0.08'
      )
      .to(
        q('[data-intro="fabric-layer"]'),
        {
          opacity: 0.34,
          duration: 0.6,
          ease: 'power2.inOut',
        },
        'craftsmanship+=0.1'
      )
      // Recede craftsmanship cleanly so shadowed burgundy silk cradles the NOIR® wordmark
      .to(
        q('[data-intro="craft-layer"]'),
        {
          opacity: 0,
          scale: 1.04,
          duration: 0.52,
          ease: 'power2.inOut',
        },
        'craftsmanship+=0.78'
      )
      .to(
        q('[data-intro="fabric-layer"]'),
        {
          opacity: 0.42,
          duration: 0.55,
          ease: 'power2.inOut',
        },
        'craftsmanship+=0.78'
      );
  } else {
    // Shorter, lighter mobile craftsmanship flash to maintain smooth 60fps & crisp pacing
    tl.to(
      q('[data-intro="craft-layer"]'),
      {
        opacity: 0.88,
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1.0,
        duration: 0.52,
        ease: 'power2.inOut',
      },
      'craftsmanship'
    )
      .to(
        q('[data-intro="craft-layer"]'),
        {
          opacity: 0,
          duration: 0.44,
          ease: 'power2.inOut',
        },
        'craftsmanship+=0.62'
      )
      .to(
        q('[data-intro="fabric-layer"]'),
        {
          opacity: 0.38,
          duration: 0.45,
          ease: 'power2.inOut',
        },
        'craftsmanship+=0.62'
      );
  }

  // =========================================================================
  // TIMELINE 04 — THE NOIR WORDMARK & SIGNATURE (3.5s – 5.2s)
  // =========================================================================
  tl.addLabel('wordmark', 3.5);
  tl.call(() => callbacks?.onPhaseChange?.('wordmark'), undefined, 'wordmark');

  tl.to(
    q('[data-intro="center-bloom"]'),
    {
      opacity: 0.44,
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
        opacity: 0.78,
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
        opacity: 0.65,
        duration: 0.65,
        ease: 'power2.out',
      },
      'wordmark+=0.38'
    );

  tl.addLabel('signature', 4.12);
  tl.call(() => callbacks?.onPhaseChange?.('signature'), undefined, 'signature');

  tl.to(
    q('[data-intro="descriptor"]'),
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.58,
      ease: 'power3.out',
    },
    'signature'
  ).to(
    q('[data-intro="tagline"]'),
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.62,
      ease: 'power3.out',
    },
    'signature+=0.26'
  );

  // =========================================================================
  // TIMELINE 05 — TRANSITION TO HOMEPAGE (5.25s – 6.95s)
  // =========================================================================
  tl.addLabel('transition', 5.25);
  tl.call(() => callbacks?.onPhaseChange?.('transition'), undefined, 'transition');

  tl.to(
    q('[data-intro="skip-btn"]'),
    {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    },
    'transition'
  )
    .to(
      q('[data-intro="wordmark-group"]'),
      {
        opacity: 0,
        y: -12,
        duration: 0.52,
        ease: 'power2.inOut',
      },
      'transition+=0.05'
    )
    // Burgundy silk expands upward to visually envelop the screen
    .to(
      q('[data-intro="transition-silk"]'),
      {
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1.0,
        duration: 0.74,
        ease: 'power3.inOut',
      },
      'transition+=0.08'
    )
    // Prepare & animate homepage hero right before the veil dissolves
    .call(
      () => {
        callbacks?.onRevealHomepage?.(false);
      },
      undefined,
      'transition+=0.74'
    )
    // Seamless dissolve of the full intro overlay directly into the pre-mounted homepage campaign
    .to(
      q('[data-intro="shell"]'),
      {
        opacity: 0,
        duration: 0.92,
        ease: 'power2.inOut',
      },
      'transition+=0.78'
    );

  return tl;
}

/**
 * Reduced-motion timeline: honors prefers-reduced-motion by bypassing extended
 * cinematic video masks and presenting a brief, serene static brand reveal
 * before transitioning cleanly to the homepage.
 */
export function createReducedMotionIntroTimeline(
  container: HTMLElement,
  callbacks?: IntroTimelineCallbacks
): gsap.core.Timeline {
  const q = gsap.utils.selector(container);

  gsap.set(q('[data-intro="shell"]'), { opacity: 1 });
  gsap.set(q('[data-intro="fabric-layer"]'), { opacity: 0.22, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
  gsap.set(q('[data-intro="craft-layer"]'), { opacity: 0 });
  gsap.set(q('[data-intro="transition-silk"]'), { opacity: 0 });
  gsap.set(q('[data-intro="grain"]'), { opacity: 0 });
  gsap.set(q('[data-intro="center-bloom"]'), { opacity: 0.35, scale: 1 });
  gsap.set(q('[data-intro="center-core"]'), { opacity: 0 });
  gsap.set(q('[data-intro="skip-btn"]'), { opacity: 1, y: 0 });
  gsap.set(q('[data-intro="wordmark-group"]'), { opacity: 0, y: 0 });
  gsap.set(q('[data-intro="wordmark-char"]'), { yPercent: 0, opacity: 1 });
  gsap.set(q('[data-intro="wordmark-reg"]'), { opacity: 0.78, y: 0 });
  gsap.set(q('[data-intro="gold-rule"]'), { scaleX: 1, opacity: 0.65 });
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
