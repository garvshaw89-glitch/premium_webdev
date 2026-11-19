export interface IntroMediaConfig {
  sareePullVideo: string;
  sareePullPoster: string;
  womanRotateVideo: string;
  womanRotatePoster: string;
  silkLandscapeVideo: string;
  silkLandscapePoster: string;
  silkPortraitVideo: string;
  silkPortraitPoster: string;
  craftsmanshipVideo: string;
  craftsmanshipPoster: string;
  heroDesktopVideo: string;
  heroDesktopPoster: string;
  heroMobileVideo: string;
  heroMobilePoster: string;
}

export const NOIR_INTRO_MEDIA: IntroMediaConfig = {
  sareePullVideo: '/media/entry-saree-pull.mp4',
  sareePullPoster: '/media/entry-saree-pull-poster.jpg',
  womanRotateVideo: '/media/entry-woman-rotate.mp4',
  womanRotatePoster: '/media/entry-woman-rotate-poster.jpg',
  silkLandscapeVideo: '/media/silk-landscape.mp4',
  silkLandscapePoster: '/media/silk-landscape-poster.jpg',
  silkPortraitVideo: '/media/silk-portrait.mp4',
  silkPortraitPoster: '/media/silk-portrait-poster.jpg',
  craftsmanshipVideo: '/media/craftsmanship-macro.mp4',
  craftsmanshipPoster: '/media/craftsmanship-macro-poster.jpg',
  heroDesktopVideo: '/media/hero-campaign-desktop.mp4',
  heroDesktopPoster: '/media/hero-campaign-desktop-poster.jpg',
  heroMobileVideo: '/media/hero-campaign-mobile.mp4',
  heroMobilePoster: '/media/hero-campaign-mobile-poster.jpg',
};

export interface CouturePiece {
  id: string;
  code: string;
  category: 'Menswear' | 'Womenswear' | 'Atelier Bespoke';
  title: string;
  subtitle: string;
  fabric: string;
  craftHours: string;
  priceInr: string;
  image: string;
  description: string;
}

export const NOIR_COLLECTION_PIECES: CouturePiece[] = [
  {
    id: 'bandhgala-01',
    code: 'Look 01',
    category: 'Menswear',
    title: 'Obsidian Raw Silk Bandhgala',
    subtitle: 'Hand-spun Murshidabad mulberry silk with antique dabka collar',
    fabric: '100% Raw Mulberry Silk · Hand-finished Horn Buttons',
    craftHours: '140 Atelier Hours',
    priceInr: '₹1,85,000',
    image: '/src/assets/images/noir_collection_menswear_1795090799888.jpg',
    description:
      'Architectural high-collar tailoring sculpted with zero shoulder bulk and bordered with muted antique gold zardozi along the mandarin neckline.',
  },
  {
    id: 'drape-02',
    code: 'Look 02',
    category: 'Womenswear',
    title: 'Deep Wine Banarasi Draped Saree',
    subtitle: 'Handwoven kadwa brocade silk sculpted into a single fluid silhouette',
    fabric: 'Handloom Katan Silk · Real Tested Antique Zari',
    craftHours: '260 Loom & Draping Hours',
    priceInr: '₹2,40,000',
    image: '/src/assets/images/noir_collection_womenswear_1795090808851.jpg',
    description:
      'Woven on traditional pit looms in Varanasi in our custom deep red-burgundy dye bath, then hand-finished in our Mumbai atelier for effortless movement.',
  },
  {
    id: 'sherwani-03',
    code: 'Look 03',
    category: 'Atelier Bespoke',
    title: 'Burgundy Velvet Zardozi Overcoat',
    subtitle: 'Micro-silk velvet embroidered with burnished metallic bullion',
    fabric: 'Silk-Viscose Heritage Velvet · Antique Bullion Work',
    craftHours: '380 Karigar Hours',
    priceInr: '₹3,95,000',
    image: '/src/assets/images/noir_collection_atelier_1795090798721.jpg',
    description:
      'Constructed exclusively to measure. Each motif is hand-drawn on parchment before master karigars lay individual metallic threads over deep wine pile.',
  },
];

export type NoirRoute = 'home' | 'collections' | 'atelier' | 'craft' | 'campaign';

export const NOIR_NAV_ITEMS: Array<{ route: NoirRoute; label: string }> = [
  { route: 'collections', label: 'Collections' },
  { route: 'atelier', label: 'Atelier' },
  { route: 'craft', label: 'Craft' },
  { route: 'campaign', label: 'Campaign' },
];
